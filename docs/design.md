# おこづかい管理アプリ 設計ドキュメント v1.0

対象：れい・じゅん兄弟（小学1年）向けデジタルおこづかい管理  
構成：Next.js 15 (App Router, TypeScript) + Tailwind CSS v4 / Vercel / Supabase

> **ビジュアル正典**：`docs/handoff/HANDOFF.md` + `docs/handoff/Okozukai-Home.html`  
> コンポーネントの命名はDBスキーマ（rei_blue / jun_red / parent_dark・spend / save / grow）を正とし、表層トークンのみ取り込む。

---

## 0. 技術前提（確定済み）

| 項目 | 結論 |
|---|---|
| パスキー認証 | Supabase Auth beta 正式対応（2026/5/28）。`signInWithPasskey()` は discoverable credential 方式でメール入力不要。`@supabase/supabase-js v2.105.0+` + experimental opt-in 必須 |
| パスキー登録 | 登録（`registerPasskey()`）はログイン済みセッションが前提。初回は親がブートストラップ（§5参照） |
| Supabase pause 回避 | 7日間 DB 非活動で自動停止。日次 cron が毎回 RPC を投げることでタイマーをリセット |
| Vercel Cron (Hobby) | 1日1回まで。満期判定は `matures_at <= now()` 比較。満期処理＋基本給支給を1本の cron に相乗り |
| PIN 認証 | パスキーログイン後、子供ごとに4桁 PIN でアプリ内ロック解除（`pgcrypto` で bcrypt ハッシュ保存） |

---

## 1. Supabase スキーマ

### 1.1 設計方針

- **家族（family）単位のマルチテナント**。RLS は「自分のデータ」または「同じ家族の親」で判定。
- **残高は 3 口座（spend / save / grow）を子供ごとに 1 行ずつ**保有。`accounts.balance` が正値。
- **お金の移動はすべて SECURITY DEFINER の RPC 経由**。`accounts` / `transactions` / `investment_lots` へのクライアント直接書込は RLS で禁止。
- `transactions` を**全移動の台帳（監査ログ）**として記録。

### 1.2 ER 概要

```
families ──< profiles ──< accounts         (spend / save / grow 各1行)
                │      ├─< transactions    (全お金移動の台帳)
                │      ├─< investment_lots (ふやすの30日タイマー単位)
                │      ├─< job_requests >── job_tasks
                │      └─< goals          (ほしいもの目標)
                └───── family_settings     (金利・満期日数・約束)
```

> `profiles.base_salary`（子供ごとの基本給）・`profiles.pin_hash`（PIN）・`profiles.avatar_url`・`profiles.mascot_url` は profiles テーブルに直接カラムとして持つ。

### 1.3 マイグレーション一覧

| ファイル | 内容 |
|---|---|
| `0001_init.sql` | 全テーブル・RLS・ヘルパー関数・`transfer_money` / `approve_job_request` RPC |
| `0002_monthly_salary.sql` | `pay_base_salary()`（cron 専用）・`vercel.json` cron 設定 |
| `0003_spend_money.sql` | `spend_money(p_profile_id, p_amount, p_memo)` RPC（親がダッシュボードから子の支出を記録） |
| `0004_job_requests_extras.sql` | `reject_job_request()` RPC・`job_requests` への `condition` カラム追加 |
| `0005_goals.sql` | `goals` テーブル・RLS（子は自分の行を直接 insert/update/delete 可） |
| `0006_per_child_salary.sql` | `profiles.base_salary`（子供ごと）・`profiles.mascot_url`・`pay_salary_now()` RPC（親が即時支給）・`pay_base_salary()` を `profiles.base_salary` 参照に更新 |
| `0007_pay_custom_amount.sql` | `pay_custom_amount(p_profile_id, p_amount)` RPC（親が任意額を即時支給） |
| `0008_get_family_job_requests.sql` | `get_family_job_requests()` RPC（親が家族全員の申請を取得） |
| `0009_fix_get_family_job_requests.sql` | 上記の戻り型修正 |
| `0010_pin_auth.sql` | `profiles.pin_hash`・`set_pin()` / `verify_pin()` RPC（pgcrypto bcrypt） |
| `0011_fix_pin_functions.sql` | PIN 関数の search_path / 権限修正 |
| `0012_verify_pin_for.sql` | `verify_pin_for(p_profile_id, p_pin)` RPC（他ユーザーの PIN 検証。ユーザー切替時に使用） |
| `0013_get_family_members.sql` | `get_family_members()` RPC（家族メンバー一覧＋PINハッシュ有無フラグを返す） |
| `0014_fix_get_family_members.sql` | 上記の戻り型修正 |
| `0015_storage_avatars_rls.sql` | `avatars` Storage バケットの RLS ポリシー（家族内読取・親のみ書込） |

