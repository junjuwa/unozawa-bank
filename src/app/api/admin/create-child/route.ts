import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// design.md §5: 子アカウント作成は親が橋渡しする。サーバ専用(service role)。
// 呼び出し元が「ログイン済みの親」であることを通常のserver client(cookie)で確認してから、
// admin clientで①auth user作成②profiles insert③magic link生成を行う。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ThemeKey = "rei_blue" | "jun_red";

export async function POST(req: NextRequest) {
  const { displayName, themeKey } = (await req.json()) as {
    displayName?: string;
    themeKey?: ThemeKey;
  };

  if (!displayName || (themeKey !== "rei_blue" && themeKey !== "jun_red")) {
    return Response.json({ error: "displayNameとthemeKey(rei_blue/jun_red)を指定してください" }, { status: 400 });
  }

  // 呼び出し元が親であることを確認（通常のRLS経由・サービスロール未使用）
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { data: callerProfile, error: callerError } = await supabase
    .from("profiles")
    .select("role, family_id")
    .eq("id", user.id)
    .single();
  if (callerError || !callerProfile || callerProfile.role !== "parent") {
    return Response.json({ error: "親のみ実行できます" }, { status: 403 });
  }

  const admin = createAdminClient();

  // ① 子のauth userを作成（パスワードなし。design.mdの要件どおり）
  const syntheticEmail = `child-${crypto.randomUUID()}@unozawa-bank.invalid`;
  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (createUserError || !createdUser.user) {
    return Response.json({ error: createUserError?.message ?? "ユーザー作成に失敗しました" }, { status: 500 });
  }

  // ② profiles insert（INSERTのRLSポリシーが無いためadmin clientで行う。
  // role='child'のtriggerでaccounts3行が自動作成される）
  const { error: profileError } = await admin.from("profiles").insert({
    id: createdUser.user.id,
    family_id: callerProfile.family_id,
    role: "child",
    display_name: displayName,
    theme_key: themeKey,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  // ③ 一時サインイン用のmagic linkを生成し、hashed_tokenをクライアントに返す
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: syntheticEmail,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    return Response.json({ error: linkError?.message ?? "サインインリンクの生成に失敗しました" }, { status: 500 });
  }

  return Response.json({
    childId: createdUser.user.id,
    hashedToken: linkData.properties.hashed_token,
  });
}
