"use client";

// MOCK ONLY: ログイン・パスキー認証が未実装のため、(child)/layout.tsx と
// home/page.tsx の間でテーマ状態を共有するための仮のContext。
// 本実装では削除し、各コンポーネントが useProfile() を直接呼んで
// profile.theme_key / profile.display_name を使う形に置き換える。

import { createContext, useContext, useState } from "react";
import { ThemeKey } from "./themes";

type MockChildThemeContextValue = {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
};

const MockChildThemeContext = createContext<MockChildThemeContextValue | null>(
  null,
);

export function MockChildThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO(auth): useProfile().profile.theme_key に置き換える
  const [theme, setTheme] = useState<ThemeKey>("rei_blue");

  return (
    <MockChildThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </MockChildThemeContext.Provider>
  );
}

export function useMockChildTheme() {
  const ctx = useContext(MockChildThemeContext);
  if (!ctx) {
    throw new Error(
      "useMockChildTheme は MockChildThemeProvider の内側で使ってください",
    );
  }
  return ctx;
}
