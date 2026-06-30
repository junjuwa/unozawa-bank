# おこづかいアプリ

れい・じゅん きょうだい向けのデジタルおこづかい管理 Web アプリ。
詳細設計は [docs/design.md](docs/design.md) を参照（スキーマ・RLS・RPC・Cron の正典）。

このリポジトリには「土台」（コード・マイグレーションSQL・手順書）のみ用意されています。
DB へのマイグレーション適用・環境変数の値入れ・デプロイは下記の手順で **人間（広樹）が手で行ってください**。

## 1. Supabase プロジェクト作成

1. https://supabase.com でプロジェクトを新規作成する。
2. プロジェクトの `Project URL` と `anon public key` を控える（後で env に使う）。

## 2. パスキー（passkey）認証を有効化する

1. Supabase Dashboard → Authentication → Providers でパスキー（beta）を有効化し、RP ID / RP Origins を設定する。
   - **RP ID**: `unozawa-bank.vercel.app`（Vercelプロジェクト名を `unozawa-bank` にした場合のデフォルトドメイン。独自ドメインに変えると登録済みパスキーが無効になるため、変更予定があれば先に決めてから設定する）
   - **RP Origins**: `https://unozawa-bank.vercel.app`（ローカルでも試すなら `http://localhost:3000` も追加）
2. パスキーは **beta 機能**。フラグ名・API 形は実装直前に [Supabase公式docs](https://supabase.com/docs) で必ず再確認すること（このリポジトリの `src/lib/auth/passkey.ts` は雛形のみ）。
3. クライアント側は `@supabase/supabase-js` **v2.105.0 以上**が必須（`package.json` で固定済み）。

## 3. マイグレーションの適用

`supabase/migrations/0001_init.sql` に以下を一本化しています。依存順は固定なので、分割実行する場合も順序を変えないこと。

1. テーブル定義（families, profiles, accounts, transactions, investment_lots, job_tasks, job_requests, family_settings）
2. ヘルパー関数 `is_parent()` / `my_family_id()`
3. RLS 有効化＋ポリシー
4. RPC（`transfer_money`, `approve_job_request`, `process_matured_investments`, `pay_base_salary`）+ REVOKE/GRANT
5. 自動プロビジョニングトリガ（`profiles` insert → 口座3行作成、`families` insert → `family_settings` 1行作成）
6. Storage（`avatars` バケット＋ポリシー）

続けて以下を順番に適用してください（0001 → 0002 → 0003 → 0004 の順を守ること）：
- `0002_monthly_salary.sql`（`pay_base_salary()` を毎月1日固定の支給に変更）
- `0003_spend_money.sql`（支出記録 `spend_money()` RPCを追加）
- `0004_job_requests_extras.sql`（`job_tasks.condition` 列、却下用 `reject_job_request()` RPCを追加）

### おしごとの実運用に必要な準備

`/jobs` `/approvals` は子・親ともログイン済みなら実DBの `job_tasks` / `job_requests` を使う。**`job_tasks` に1行も無いと子供の「おしごと」画面は空のまま**になるため、運用開始前にSQL Editorで最低1件作成しておくこと（設定画面からのCRUD UIは未実装、次フェーズ）：

```sql
insert into public.job_tasks (family_id, name, reward, condition)
values ('<family id>', 'おさらあらい', 50, 'つかったおさらを ぜんぶ あらって かわかすたなに しまう');
```

適用方法（いずれか）：

- **Supabase CLI**: `supabase db push`（プロジェクトをリンク後）
- **SQL Editor**: Dashboard → SQL Editor に各ファイルの内容を貼り付けて順番に実行

### 注意：cron専用RPCの権限

`process_matured_investments()` / `pay_base_salary()` は **service_role 専用**です。マイグレーション内で `public, anon, authenticated` から EXECUTE 権限を revoke し、`service_role` にのみ grant しています（Postgres は関数作成時にデフォルトで PUBLIC に EXECUTE を付けるため、明示的に絞る必要があるための対応です）。クライアントから直接呼べないことを確認してください。

### 注意：Storage のパス規約

`avatars` バケットへのアップロードパスは **バケット名を含めない** `{family_id}/{profile_id}.png` の形にしてください（`avatars/{family_id}/...` ではない）。`storage.objects.name` はバケット名を含まないため、RLS ポリシーの `(storage.foldername(name))[1] = family_id` 判定とパスを一致させる必要があります。

## 4. Storage バケットの確認

マイグレーション内で `avatars` バケットは自動作成されます（`on conflict (id) do nothing` のため再実行しても安全）。Dashboard → Storage で `avatars` バケットが non-public で存在することを確認してください。

## 5. Vercel 連携・環境変数・デプロイ

1. Vercel にこのリポジトリを連携する。
2. Project Settings → Environment Variables に以下4つの**値**を設定する（`.env.example` に名前のみ記載）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` （サーバ専用・厳秘。NEXT_PUBLIC_ にしない）
   - `CRON_SECRET` （16文字以上のランダム文字列。サーバ専用・厳秘）
3. `vercel.json` の cron 設定（`/api/cron/daily` を毎日 UTC 00:00 = JST 09:00 に1回）はそのまま使う。Hobby プランは1日1回までなので、これ以上 cron を増やさないこと。
4. デプロイする。

## 6. 最初の親アカウント作成

`/parent-login` は本物の `supabase.auth.signInWithPassword()` に接続済みです。アプリ内に新規登録(signUp)画面は無いため、**最初の親アカウントは人間がSupabaseダッシュボードで作成**してください（design.mdの方針どおり、子アカウントも親が作るのと同様）。

1. Dashboard → Authentication → Users → **Add user** でメールアドレス・パスワードを指定してユーザーを作成する（Auto Confirm Userを有効にしてメール確認をスキップしてよい）。
2. 作成したユーザーの `UID` をコピーする。
3. Dashboard → SQL Editor で以下を実行し、`families` と `profiles` に1行ずつ作成する（`families` insert時にトリガで `family_settings` も自動作成される）：

```sql
insert into public.families (name) values ('うちの家族')
returning id;  -- 表示されたidを次のinsertで使う

insert into public.profiles (id, family_id, role, display_name, theme_key)
values ('<手順2でコピーしたUID>', '<手順3で返ったfamily id>', 'parent', 'おとうさん', 'parent_dark');
```

4. `/parent-login` で作成したメールアドレス・パスワードでログインできることを確認する。

子供アカウント（パスキー登録含む）の作成は `/setup` 画面のフローに沿うが、現時点ではUIはモックのみで実際のAdmin API呼び出しは未実装（次フェーズ）。

## 7. ローカル開発

```bash
cp .env.example .env.local
# .env.local に値を入れる
npm install
npm run dev
```

### ビルド検証時の注意

`npm run build` は環境変数を参照するコードを含むため、ダミー値でも構わないので **`.env.local` を必ず用意してから** 実行してください（未設定だと型チェック自体は通っても実行時に環境変数アクセスで落ちる可能性があります）。

## 8. DB型の生成

DB スキーマを変更したら、型を再生成して `src/types/db.ts` を更新してください。

```bash
supabase gen types typescript --project-id <project-id> > src/types/db.ts
```

## ディレクトリ構成

`src/` の構成は `docs/design.md` §3 に準拠しています。Supabase クライアントは `src/lib/supabase/{client,server,admin}.ts` に集約しているので、他の場所で直接 `createClient` しないでください。
