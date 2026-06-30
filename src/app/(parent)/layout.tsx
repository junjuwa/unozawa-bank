"use client";

import { useRouter } from "next/navigation";
import { childThemes } from "@/lib/theme/childTheme";
import { ParentBottomNav } from "@/components/parent/ParentBottomNav";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";

export default function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = childThemes.parent_dark;
  const { profile } = useProfile();
  const router = useRouter();
  const displayName =
    typeof profile?.display_name === "string" ? profile.display_name : "おとうさん";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/parent-login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.frameBg,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <header
        style={{
          padding: "18px 18px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: theme.headingWeight, fontSize: 18 }}>おこづかい かんり</div>
          <div style={{ fontSize: 12, color: theme.sub }}>{displayName}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: theme.sub,
            border: "1px solid #3A424C",
            borderRadius: 14,
            padding: "6px 12px",
          }}
        >
          ログアウト
        </button>
      </header>
      <main className="pb-28 px-4" style={{ maxWidth: 720, margin: "0 auto" }}>
        {children}
      </main>
      <ParentBottomNav theme={theme} />
    </div>
  );
}
