import { createBrowserClient } from "@supabase/ssr";

// ブラウザ用クライアント。呼び出し時に env を読むため、
// モジュールトップレベルでは生成しない（ビルド時の env 未設定で落とさないため）。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // パスキーは Supabase Auth の beta 機能。opt-in フラグ名は実装時に公式docsで再確認すること。
    { auth: { experimental: { passkey: true } } },
  );
}
