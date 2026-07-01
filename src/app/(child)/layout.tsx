"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useMockAvatars } from "@/lib/mock/MockAvatarsContext";
import { ChildHeader } from "@/components/child/ChildHeader";
import { BottomNav } from "@/components/child/BottomNav";
import { SideNav } from "@/components/child/SideNav";
import { THEME_LABELS } from "@/lib/theme/themes";
import { childThemes } from "@/lib/theme/childTheme";
import { useChildLayoutMode } from "@/lib/layout/useChildLayoutMode";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { FrameDecoration } from "@/components/child/FrameDecoration";
import { PinGate } from "@/components/ui/PinGate";
import { UserSwitchModal, SwitchUser } from "@/components/ui/UserSwitchModal";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useEffect } from "react";
import { ThemeKey } from "@/lib/theme/themes";

export default function ChildLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { theme: themeKey, setTheme } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { profile, loading: profileLoading } = useProfile();
  const [showSwitch, setShowSwitch] = useState(false);
  const { members } = useFamilyMembers();

  // 実ログイン済みの場合はプロフィールのtheme_keyに合わせてテーマを自動切替
  useEffect(() => {
    const profileTheme = (profile as { theme_key?: string } | null)?.theme_key;
    if (profileTheme && profileTheme !== themeKey) {
      setTheme(profileTheme as ThemeKey);
    }
  }, [profile, themeKey, setTheme]);

  // 実ログイン済みかつtheme_keyが一致する場合のみ実名を使う
  const name =
    profile && (profile as { theme_key?: string }).theme_key === themeKey
      ? (profile.display_name as string)
      : THEME_LABELS[themeKey].split("（")[0];
  const { accounts } = useAccounts();
  const mockBalances = useMockBalances().balances[themeKey];
  const balances = accounts ?? mockBalances;
  const total = balances.spend + balances.save + balances.grow;
  const mockAvatarUrl = useMockAvatars().avatars[themeKey];
  const realAvatarUrl =
    profile && (profile as { theme_key?: string; avatar_url?: string | null }).theme_key === themeKey
      ? ((profile as { avatar_url?: string | null }).avatar_url ?? null)
      : null;
  const avatarUrl = realAvatarUrl ?? mockAvatarUrl;
  const layoutMode = useChildLayoutMode();
  const isSide = layoutMode === "side";

  const userId = (profile as { id?: string } | null)?.id ?? null;
  const hasPinHash = !!(profile as { pin_hash?: string | null } | null)?.pin_hash;

  // 切り替え候補リスト（全メンバー。PINなしも表示し、モーダル側でエラー案内）
  const switchUsers: SwitchUser[] = (members ?? []).map((m) => ({
    profileId: m.id,
    label: m.display_name ?? (m.role === "parent" ? "おとうさん" : m.theme_key ?? ""),
    avatarUrl: m.avatar_url,
    destinationPath: m.role === "parent" ? "/dashboard" : "/home",
    hasPin: !!m.pin_hash,
  }));

  const canSwitch = !!userId && switchUsers.filter((u) => u.profileId !== userId).length > 0;

  return (
    <PinGate
      userId={userId}
      hasPinHash={hasPinHash}
      profileLoading={profileLoading}
      userName={name}
      accentColor={theme.accent}
    >
    <div
      style={{
        minHeight: "100vh",
        background: theme.frameBg,
        fontFamily: theme.fontFamily,
        display: isSide ? "flex" : "block",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <FrameDecoration themeKey={themeKey} />
      {isSide && <SideNav theme={theme} />}
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <ChildHeader
          theme={theme}
          name={name}
          total={total}
          avatarUrl={avatarUrl}
          onSwitchUser={canSwitch ? () => setShowSwitch(true) : undefined}
        />
        <main
          className={isSide ? "px-4" : "pb-28 px-4"}
          style={{ maxWidth: 720, margin: "0 auto" }}
        >
          {children}
        </main>
      </div>
      {!isSide && <BottomNav theme={theme} />}
      <PullToRefresh />

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
