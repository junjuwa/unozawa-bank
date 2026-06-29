"use client";

import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import {
  MockChildThemeProvider,
  useMockChildTheme,
} from "@/lib/theme/MockChildThemeContext";
import { ChildHeader } from "@/components/child/ChildHeader";
import { BottomNav } from "@/components/child/BottomNav";
import { ThemeToggleMock } from "@/components/ui/ThemeToggleMock";
import { THEME_LABELS } from "@/lib/theme/themes";

function ChildShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useMockChildTheme();
  // TODO(auth): name は useProfile().profile.display_name に置き換える
  const name = THEME_LABELS[theme].split("（")[0];

  return (
    <ThemeProvider theme={theme}>
      <ChildHeader name={name}>
        <ThemeToggleMock value={theme} onChange={setTheme} />
      </ChildHeader>
      <main className="pb-24">{children}</main>
      <BottomNav />
    </ThemeProvider>
  );
}

export default function ChildLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MockChildThemeProvider>
      <ChildShell>{children}</ChildShell>
    </MockChildThemeProvider>
  );
}
