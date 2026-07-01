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

  // localStorageキャッシュ（前回ログイン時に保存）→ なければmockにフォールバック
  function getCachedAvatar(themeKey: string): string | null {
    try {
      const v = localStorage.getItem(`login_avatar_${themeKey}`);
      // data: URL が入っていた場合は削除して無効化
      if (v?.startsWith("data:")) { localStorage.removeItem(`login_avatar_${themeKey}`); return null; }
      return v || null;
    } catch { return null; }
  }

  // signInWithPasskey()自体はdiscoverable credential方式でユーザーを特定しないため、
  // タップしたタイルと実際に認証されたプロフィールのtheme_keyが一致するかをここで検証する
  // （一致しなければ別の子のパスキーが使われたとみなしサインアウトする）。
  async function handleSignInWithPasskey(tappedThemeKey: "rei_blue" | "jun_red") {
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

    if (profileError || !profile || profile.role !== "child") {
      setSigningIn(false);
      await supabase.auth.signOut();
      setError("子のプロフィールが見つかりませんでした");
      return;
    }

    if (profile.theme_key !== tappedThemeKey) {
      setSigningIn(false);
      await supabase.auth.signOut();
      setError("ちがう ひとの パスキーです。もう一度えらんでください");
      return;
    }

    setSigningIn(false);
    // 残高等のデータは引き続きモックのため、テーマだけ実プロフィールに同期する
    setTheme(profile.theme_key as ThemeKey);
    // iOS PWA standalone モードでは WebAuthn 後の router.push() が Safari を開くことがある。
    // window.location.replace() で同一 WebView 内のハードナビゲーションにする。
    window.location.replace("/home");
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
      <img src="/brand/logo-lockup-dark.svg" alt="UNOZAWA BANK" style={{ height: 48, width: "auto", marginBottom: 4 }} />
      <h1 style={{ fontWeight: 900, fontSize: 22 }}>だれですか？</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 320 }}>
        <AuthTile
          theme={childThemes.rei_blue}
          avatarUrl={getCachedAvatar("rei_blue") ?? avatars.rei_blue}
          label="れい"
          onClick={() => handleSignInWithPasskey("rei_blue")}
        />
        <AuthTile
          theme={childThemes.jun_red}
          avatarUrl={getCachedAvatar("jun_red") ?? avatars.jun_red}
          label="じゅん"
          onClick={() => handleSignInWithPasskey("jun_red")}
        />
        <AuthTile theme={theme} label="おとうさん" onClick={() => router.push("/parent-login")} />
      </div>
      {signingIn && <p style={{ fontSize: 13, color: theme.sub }}>サインインちゅう…</p>}
      {error && <p style={{ fontSize: 13, color: "#E26D62" }}>{error}</p>}
    </main>
  );
}