### 1.4 テーブル定義（主要カラムのみ）

```sql
-- 家族
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- プロフィール（auth.users と 1:1）
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  family_id   uuid not null references public.families(id),
  role        text not null check (role in ('parent','child')),
  display_name text not null,
  theme_key   text not null default 'parent_dark'
                check (theme_key in ('rei_blue','jun_red','parent_dark')),
  avatar_url  text,
  mascot_url  text,
  base_salary integer not null default 0,   -- 子供ごとの基本給（月1回支給）
  pin_hash    text,                          -- bcrypt ハッシュ（null = PIN未設定）
  created_at  timestamptz not null default now()
);

-- 3つの口座
create table public.accounts (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('spend','save','grow')),
  balance    integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  unique (profile_id, kind)
);

-- 台帳
create table public.transactions (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('salary','job_reward','transfer','interest','spend')),
  amount     integer not null,
  from_kind  text check (from_kind in ('spend','save','grow')),
  to_kind    text check (to_kind   in ('spend','save','grow')),
  memo       text,
  created_at timestamptz not null default now()
);

-- 投資ロット（ふやす30日タイマー）
create table public.investment_lots (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  principal       integer not null check (principal > 0),
  interest_rate   numeric(5,4) not null,
  interest_amount integer not null,
  started_at      timestamptz not null default now(),
  matures_at      timestamptz not null,
  status          text not null default 'active' check (status in ('active','matured')),
  matured_at      timestamptz
);

-- お仕事マスタ
create table public.job_tasks (
  id        uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name      text not null,
  reward    integer not null check (reward >= 0),
  condition text,          -- できたら申請の条件（任意）
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- お仕事申請
create table public.job_requests (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  task_id         uuid not null references public.job_tasks(id),
  reward_snapshot integer not null,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at    timestamptz not null default now(),
  decided_at      timestamptz,
  decided_by      uuid references public.profiles(id)
);

-- 家族設定
create table public.family_settings (
  family_id       uuid primary key references public.families(id) on delete cascade,
  base_salary     integer not null default 0,    -- 旧フィールド（profiles.base_salaryに移行済み）
  investment_rate numeric(5,4) not null default 0.0200,
  maturity_days   integer not null default 30,
  promises        jsonb not null default '[]'::jsonb,
  updated_at      timestamptz not null default now()
);

-- 目標（ほしいもの）
create table public.goals (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  target     integer not null check (target > 0),
  active     boolean not null default false,
  image_url  text,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
```

### 1.5 ヘルパー関数

```sql
-- RLS 再帰回避のため SECURITY DEFINER
create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'parent');
$$;

create or replace function public.my_family_id()
returns uuid language sql stable security definer set search_path = public as $$
  select family_id from public.profiles where id = auth.uid();
$$;
```

### 1.6 RLS ポリシー方針

| テーブル | 読取 | 書込 |
|---|---|---|
| `profiles` | 自分 or 同family親 | 自分 or 同family親（update のみ） |
| `accounts` | 自分 or 同family親 | **クライアント禁止**（RPC 経由のみ） |
| `transactions` | 自分 or 同family親 | **クライアント禁止** |
| `investment_lots` | 自分 or 同family親 | **クライアント禁止** |
| `job_tasks` | 同family全員 | 親のみ（直接 insert/update/delete 可） |
| `job_requests` | 自分 or 同family親 | 子が pending で insert、承認/却下は RPC 経由 |
| `family_settings` | 同family全員 | 親のみ（直接 update 可） |
| `goals` | 自分 or 同family親 | 子が自分の行を直接 insert/update/delete 可 |

### 1.7 主要 RPC 一覧

| RPC | 呼び出し元 | 概要 |
|---|---|---|
| `transfer_money(p_from, p_to, p_amount)` | 子（authenticated） | 口座間振替。grow は出金ロック。→grow 時にロット生成 |
| `approve_job_request(p_request_id)` | 親（authenticated） | 承認 → spend に入金 |
| `reject_job_request(p_request_id)` | 親（authenticated） | 却下のみ（残高操作なし） |
| `spend_money(p_profile_id, p_amount, p_memo)` | 親（authenticated） | 子の spend から支出記録（ダッシュボードから操作） |
| `pay_salary_now(p_profile_id)` | 親（authenticated） | profiles.base_salary を即時支給 |
| `pay_custom_amount(p_profile_id, p_amount)` | 親（authenticated） | 任意額を spend に即時支給 |
| `pay_base_salary()` | cron（service role） | 毎月1日に全子供へ基本給支給 |
| `process_matured_investments()` | cron（service role） | matures_at <= now() のロットを満期処理（grow→save） |
| `set_pin(p_profile_id, p_pin)` | 親 or 本人 | PIN を bcrypt ハッシュ化して保存 |
| `verify_pin(p_pin)` | 本人 | 自分の PIN 検証 |
| `verify_pin_for(p_profile_id, p_pin)` | 親 | 他ユーザーの PIN 検証（ユーザー切替時） |
| `get_family_job_requests()` | 親 | 家族全員の申請一覧を返す |
| `get_family_members()` | 親 | 家族メンバー一覧 + has_pin フラグを返す |

