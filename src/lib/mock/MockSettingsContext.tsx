"use client";

// MOCK ONLY: 本実装では削除し、family_settingsテーブルのupdate（親のみRLS許可）に置き換える。
// 永続化はせず、設定画面内での表示の一貫性のためだけにstateを持つ。

import { createContext, useContext, useState } from "react";

type Settings = {
  basePay: Record<"rei_blue" | "jun_red", number>;
  investRate: number; // 0.05 = 5%
  investTermDays: number;
};

const INITIAL_SETTINGS: Settings = {
  basePay: { rei_blue: 500, jun_red: 500 },
  investRate: 0.05,
  investTermDays: 30,
};

type MockSettingsContextValue = {
  settings: Settings;
  setBasePay: (theme: "rei_blue" | "jun_red", value: number) => void;
  setInvestRate: (value: number) => void;
  setInvestTermDays: (value: number) => void;
};

const MockSettingsContext = createContext<MockSettingsContextValue | null>(null);

export function MockSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);

  function setBasePay(theme: "rei_blue" | "jun_red", value: number) {
    setSettings((prev) => ({ ...prev, basePay: { ...prev.basePay, [theme]: value } }));
  }
  function setInvestRate(value: number) {
    setSettings((prev) => ({ ...prev, investRate: value }));
  }
  function setInvestTermDays(value: number) {
    setSettings((prev) => ({ ...prev, investTermDays: value }));
  }

  return (
    <MockSettingsContext.Provider
      value={{ settings, setBasePay, setInvestRate, setInvestTermDays }}
    >
      {children}
    </MockSettingsContext.Provider>
  );
}

export function useMockSettings() {
  const ctx = useContext(MockSettingsContext);
  if (!ctx) throw new Error("useMockSettings は MockSettingsProvider の内側で使ってください");
  return ctx;
}
