"use client";

// MOCK ONLY: design.md §1.7のavatars Storage実装と同じ方針に揃える対象。
// 実在キャラクター（スティッチ／スパイダーマン等）の画像は同梱・生成できないため、
// 家庭で用意した画像をここからアップロードできるようにする（image-slot相当）。

import { createContext, useContext, useState } from "react";
import { ThemeKey } from "@/lib/theme/themes";

type Mascots = Record<ThemeKey, string | null>;

const INITIAL_MASCOTS: Mascots = { rei_blue: null, jun_red: null, parent_dark: null };

type MockMascotContextValue = {
  mascots: Mascots;
  setMascotImage: (theme: ThemeKey, dataUrl: string) => void;
  clearMascotImage: (theme: ThemeKey) => void;
};

const MockMascotContext = createContext<MockMascotContextValue | null>(null);

export function MockMascotProvider({ children }: { children: React.ReactNode }) {
  const [mascots, setMascots] = useState<Mascots>(INITIAL_MASCOTS);

  function setMascotImage(theme: ThemeKey, dataUrl: string) {
    setMascots((prev) => ({ ...prev, [theme]: dataUrl }));
  }
  function clearMascotImage(theme: ThemeKey) {
    setMascots((prev) => ({ ...prev, [theme]: null }));
  }

  return (
    <MockMascotContext.Provider value={{ mascots, setMascotImage, clearMascotImage }}>
      {children}
    </MockMascotContext.Provider>
  );
}

export function useMockMascot() {
  const ctx = useContext(MockMascotContext);
  if (!ctx) throw new Error("useMockMascot は MockMascotProvider の内側で使ってください");
  return ctx;
}
