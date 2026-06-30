# おこづかい管理アプリ 設計提案（フェーズ1）

対象：れい（スティッチ風 / ハワイアンブルー＆ネイビー）・じゅん（スパイダーマン風 / レッド＆ブルー）兄弟向け
構成：Next.js (App Router) + Tailwind CSS / Vercel / Supabase（DB・Auth・Storage）

> 子供向けUIのビジュアル正典は `docs/handoff/HANDOFF.md` ＋ `docs/handoff/Okozukai-Home.html`（命名はDBスキーマのrei_blue/jun_red/parent_dark・spend/save/growを正とし、表層トークンのみ取り込む。詳細は両ファイル参照）。

---

## 0. 設計前に確定した技術的前提（2026年6月時点・調査済み）

| 項目 | 結論 | 設計への影響 |
|---|---|---|
| パスキー認証 | Supabase Auth が beta で正式対応（2026/5/28）。`signInWithPasskey()` は discoverable credential 方式でメール入力不要 | 子供の「文字入力なしログイン」を実現可能。ただし **experimental opt-in が必要**、`@supabase/supabase-js v2.105.0+` 必須 |
| パスキー登録 | 登録（`registerPasskey()`）は **ログイン済みセッションが前提** | 子供の初回パスキー登録は **親がブートストラップ**する動線が必要（後述 §5） |
| 無料枠 pause | 7日間 DB 非活動で自動停止。**UIアクセスでなく実DBクエリ**でタイマーがリセット | 日次バッチが毎回 RPC（実クエリ）を投げる設計で回避可能 |
| Vercel Cron (Hobby) | **1日1回まで**。起動は指定「時」内に分散（時刻ピッタリではない） | 満期判定は `matures_at <= now()` 比較。基本給支給も同じ日次cronに相乗りさせる |

> 注：パスキーは beta のため opt-in フラグ名や挙動が変わる可能性があります。実装直前に公式docsで再確認してください。

---

## 1. Supabase スキーマ設計（RLS・Storage 含む）

### 1.1 設計方針

- **家族（family）単位のマルチテナント**。親と兄弟は同じ `family_id` を共有し、RLS は「自分のデータ」または「同じ家族の親」で判定。
- **残高は3つの口座（つかう/ためる/ふやす）を各子供が1行ずつ保有**し、`accounts.balance` を正とする。
- **お金の移動はすべて SECURITY DEFINER の RPC 経由**にし、テーブルへの直接 INSERT/UPDATE はクライアントに開放しない。これにより「残高マイナス」「台帳の不整合」「他人の残高改ざん」を構造的に防止。
- **`transactions` を台帳（監査ログ）**として全移動を記録。

### 1.2 ER 概要

```
families ──< profiles ──< accounts        (つかう/ためる/ふやす)
                 │     ├─< transactions     (全お金移動の台帳)
                 │     ├─< investment_lots  (ふやすの30日タイマー単位)
                 │     └─< job_requests >── job_tasks
                 └──── family_settings      (基本給・金利・満期日数・約束)
```

### 1.3 テーブル定義（SQL）

