# おこづかいアプリ — プロジェクトメモリ

## プロジェクト概要
- 小学1年の兄弟（れい / じゅん）向けのデジタルおこづかい管理Webアプリ。
- 親が承認・設定、子はパスキー（生体認証）で操作。スマホ前提。
- **詳細設計の正典は `docs/design.md`。スキーマ・RLS・RPC・Cron・構成はそこに従う。作業前に必ず読むこと。**

## 技術スタック
- Next.js (App Router, TypeScript) + Tailwind CSS
- Supabase（Postgres / Auth / Storage）。`@supabase/ssr`、`@supabase/supabase-js` は v2.105.0 以上
- Vercel（ホスティング + Cron）

## 絶対に守る制約（破る変更をするときは必ず先に確認を取る）
1. お金が動く操作（残高変更・振替・お仕事承認・満期処理・基本給）は **SECURITY DEFINER の RPC 経由のみ**。`accounts` / `transactions` / `investment_lots` にクライアントからの直接 INSERT/UPDATE を許す RLS ポリシーを足さない。
2. RLS は全テーブルで有効化。判定は `is_parent()` / `my_family_id()`（SECURITY DEFINER・再帰回避用）を使う。
3. `SUPABASE_SERVICE_ROLE_KEY` と `CRON_SECRET` は **サーバ専用**。`NEXT_PUBLIC_*`・クライアントバンドル・ログ・git に絶対出さない。使ってよいのは cron の Route Handler と admin client のみ。
4. パスキーは Supabase Auth の **beta 機能**。クライアントで experimental opt-in が必要。実装時は最新の公式 docs でフラグ名・API 形を確認してから書く（記憶で書かない）。
5. Cron は Hobby 制約で **1日1回まで**。満期判定は時刻ではなく `matures_at <= now()` で行う。1本の cron に満期処理＋基本給支給＋pause回避を相乗りさせる。
6. 「ふやす」は満期までロック（早期引き出し不可）が初期仕様。変更は要相談。

## 用語（子供向けUIはひらがな中心）
- つかう = `spend` / ためる = `save` / ふやす = `grow`（投資・30日満期）
- 入金（基本給・お仕事承認）は必ず「つかう（spend）」へ入る。
- テーマ: れい = `rei_blue`（丸み・ハワイアンブルー）/ じゅん = `jun_red`（シャープ・レッド）/ 親 = `parent_dark`。CSS変数 + `data-theme` で動的切替（Tailwindビルドは分けない）。

## コード規約
- TypeScript strict。DBの型は `supabase gen types` で `src/types/db.ts` に生成して使う。
- Supabase アクセスは `src/lib/supabase/{client,server,admin}.ts` に集約。各所で直接 `createClient` しない。
- 環境変数は `.env.local`（コミット禁止）。`.env.example` には名前だけ置く。

## 人間（広樹）が手で行う作業 — Claude Code は代行しない
- Supabase: プロジェクト作成、パスキー有効化＋RP ID 設定、Storage バケット作成、マイグレーション適用、各種キー取得。
- Vercel: プロジェクト連携、環境変数の「値」設定、デプロイ。
- 秘密の値の入力・ダッシュボード操作は人間が行う。Claude Code はコード・マイグレーションSQL・手順書(README)を用意する。

## 進め方
- 一度に全部作らない。`docs/design.md` 末尾の「次のステップ」順に、マイルストーン単位で進める。
- DB スキーマ変更は `supabase/migrations/*.sql` として出力し、ローカルで確認できる形にする。
- 大きめのタスクはまず plan mode でプランを提示してから着手する。
