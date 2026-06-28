"use client";

import { ThemeKey } from "./themes";

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeKey;
  children: React.ReactNode;
}) {
  return <div data-theme={theme}>{children}</div>;
}