```sql
-- 家族
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- プロフィール（auth.users と 1:1）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id),
  role text not null check (role in ('parent','child')),
  display_name text not null,                       -- れい / じゅん / おとうさん
  theme_key text not null default 'parent_dark'
    check (theme_key in ('rei_blue','jun_red','parent_dark')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 3つの口座（子供ごとに spend/save/grow の3行）
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('spend','save','grow')), -- つかう/ためる/ふやす
  balance integer not null default 0 check (balance >= 0),    -- 円（整数）
  updated_at timestamptz not null default now(),
  unique (profile_id, kind)
);

-- 台帳（全お金移動の記録）
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('salary','job_reward','transfer','interest')),
  amount integer not null,
  from_kind text check (from_kind in ('spend','save','grow')),
  to_kind   text check (to_kind   in ('spend','save','grow')),
  memo text,
  created_at timestamptz not null default now()
);

-- 投資ロット（ふやすへ移動した金額ごとの30日タイマー）
create table public.investment_lots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  principal integer not null check (principal > 0),  -- 元本
  interest_rate numeric(5,4) not null,               -- 0.1000 = 10%（作成時にスナップショット）
  interest_amount integer not null,                  -- 満期に付与する利息（作成時に確定）
  started_at timestamptz not null default now(),
  matures_at timestamptz not null,                   -- started_at + maturity_days
  status text not null default 'active' check (status in ('active','matured')),
  matured_at timestamptz
);

-- お仕事マスタ（親が単価設定）
create table public.job_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,                  -- へやのかたづけ / せんたくもののかたづけ
  reward integer not null check (reward >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- お仕事申請（子→親承認）
create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade, -- 申請した子
  task_id uuid not null references public.job_tasks(id),
  reward_snapshot integer not null,    -- 申請時点の単価を固定
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles(id)
);

-- 家族ごとのパラメータ＆約束
create table public.family_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  base_salary integer not null default 0,        -- 基本給（円）
  salary_weekday integer not null default 1,     -- 0=日 .. 6=土（基本給の支給曜日）
  investment_rate numeric(5,4) not null default 0.1000,  -- 投資金利
  maturity_days integer not null default 30,     -- 満期日数
  promises jsonb not null default '[]'::jsonb,   -- ぜったいのやくそく（ひらがな配列）
  updated_at timestamptz not null default now()
);

-- 目標（ほしいもの）。0005_goals.sqlで追加。お金は動かさないため
-- 子が自分の行を直接insert/update/deleteできるRLSにする（RPC不要）。
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  target integer not null check (target > 0),
  active boolean not null default false,           -- 1人につき常に高々1件がtrue（「いま ためてる」）
  image_url text,
  position integer not null default 0,             -- 並び順（子が↑↓で入れ替える）
  created_at timestamptz not null default now()
);
```

### 1.4 ヘルパー関数（RLS 再帰回避のため SECURITY DEFINER）

`profiles` の RLS の中で `profiles` を参照すると無限再帰になるため、RLS をバイパスする SECURITY DEFINER 関数で判定する（Supabase の定番パターン）。

```sql
create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'parent'
  );
$$;

create or replace function public.my_family_id()
returns uuid language sql stable security definer set search_path = public as $$
  select family_id from public.profiles where id = auth.uid();
$$;
```

### 1.5 RLS ポリシー

```sql
alter table public.families         enable row level security;
alter table public.profiles         enable row level security;
alter table public.accounts         enable row level security;
alter table public.transactions     enable row level security;
alter table public.investment_lots  enable row level security;
alter table public.job_tasks        enable row level security;
alter table public.job_requests     enable row level security;
alter table public.family_settings  enable row level security;

-- profiles：自分 or 同じ家族の親
create policy "profiles_select" on public.profiles for select
  using ( id = auth.uid() or (is_parent() and family_id = my_family_id()) );
create policy "profiles_update" on public.profiles for update
  using ( id = auth.uid() or (is_parent() and family_id = my_family_id()) );

-- accounts：参照のみ開放。書込は RPC / service role 経由のみ（INSERT/UPDATE ポリシーを作らない）
create policy "accounts_select" on public.accounts for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

-- transactions：参照のみ
create policy "tx_select" on public.transactions for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

-- investment_lots：参照のみ
create policy "lots_select" on public.investment_lots for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );

-- job_tasks：家族内は閲覧、変更は親のみ
create policy "tasks_select" on public.job_tasks for select
  using ( family_id = my_family_id() );
create policy "tasks_write_parent" on public.job_tasks for all
  using      ( is_parent() and family_id = my_family_id() )
  with check ( is_parent() and family_id = my_family_id() );

-- job_requests：参照=自分/親、申請=子(自分)、承認=親（RPC経由）
create policy "req_select" on public.job_requests for select
  using ( profile_id = auth.uid()
       or (is_parent() and profile_id in
            (select id from public.profiles where family_id = my_family_id())) );
create policy "req_insert_child" on public.job_requests for insert
  with check ( profile_id = auth.uid() and status = 'pending' );

-- family_settings：家族内閲覧、変更は親のみ
create policy "settings_select" on public.family_settings for select
  using ( family_id = my_family_id() );
create policy "settings_update_parent" on public.family_settings for update
  using ( is_parent() and family_id = my_family_id() );
```

> ポイント：`accounts` / `transactions` / `investment_lots` に **書込ポリシーをあえて作らない**ことで、クライアントからの直接改ざんを禁止。お金が動くのは下記 RPC か、cron の service role からのみ。

### 1.6 主要ロジック（お金の移動 RPC）

**① 口座間振替（子が自分のお金を動かす）**

