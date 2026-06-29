"use client";

import {
  MockChildThemeProvider,
  useMockChildTheme,
} from "@/lib/theme/MockChildThemeContext";
import { MockBalancesProvider, useMockBalances } from "@/lib/mock/MockBalancesContext";
import { ChildHeader } from "@/components/child/ChildHeader";
import { BottomNav } from "@/components/child/BottomNav";
import { ThemeToggleMock } from "@/components/ui/ThemeToggleMock";
import { THEME_LABELS } from "@/lib/theme/themes";
import { childThemes } from "@/lib/theme/childTheme";

function ChildShell({ children }: { children: React.ReactNode }) {
  const { theme: themeKey, setTheme } = useMockChildTheme();
  const theme = childThemes[themeKey];
  // TODO(auth): name は useProfile().profile.display_name に置き換える
  const name = THEME_LABELS[themeKey].split("（")[0];
  const balances = useMockBalances().balances[themeKey];
  const total = balances.spend + balances.save + balances.grow;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.frameBg,
        fontFamily: theme.fontFamily,
      }}
    >
      <ChildHeader theme={theme} name={name} total={total}>
        <ThemeToggleMock value={themeKey} onChange={setTheme} />
      </ChildHeader>
      <main className="pb-28 px-4">{children}</main>
      <BottomNav theme={theme} />
    </div>
  );
}

export default function ChildLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MockChildThemeProvider>
      <MockBalancesProvider>
        <ChildShell>{children}</ChildShell>
      </MockBalancesProvider>
    </MockChildThemeProvider>
  );
}
