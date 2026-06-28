import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ★サーバ専用。SUPABASE_SERVICE_ROLE_KEY は絶対にクライアントへ出さない。
// cron の Route Handler からのみ呼ぶこと。呼び出し時に env を読むため、
// モジュールトップレベルでは生成しない。
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