```sql
create or replace function public.transfer_money(p_from text, p_to text, p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_profile uuid := auth.uid();
  v_rate numeric; v_days integer;
begin
  if p_amount <= 0     then raise exception 'amount must be positive'; end if;
  if p_from = p_to     then raise exception 'same account';           end if;
  -- ふやす は満期までロック（§4 の判断ポイント参照。早期引き出しを許すならこの行を外す）
  if p_from = 'grow'   then raise exception 'grow is locked';         end if;

  -- 出金（残高不足ならここで弾く）
  update public.accounts set balance = balance - p_amount, updated_at = now()
   where profile_id = v_profile and kind = p_from and balance >= p_amount;
  if not found then raise exception 'insufficient balance'; end if;

  -- 入金
  update public.accounts set balance = balance + p_amount, updated_at = now()
   where profile_id = v_profile and kind = p_to;

  insert into public.transactions(profile_id, type, amount, from_kind, to_kind)
  values (v_profile, 'transfer', p_amount, p_from, p_to);

  -- つかう→ふやす なら30日タイマー（ロット）を作成
  if p_to = 'grow' then
    select s.investment_rate, s.maturity_days into v_rate, v_days
      from public.family_settings s
      join public.profiles pr on pr.family_id = s.family_id
     where pr.id = v_profile;

    insert into public.investment_lots(profile_id, principal, interest_rate, interest_amount, matures_at)
    values (v_profile, p_amount, v_rate, floor(p_amount * v_rate),
            now() + (v_days || ' days')::interval);
  end if;
end;
$$;
grant execute on function public.transfer_money(text,text,integer) to authenticated;
```

**② お仕事承認（親）→「つかう」へ入金**

```sql
create or replace function public.approve_job_request(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not is_parent() then raise exception 'forbidden'; end if;

  select * into r from public.job_requests where id = p_request_id and status = 'pending';
  if not found then raise exception 'request not found'; end if;
  if not exists (select 1 from public.profiles
                 where id = r.profile_id and family_id = my_family_id())
    then raise exception 'forbidden'; end if;

  update public.job_requests
     set status='approved', decided_at=now(), decided_by=auth.uid()
   where id = p_request_id;

  update public.accounts set balance = balance + r.reward_snapshot, updated_at = now()
   where profile_id = r.profile_id and kind = 'spend';   -- 入金はすべて「つかう」へ

  insert into public.transactions(profile_id, type, amount, to_kind, memo)
  values (r.profile_id, 'job_reward', r.reward_snapshot, 'spend', 'おしごと しょうにん');
end;
$$;
grant execute on function public.approve_job_request(uuid) to authenticated;
```

**③ 満期処理（cron が service role で呼ぶ）→ 元本+利息を「ためる」へ**

```sql
create or replace function public.process_matured_investments()
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer := 0; lot record;
begin
  for lot in
    select * from public.investment_lots
     where status = 'active' and matures_at <= now()
     for update
  loop
    update public.accounts set balance = balance - lot.principal, updated_at = now()
     where profile_id = lot.profile_id and kind = 'grow';
    update public.accounts set balance = balance + lot.principal + lot.interest_amount, updated_at = now()
     where profile_id = lot.profile_id and kind = 'save';

    update public.investment_lots set status='matured', matured_at=now() where id = lot.id;

    insert into public.transactions(profile_id, type, amount, from_kind, to_kind, memo)
    values (lot.profile_id, 'interest', lot.principal + lot.interest_amount, 'grow', 'save', 'まんき！りそく');
    cnt := cnt + 1;
  end loop;
  return cnt;     -- 0件でもこの SELECT 自体が pause 回避の活動になる
end;
$$;
```

**④ 基本給支給（cron が支給曜日に呼ぶ）**

```sql
create or replace function public.pay_base_salary()
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer := 0; rec record;
begin
  for rec in
    select p.id as profile_id, s.base_salary
      from public.profiles p
      join public.family_settings s on s.family_id = p.family_id
     where p.role = 'child' and s.base_salary > 0
       and extract(dow from (now() at time zone 'Asia/Tokyo')) = s.salary_weekday
  loop
    update public.accounts set balance = balance + rec.base_salary, updated_at = now()
     where profile_id = rec.profile_id and kind = 'spend';
    insert into public.transactions(profile_id, type, amount, to_kind, memo)
    values (rec.profile_id, 'salary', rec.base_salary, 'spend', 'きほんきゅう');
    cnt := cnt + 1;
  end loop;
  return cnt;
end;
$$;
```

> ③④はクライアントに `grant` せず、cron の **service role キー**からのみ呼ぶ。

