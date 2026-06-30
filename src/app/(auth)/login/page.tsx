"use client";

// TODO(auth): れい/じゅんのタイルはsignInWithPasskey()(src/lib/auth/passkey.ts)に置き換える。
// 今はMockChildThemeContextのテーマ確定のみで「ログイン」を模している。
import { useRouter } from "next/navigation";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { AuthTile } from "@/components/ui/AuthTile";

export default function LoginPage() {
  const router = useRouter();
  const { setTheme } = useMockChildTheme();
  const theme = childThemes.parent_dark;

  function handleSelectChild(key: "rei_blue" | "jun_red") {
    setTheme(key);
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
        <AuthTile theme={childThemes.rei_blue} emoji="🌺" label="れい" onClick={() => handleSelectChild("rei_blue")} />
        <AuthTile theme={childThemes.jun_red} emoji="🦸" label="じゅん" onClick={() => handleSelectChild("jun_red")} />
        <AuthTile theme={theme} emoji="👨" label="おとうさん" onClick={() => router.push("/parent-login")} />
      </div>
    </main>
  );
}
