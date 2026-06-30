"use client";

// signInWithPasskey()はdiscoverable credential方式で事前にユーザーを特定しないため、
// れい/じゅんどちらのタイルをタップしても同じ認証フローを呼ぶ。
// 成功後に実プロフィールを取得し、テーマ・遷移先を決める。
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockAvatars } from "@/lib/mock/MockAvatarsContext";
import { childThemes } from "@/lib/theme/childTheme";
import { ThemeKey } from "@/lib/theme/themes";
import { AuthTile } from "@/components/ui/AuthTile";
import { createClient } from "@/lib/supabase/client";
import { signInWithPasskey } from "@/lib/auth/passkey";

export default function LoginPage() {
  const router = useRouter();
  const { setTheme } = useMockChildTheme();
  const { avatars } = useMockAvatars();
  const theme = childThemes.parent_dark;
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function handleSignInWithPasskey() {
    setSigningIn(true);
    setError(null);
    const { data, error: signInError } = await signInWithPasskey();
    if (signInError || !data?.user) {
      setSigningIn(false);
      setError(signInError?.message ?? "サインインできませんでした");
      return;
    }

    const supabase = createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, theme_key")
      .eq("id", data.user.id)
      .single();
    setSigningIn(false);

    if (profileError || !profile || profile.role !== "child") {
      setError("子のプロフィールが見つかりませんでした");
      return;
    }

    // 残高等のデータは引き続きモックのため、テーマだけ実プロフィールに同期する
    setTheme(profile.theme_key as ThemeKey);
    router.push("/home");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 24,
        fontFamily: theme.fontFamily,
        color: theme.ink,
      }}
    >
      <h1 style={{ fontWeight: 900, fontSize: 22 }}>だれですか？</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 320 }}>
        <AuthTile
          theme={childThemes.rei_blue}
          emoji="🌺"
          avatarUrl={avatars.rei_blue}
          label="れい"
          onClick={handleSignInWithPasskey}
        />
        <AuthTile
          theme={childThemes.jun_red}
          emoji="🦸"
          avatarUrl={avatars.jun_red}
          label="じゅん"
          onClick={handleSignInWithPasskey}
        />
        <AuthTile theme={theme} emoji="👨" label="おとうさん" onClick={() => router.push("/parent-login")} />
      </div>
      {signingIn && <p style={{ fontSize: 13, color: theme.sub }}>サインインちゅう…</p>}
      {error && <p style={{ fontSize: 13, color: "#E26D62" }}>{error}</p>}
    </main>
  );
}