### 1.7 Storage（バケット）設計

- **バケット名：`avatars`**（キャラクター/アイコン画像）
- **パス規約：`avatars/{family_id}/{profile_id}.png`** … 上書き更新が自然で、家族単位の整理もしやすい
- **書込は親のみ／読取は family 内**（プライバシー重視なら非公開＋署名URL推奨）

```sql
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);

-- 読取：認証済みかつ自分の家族のフォルダのみ（署名URL or createSignedUrl で表示）
create policy "avatars_read" on storage.objects for select
  using ( bucket_id = 'avatars'
          and (storage.foldername(name))[1] = my_family_id()::text );

-- 書込/更新：親のみ
create policy "avatars_write_parent" on storage.objects for insert
  with check ( bucket_id = 'avatars' and public.is_parent()
               and (storage.foldername(name))[1] = my_family_id()::text );
create policy "avatars_update_parent" on storage.objects for update
  using ( bucket_id = 'avatars' and public.is_parent()
          and (storage.foldername(name))[1] = my_family_id()::text );
```

> トレードオフ：`public: true` の公開バケットにすると `<img src>` がそのまま使えて実装は楽ですが、URLを知れば誰でも見られます。家族写真ではなくキャラクター画像なので公開でも実害は小さい一方、子供のアプリという性質上は**非公開＋署名URL**を推奨しました。どちらにするかは §4 で要判断。

---

## 2. Vercel Cron 日次バッチ

### 2.1 `vercel.json`

```json
{
  "crons": [
    { "path": "/api/cron/daily", "schedule": "0 0 * * *" }
  ]
}
```

- `0 0 * * *` = 毎日 00:00 **UTC**（= 09:00 JST）。
- Hobby は1日1回が上限。起動は 00:00〜00:59 UTC の間に分散されるため、**満期判定は時刻ではなく `matures_at <= now()` で行う**（§1.6③で対応済み）。
- 1本のcronで「満期処理＋基本給＋pause回避」を兼ねるのが、Hobby制約下では最も効率的。

### 2.2 Route Handler（`src/app/api/cron/daily/route.ts`）

```ts
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';        // service role を使うため Edge 不可
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel Cron が自動付与する Authorization: Bearer <CRON_SECRET> を検証
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();   // service role（RLS バイパス）

  // ① 満期投資 → 元本+利息を「ためる」へ
  const { data: matured, error: e1 } = await supabase.rpc('process_matured_investments');
  // ② 基本給：支給曜日なら支給
  const { data: paid, error: e2 } = await supabase.rpc('pay_base_salary');
  // ↑ この実クエリ自体が「DBアクセス」となり、無料枠の7日pauseを回避する

  if (e1 || e2) return Response.json({ ok: false, e1, e2 }, { status: 500 });
  return Response.json({ ok: true, matured, paid, ranAt: new Date().toISOString() });
}
```

### 2.3 service role クライアント（`src/lib/supabase/admin.ts`）

