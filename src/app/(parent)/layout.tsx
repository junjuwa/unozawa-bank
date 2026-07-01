"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { childThemes } from "@/lib/theme/childTheme";
import { ParentBottomNav } from "@/components/parent/ParentBottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { PinGate } from "@/components/ui/PinGate";
import { UserSwitchModal, SwitchUser } from "@/components/ui/UserSwitchModal";
import { createClient } from "@/lib/supabase/client";

export default function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = childThemes.parent_dark;
  const { profile, loading: profileLoading } = useProfile();
  const { members } = useFamilyMembers();
  const router = useRouter();
  const displayName =
    typeof profile?.display_name === "string" ? profile.display_name : "おとうさん";
  const userId = (profile as { id?: string } | null)?.id ?? null;
  const hasPinHash = !!(profile as { pin_hash?: string | null } | null)?.pin_hash;
  const [showSwitch, setShowSwitch] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/parent-login");
  }

  const switchUsers: SwitchUser[] = (members ?? []).map((m) => ({
    profileId: m.id,
    label: m.display_name ?? (m.role === "parent" ? "おとうさん" : m.theme_key ?? ""),
    avatarUrl: m.avatar_url,
    destinationPath: m.role === "parent" ? "/dashboard" : "/home",
    hasPin: !!m.pin_hash,
  }));
  const canSwitch = !!userId && switchUsers.filter((u) => u.profileId !== userId).length > 0;

  return (
    <PinGate userId={userId} hasPinHash={hasPinHash} profileLoading={profileLoading} userName={displayName} accentColor={theme.accent}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <img src="/brand/logo-lockup-dark.svg" alt="UNOZAWA BANK" style={{ height: 36, width: "auto" }} />
          <div style={{ fontSize: 11, color: theme.sub, paddingLeft: 2 }}>{displayName}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {canSwitch && (
            <button
              type="button"
              onClick={() => setShowSwitch(true)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: theme.sub,
                border: "1px solid #3A424C",
                borderRadius: 14,
                padding: "6px 12px",
                background: "none",
                cursor: "pointer",
                fontFamily: theme.fontFamily,
              }}
            >
              🔄 きりかえ
            </button>
          )}
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
              background: "none",
              cursor: "pointer",
              fontFamily: theme.fontFamily,
            }}
          >
            ログアウト
          </button>
        </div>
      </header>
      <main className="pb-28 px-4" style={{ maxWidth: 720, margin: "0 auto" }}>
        {children}
      </main>
      <ParentBottomNav theme={theme} />

      {showSwitch && (
        <UserSwitchModal
          currentProfileId={userId}
          users={switchUsers}
          onClose={() => setShowSwitch(false)}
        />
      )}
    </div>
    </PinGate>
  );
}