### 1.8 Storage（avatars バケット）

- **バケット名：`avatars`**（非公開）
- **パス：`avatars/{family_id}/{profile_id}.png`**
- 読取：認証済みかつ同family。書込：親のみ。
- avatar_url は `https://` URL のみ `profiles.avatar_url` に保存（data: URL は localStorage QuotaExceeded 防止のため除外）。

---

## 2. Vercel Cron 日次バッチ

```json
// vercel.json
{ "crons": [{ "path": "/api/cron/daily", "schedule": "0 0 * * *" }] }
```

`src/app/api/cron/daily/route.ts` が `CRON_SECRET` を検証後、service role クライアントで以下を順に実行：

1. `process_matured_investments()` — 満期ロットを grow → save に移動
2. `pay_base_salary()` — 毎月1日のみ基本給支給

この RPC 呼び出し自体が Supabase の pause 回避クエリを兼ねる。

---

## 3. Next.js ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # ユーザー選択（れい/じゅん/おや）→ パスキー認証
│   │   └── parent-login/page.tsx   # 親：email + password
│   │
│   ├── (child)/                    # パスキー + PIN 認証必須
│   │   ├── layout.tsx              # FrameDecoration + ChildHeader + BottomNav/SideNav
│   │   ├── home/page.tsx           # BalanceCard ×3（spend/save/grow）+ Mascot
│   │   ├── transfer/page.tsx       # 口座間振替（TransferAnimation）
│   │   ├── grow/page.tsx           # GrowHintBanner + LotCard 一覧 + あずけるボタン
│   │   ├── goals/page.tsx          # GoalCard 一覧 + GoalCelebration + 追加フォーム
│   │   ├── jobs/page.tsx           # JobCard 一覧 + 申請（ConditionPopup）
│   │   ├── history/page.tsx        # 支出履歴一覧
│   │   └── rules/page.tsx          # RuleCard（固定ルール + family_settings.promises）
│   │
│   ├── (parent)/                   # 親専用（ダークUI）
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx      # KpiCard ×4 + ChildSummaryCard + WeeklyMiniGraph
│   │   ├── approvals/page.tsx      # ApprovalCard 一覧（承認/却下）
│   │   ├── activity/page.tsx       # 家族全体の活動ログ
│   │   ├── avatars/page.tsx        # アバター・マスコット画像アップロード（Storage）
│   │   ├── settings/page.tsx       # 基本給・金利・満期日数・今すぐ支給
│   │   ├── settings/jobs/page.tsx  # お仕事マスタ CRUD
│   │   ├── settings/promises/page.tsx # やくそく CRUD
│   │   └── setup/page.tsx          # 子のパスキー登録ブートストラップ
│   │
│   └── api/
│       ├── cron/daily/route.ts     # Vercel Cron（満期処理 + 基本給）
│       └── admin/create-child/route.ts  # 子アカウント作成（service role）
│
├── components/
│   ├── child/
│   │   ├── BalanceCard.tsx         # spend/save/grow の残高カード（featured/compact）
│   │   ├── BottomNav.tsx           # モバイル下部ナビ
│   │   ├── SideNav.tsx             # タブレット左サイドナビ
│   │   ├── ChildHeader.tsx         # アバター + 名前 + BalanceBadge（もってる）
│   │   ├── FrameDecoration.tsx     # テーマ別背景装飾（rei=水彩ブロブ / jun=ハーフトーン）
│   │   ├── Coin.tsx / CoinRow.tsx  # コインアイコン（themeKey で金色variant切替）
│   │   ├── GoalCard.tsx            # 目標カード（プログレス + たっせいボタン）
│   │   ├── GoalCelebration.tsx     # 目標達成コンフェッティオーバーレイ
│   │   ├── GrowHintBanner.tsx      # ふやすページ最上部ヒント帯
│   │   ├── JobCard.tsx             # お仕事カード（申請 + ConditionPopup）
│   │   ├── LotCard.tsx             # 投資ロットカード（M/D〜 日付バッジ + 進捗）
│   │   ├── Mascot.tsx              # マスコット表示
│   │   ├── RuleCard.tsx            # ルール表示カード
│   │   ├── RubyText.tsx            # ルビ付きテキスト
│   │   ├── TransferAnimation.tsx   # 振替完了アークアニメーション
│   │   ├── ConditionPopup.tsx      # お仕事の条件説明ポップアップ
│   │   └── ConfirmPopup.tsx        # 確認ダイアログ（ふやすロック警告等）
│   │
│   ├── parent/
│   │   ├── ApprovalCard.tsx        # 承認待ちカード
│   │   ├── ChildSummaryCard.tsx    # ダッシュボードの子供サマリ
│   │   ├── KpiCard.tsx             # KPI 表示カード
│   │   ├── SpendForm.tsx           # 支出記録フォーム
│   │   ├── WeeklyMiniGraph.tsx     # 週次貯金グラフ（div実装、rei/jun 2系列）
│   │   └── SettingRow.tsx          # 設定行コンポーネント
│   │
│   └── ui/
│       ├── LoadingScreen.tsx       # ローディング表示
│       ├── PinGate.tsx             # PIN 認証ゲート（子供ページ全体をラップ）
│       ├── PinScreen.tsx           # PIN 入力画面
│       ├── UserSwitchModal.tsx     # ユーザー切替モーダル
│       ├── PullToRefresh.tsx       # プルトゥリフレッシュ
│       └── ThemeToggleMock.tsx     # 開発用テーマ切替トグル
│
├── hooks/
│   ├── useProfile.ts               # ログイン中プロフィール
│   ├── useAccounts.ts              # 残高3口座（未ログイン時 null）
│   ├── useGoals.ts                 # 目標一覧
│   ├── useInvestmentLots.ts        # 投資ロット（startedAt 含む）
│   ├── useJobCatalog.ts            # お仕事マスタ（子供用・参照のみ）
│   ├── useJobCatalogAdmin.ts       # お仕事マスタ（親用・CRUD）
│   ├── useJobRequests.ts           # 自分の申請一覧（子）/ 家族の申請一覧（親）
│   ├── useTransactions.ts          # 支出履歴
│   ├── useFamilyOverview.ts        # ダッシュボード横断集計
│   ├── useFamilySettings.ts        # family_settings
│   ├── useFamilyMembers.ts         # 家族メンバー一覧（ユーザー切替用）
│   └── useFamilyActivity.ts        # 家族全体の活動ログ
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # ブラウザ用（passkey experimental opt-in）
│   │   ├── server.ts               # Server Component / Route Handler 用
│   │   └── admin.ts                # service role（cron + 子アカウント作成専用）
│   ├── auth/passkey.ts             # signInWithPasskey / registerPasskey ラッパ
│   ├── money/rpc.ts                # 全 RPC 呼び出しラッパ
│   ├── goals/api.ts                # goals テーブル直接操作（addGoal等）
│   ├── theme/
│   │   ├── themes.ts               # ThemeKey 型（rei_blue / jun_red / parent_dark）
│   │   ├── childTheme.ts           # ChildTheme オブジェクト定義（全視覚トークン）
│   │   └── MockChildThemeContext.tsx # 開発用テーマ切替 Context
│   └── mock/                       # 未ログイン時フォールバック用モックデータ
│       ├── MockProviders.tsx
│       ├── MockBalancesContext.tsx
│       ├── MockGoalsContext.tsx
│       ├── MockJobsContext.tsx
│       ├── MockSettingsContext.tsx
│       ├── MockAvatarsContext.tsx
│       ├── MockMascotContext.tsx
│       └── investLots.ts / jobCatalog.ts / jobsMock.ts / rulesMock.ts
│
├── middleware.ts                    # セッション更新 + 親ルート保護
└── types/db.ts                     # supabase gen types 生成ファイル
```

---

## 4. テーマシステム

### 4.1 ThemeKey とトークン

3テーマを `src/lib/theme/childTheme.ts` の `ChildTheme` オブジェクトで管理。CSS 変数ではなく **inline style** で各コンポーネントに注入（Tailwind ビルドを分けない）。

| ThemeKey | テイスト | フォント |
|---|---|---|
| `rei_blue` | 水彩トロピカル・大角丸・やわ影 | Zen Maru Gothic |
| `jun_red` | アメコミ・太黒枠・ハード影 | RocknRoll One |
| `parent_dark` | ダークグレー管理UI | システムフォント |

### 4.2 主なトークン

```ts
interface ChildTheme {
  fontFamily: string;
  headingWeight: number;
  frameBg: string;          // ページ背景グラデーション
  ink: string;              // メインテキスト色
  sub: string;              // サブテキスト色
  accent: string;           // アクセント色
  accentInk: string;        // アクセントの文字色
  cardBg: string;
  cardRadius: number;
  cardShadow: string;
  cardBorder: string;       // jun = "3px solid #111"、rei = "none"
  progressTrack: string;
  progressFill: string;     // ためる用プログレス
  progressFillGrow: string; // ふやす用プログレス（緑系）
  navActive: string;
  navActiveBg: string;
  navIdle: string;
  coin: "gold-soft" | "gold-hard" | "none";
}
```

### 4.3 背景装飾（FrameDecoration）

`src/components/child/FrameDecoration.tsx` が `themeKey` に応じて `position:absolute; z-index:0` の装飾を描画：

- **rei_blue**：4つの半透明水彩ブロブ（`filter:blur`）
- **jun_red**：ハーフトーン dot pattern（`radial-gradient`）+ コーナーバースト（`repeating-conic-gradient`）
- **parent_dark**：なし

---

## 5. 認証フロー

### 5.1 子供ログイン（パスキー + PIN）

```
/login → ユーザー選択タイル（れい/じゅん）
       → signInWithPasskey()（生体認証）
       → PinGate が PIN 入力を要求（pin_hash が設定されている場合）
       → /home