```ts
// ★サーバ専用。SUPABASE_SERVICE_ROLE_KEY は絶対にクライアントへ出さない
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

**必要な環境変数**

| 変数 | 用途 | 公開可否 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 共通 | 公開可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ブラウザ/SSR | 公開可 |
| `SUPABASE_SERVICE_ROLE_KEY` | cron バッチ | **サーバ専用・厳秘** |
| `CRON_SECRET` | cron 認証 | **サーバ専用・厳秘**（16文字以上のランダム） |

---

## 3. Next.js `src/` ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/                       # 未ログイン領域
│   │   ├── layout.tsx
│   │   ├── login/page.tsx            # ユーザー選択（れい/じゅん/おや）→ パスキー
│   │   └── parent-login/page.tsx     # 親：email + password（ダークUI）
│   │
│   ├── (child)/                      # 子供用（パスキー認証必須）
│   │   ├── layout.tsx                # ThemeProvider + ヘッダー(名前/アバター) + ボトムナビ
│   │   ├── home/page.tsx             # つかう/ためる/ふやす 残高カード
│   │   ├── transfer/page.tsx         # 箱から箱への振替
│   │   ├── grow/page.tsx             # 投資状況：ロット別カウントダウン/プログレスバー
│   │   ├── jobs/page.tsx             # お仕事一覧＋申請
│   │   └── rules/page.tsx            # ルール確認（ひらがな中心）
│   │
│   ├── (parent)/                     # 親用（ダーク管理UI）
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx        # 兄弟別サマリ
│   │   ├── approvals/page.tsx        # お仕事承認（兄弟別）
│   │   ├── settings/page.tsx         # 基本給/単価/金利/満期日数/約束
│   │   ├── avatars/page.tsx          # アイコン画像アップロード（Storage）
│   │   └── setup/page.tsx            # 子のパスキー登録ブートストラップ(§5)
│   │
│   ├── api/
│   │   └── cron/daily/route.ts       # Vercel Cron 日次バッチ
│   │
│   ├── layout.tsx                    # ルートレイアウト
│   └── globals.css                   # テーマCSS変数（data-theme 切替）
│
├── components/
│   ├── ui/                           # Button, Card, Sheet など汎用
│   ├── child/                        # BalanceCard, BottomNav, GrowCountdown, TransferDial
│   └── parent/                       # ApprovalRow, SettingForm, AvatarUploader
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # ブラウザ用（passkey opt-in）
│   │   ├── server.ts                 # Server Component / Route Handler 用
│   │   └── admin.ts                  # service role（サーバ専用）
│   ├── auth/passkey.ts               # signInWithPasskey / registerPasskey ラッパ
│   ├── money/rpc.ts                  # transfer_money / approve_job_request 呼び出し
│   └── theme/
│       ├── themes.ts                 # rei_blue / jun_red / parent_dark のトークン定義
│       └── ThemeProvider.tsx         # profile.theme_key → data-theme を付与
│
├── types/db.ts                       # supabase gen types で生成
├── hooks/useProfile.ts               # ログイン中プロフィール取得
└── middleware.ts                     # セッション更新＋ロール別ルート保護
```

**テーマ切替の方針（概略）**：Tailwind は色をハードコードせず CSS 変数（`--color-primary` 等）で定義し、ルート要素の `data-theme="rei_blue | jun_red | parent_dark"` に応じて `globals.css` で変数値を切り替える。ログイン中プロフィールの `theme_key` を `ThemeProvider` が読んで付与するだけで、れいは「丸み・ハワイアンブルー」、じゅんは「シャープ・レッド」、親は「ダークグレー」に一括で変わる。ビルドを分ける必要がなく動的切替できる。

**ブラウザクライアント（パスキー opt-in）**

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { experimental: { passkey: true } } }   // ← beta opt-in（要 v2.105.0+）
  );
}
```

---

## 4. 実装前に決めておきたい判断ポイント

1. **「ふやす」の早期引き出し**：満期までロック（推奨・投資教育の趣旨に合致、カウントダウンUIとも整合）か、利息を放棄して引き出し可にするか。要件の「3つの箱を自由に移動」と投資ロックは部分的に衝突するため、**つかう⇄ためるは自由・つかう→ふやすは一方向ロック**を初期案にしています。

2. **子のパスキー登録フロー**（§5）：登録にはログイン済みセッションが必要。初回の具体的な動線を確定したい。

3. **基本給の支給**：日次cronで曜日判定して自動支給（提案の方式）か、親が手動でボタン支給か。

4. **アバター画像**：公開バケット（実装が楽）か、非公開＋署名URL（プライバシー重視・提案の方式）か。

5. **同一端末での3アカウント運用**：家族で1台のiPhoneを共有する場合、れい・じゅん・親の3つのパスキーを同じ端末に登録すれば、ログイン時に discoverable credential の選択画面で本人を選べます。これで「文字入力なしで本人を切替」が成立する想定でOKか。

---

## 5. 補足：子供のパスキー登録ブートストラップ案

パスキー登録は「ログイン済み」が前提のため、初回だけ親が橋渡しします。

1. 親が管理画面から子アカウントを作成（service role の Admin API。パスワードなしユーザー）。
2. 親が子の端末で一時的にその子としてサインイン（マジックリンク等の一時手段）。
3. その場で `registerPasskey()` を実行し、端末に生体認証パスキーを登録。
4. 以後、子は `signInWithPasskey()` のみ＝**Touch ID / Face ID だけでログイン**（文字入力ゼロ）。

---

### 次のステップ

この3点の方向性でよければ、次はご希望の部分から実コードに入れます。優先度の高そうな候補：
- テーマ切替（CSS変数＋ThemeProvider）と子供ホーム画面（残高カード＋ボトムナビ）
- 投資状況画面（ロット別カウントダウン／プログレスバー）
- 親の承認画面＋設定画面
- 初回セットアップ（家族・口座3行・パスキー登録）一式
```