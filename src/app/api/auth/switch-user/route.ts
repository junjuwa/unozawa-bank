import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/auth/switch-user
// { targetProfileId: string, pin: string }
// → PIN を検証して magic link token_hash を返す。
// クライアントは supabase.auth.verifyOtp({ token_hash, type:'magiclink' }) で新セッションを得る。
export async function POST(req: NextRequest) {
  const { targetProfileId, pin } = await req.json() as { targetProfileId?: string; pin?: string };
  if (!targetProfileId || !pin) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 呼び出し元の family_id を取得
  const { data: caller } = await admin
    .from("profiles")
    .select("family_id")
    .eq("id", user.id)
    .single();
  if (!caller) {
    return NextResponse.json({ error: "profile not found" }, { status: 403 });
  }

  // ターゲットが同じ family かつ pin_hash を持つことを確認
  const { data: target } = await admin
    .from("profiles")
    .select("id, family_id, pin_hash")
    .eq("id", targetProfileId)
    .single();
  if (!target || target.family_id !== caller.family_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!target.pin_hash) {
    return NextResponse.json({ error: "target has no pin" }, { status: 400 });
  }

  // PIN 検証（SECURITY DEFINER RPC を service role で呼ぶ）
  const { data: ok, error: pinErr } = await admin.rpc("verify_pin_for", {
    p_profile_id: targetProfileId,
    p_pin: pin,
  });
  if (pinErr || !ok) {
    return NextResponse.json({ error: "wrong pin" }, { status: 401 });
  }

  // ターゲットの auth.user.email を取得してマジックリンクを発行
  const { data: authUser } = await admin.auth.admin.getUserById(targetProfileId);
  const email = authUser?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "user email not found" }, { status: 500 });
  }

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !link?.properties?.hashed_token) {
    return NextResponse.json({ error: "link generation failed" }, { status: 500 });
  }

  return NextResponse.json({ token_hash: link.properties.hashed_token });
}