```

### 5.2 親ログイン

```
/parent-login → email + password
             → signInWithPassword()
             → /dashboard
```

### 5.3 ユーザー切替（同一端末）

ログイン中に `UserSwitchModal` から別ユーザーを選択 → 対象が子供なら `verify_pin_for()` で PIN 検証 → `signInWithPasskey()` で切替。

### 5.4 子アカウント初回セットアップ（親が行う）

1. `/setup` で子の display_name / theme_key を入力
2. `POST /api/admin/create-child` が service role で `auth.admin.createUser()` + profiles / accounts（×3）/ family_settings を作成
3. 同 `/setup` 画面で `registerPasskey()` を実行（子の端末で生体認証を登録）
4. 任意で PIN を設定（`set_pin()` RPC）

---

## 6. Dual-mode（実DB / モック）パターン

すべての子供向けページは「実ログイン済みなら実 DB、未ログインならモック Context」という dual-mode で実装されている。フック側で `null` を返すと各ページがモックにフォールバックする。

```ts
// 典型パターン
const { accounts, loading } = useAccounts();   // 未ログイン → null
const mockBalances = useMockBalances().balances[themeKey];
const balances = accounts ?? mockBalances;      // null のときモック使用
```

これにより **Supabase 接続なしで全画面のモックデモが動く**。

---

## 7. 環境変数

| 変数 | 用途 | 公開可否 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 共通 | 公開可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ブラウザ/SSR | 公開可 |
| `SUPABASE_SERVICE_ROLE_KEY` | cron + 子アカウント作成 | **サーバ専用・厳秘** |
| `CRON_SECRET` | cron Route Handler の認証 | **サーバ専用・厳秘** |

---

## 8. 絶対に守る制約

1. **お金が動く操作**（残高変更・振替・お仕事承認・満期処理・基本給）は **SECURITY DEFINER の RPC 経由のみ**。`accounts` / `transactions` / `investment_lots` へのクライアント直接書込ポリシーを追加しない。
2. **RLS は全テーブルで有効**。判定ヘルパーは `is_parent()` / `my_family_id()`（再帰回避）を使う。
3. **`SUPABASE_SERVICE_ROLE_KEY` と `CRON_SECRET` はサーバ専用**。`NEXT_PUBLIC_*`・クライアントバンドル・ログ・git に絶対出さない。
4. **パスキーは beta 機能**。実装変更時は公式 docs でフラグ名・API 形を再確認（記憶で書かない）。
5. **Cron は 1日1回まで**（Hobby 制約）。1本の cron に全バッチを相乗りさせる。
6. **「ふやす」は満期までロック**（早期引き出し不可）が初期仕様。変更は要相談。

---

## 9. 今後の拡張候補（v1.1 以降）

- **push 通知**：お仕事承認・満期到達を子供にプッシュ
- **貯金グラフの実データ化**：`transactions` の週次集計をダッシュボードに表示
- **目標達成時の自動処理**：save 残高 ≥ target 時に自動で「たっせい」記録を transaction に残す
- **複数家族対応**：現状 1 家族前提。family_id RLS がそのまま使えるため追加コストは小さい
- **「ふやす」早期引き出し**：利息放棄で引き出し可にするオプション（`transfer_money` の grow ロックを解除するだけ）
