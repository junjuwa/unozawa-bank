import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 既存の子アカウントに対してパスキー登録用の一時サインインリンク（magic link）を発行する。
// 子アカウントはパスワードなし・合成メールアドレスのため、admin APIで再発行する。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { themeKey } = (await req.json()) as { themeKey?: string };
  if (themeKey !== "rei_blue" && themeKey !== "jun_red") {
    return Response.json({ error: "themeKeyを指定してください" }, { status: 400 });
  }

  // 呼び出し元が親であることを確認
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "ログインしてください" }, { status: 401 });

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role, family_id")
    .eq("id", user.id)
    .single();
  if (!callerProfile || callerProfile.role !== "parent") {
    return Response.json({ error: "親のみ実行できます" }, { status: 403 });
  }

  const admin = createAdminClient();

  // 同じファミリーの指定テーマの子プロフィールを取得
  const { data: childProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("family_id", callerProfile.family_id)
    .eq("role", "child")
    .eq("theme_key", themeKey)
    .single();
  if (!childProfile) {
    return Response.json({ error: "子アカウントが見つかりません" }, { status: 404 });
  }

  // 子のauth userからメールアドレスを取得
  const { data: authUser } = await admin.auth.admin.getUserById(childProfile.id);
  if (!authUser.user?.email) {
    return Response.json({ error: "子のメールアドレスが取得できません" }, { status: 500 });
  }

  // 一時サインイン用magic linkを発行
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: authUser.user.email,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    return Response.json({ error: linkError?.message ?? "リンク生成に失敗しました" }, { status: 500 });
  }

  return Response.json({ hashedToken: linkData.properties.hashed_token });
}
