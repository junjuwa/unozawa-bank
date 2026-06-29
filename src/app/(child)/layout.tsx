"use client";

import {
  MockChildThemeProvider,
  useMockChildTheme,
} from "@/lib/theme/MockChildThemeContext";
import { MockBalancesProvider, useMockBalances } from "@/lib/mock/MockBalancesContext";
import { MockJobsProvider } from "@/lib/mock/MockJobsContext";
import { ChildHeader } from "@/components/child/ChildHeader";
import { BottomNav } from "@/components/child/BottomNav";
import { SideNav } from "@/components/child/SideNav";
import { ThemeToggleMock } from "@/components/ui/ThemeToggleMock";
import { THEME_LABELS } from "@/lib/theme/themes";
import { childThemes } from "@/lib/theme/childTheme";
import { useChildLayoutMode } from "@/lib/layout/useChildLayoutMode";

function ChildShell({ children }: { children: React.ReactNode }) {
  const { theme: themeKey, setTheme } = useMockChildTheme();
  const theme = childThemes[themeKey];
  // TODO(auth): name は useProfile().profile.display_name に置き換える
  const name = THEME_LABELS[themeKey].split("（")[0];
  const balances = useMockBalances().balances[themeKey];
  const total = balances.spend + balances.save + balances.grow;
  const layoutMode = useChildLayoutMode();
  const isSide = layoutMode === "side";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.frameBg,
        fontFamily: theme.fontFamily,
        display: isSide ? "flex" : "block",
      }}
    >
      {isSide && <SideNav theme={theme} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ChildHeader theme={theme} name={name} total={total}>
          <ThemeToggleMock value={themeKey} onChange={setTheme} />
        </ChildHeader>
        <main
          className={isSide ? "px-4" : "pb-28 px-4"}
          style={{ maxWidth: 720, margin: "0 auto" }}
        >
          {children}
        </main>
      </div>
      {!isSide && <BottomNav theme={theme} />}
    </div>
  );
}

export default function ChildLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MockChildThemeProvider>
      <MockBalancesProvider>
        <MockJobsProvider>
          <ChildShell>{children}</ChildShell>
        </MockJobsProvider>
      </MockBalancesProvider>
    </MockChildThemeProvider>
  );
}
