"use client";

// MOCK ONLY: design.md §1.7 / HANDOFF.md §9のavatars Storage実装に置き換える対象。
// 本実装ではcreateSignedUrl等で取得したURLをprofiles.avatar_urlから読む形にする。
// ここではdata URL(FileReaderで読んだ画像)をセッション内のstateで保持するだけ。

import { createContext, useContext, useState } from "react";
import { ThemeKey } from "@/lib/theme/themes";

type Avatars = Record<ThemeKey, string | null>;

const INITIAL_AVATARS: Avatars = { rei_blue: null, jun_red: null, parent_dark: null };

type MockAvatarsContextValue = {
  avatars: Avatars;
  setAvatar: (theme: ThemeKey, dataUrl: string) => void;
  clearAvatar: (theme: ThemeKey) => void;
};

const MockAvatarsContext = createContext<MockAvatarsContextValue | null>(null);

export function MockAvatarsProvider({ children }: { children: React.ReactNode }) {
  const [avatars, setAvatars] = useState<Avatars>(INITIAL_AVATARS);

  function setAvatar(theme: ThemeKey, dataUrl: string) {
    setAvatars((prev) => ({ ...prev, [theme]: dataUrl }));
  }
  function clearAvatar(theme: ThemeKey) {
    setAvatars((prev) => ({ ...prev, [theme]: null }));
  }

  return (
    <MockAvatarsContext.Provider value={{ avatars, setAvatar, clearAvatar }}>
      {children}
    </MockAvatarsContext.Provider>
  );
}

export function useMockAvatars() {
  const ctx = useContext(MockAvatarsContext);
  if (!ctx) throw new Error("useMockAvatars は MockAvatarsProvider の内側で使ってください");
  return ctx;
}
