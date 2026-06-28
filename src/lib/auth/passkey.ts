import { createClient } from "@/lib/supabase/client";

// TODO: パスキーは Supabase Auth の beta 機能。
// API 形・フラグ名は実装直前に公式docsで再確認してから書くこと（記憶で書かない）。

export async function signInWithPasskey() {
  const supabase = createClient();
  return supabase.auth.signInWithPasskey();
}

export async function registerPasskey() {
  const supabase = createClient();
  return supabase.auth.registerPasskey();
}
