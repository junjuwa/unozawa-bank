"use client";

// MOCK ONLY: TODO(0002) — goalsテーブル実装後はprofile_idで取得・insertする。
// 1人につきactiveな目標は常に1件（ホームの「ためる」カードに内包表示される）。
// それ以外は「つぎ」として並ぶだけで、貯金の按分ロジックはDB設計の課題として
// 据え置く（currentは0固定）。

import { createContext, useContext, useState } from "react";
import { ThemeKey } from "@/lib/theme/themes";

export type Goal = { id: string; name: string; target: number; active: boolean };

// Okozukai-Home.html のれい/じゅん実例(850円/あと650円=1500円, じてんしゃ12000円)を踏襲
const INITIAL_GOALS: Record<ThemeKey, Goal[]> = {
  rei_blue: [
    { id: "g-rei-1", name: "新しいゲーム", target: 1500, active: true },
    { id: "g-rei-2", name: "じてんしゃ", target: 12000, active: false },
  ],
  jun_red: [
    { id: "g-jun-1", name: "あたらしいゲーム", target: 2000, active: true },
    { id: "g-jun-2", name: "じてんしゃ", target: 12000, active: false },
  ],
  parent_dark: [],
};

type MockGoalsContextValue = {
  goals: Record<ThemeKey, Goal[]>;
  addGoal: (theme: ThemeKey, name: string, target: number) => void;
};

const MockGoalsContext = createContext<MockGoalsContextValue | null>(null);

export function MockGoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Record<ThemeKey, Goal[]>>(INITIAL_GOALS);

  function addGoal(theme: ThemeKey, name: string, target: number) {
    setGoals((prev) => {
      const hasActive = prev[theme].some((g) => g.active);
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        name,
        target,
        active: !hasActive,
      };
      return { ...prev, [theme]: [...prev[theme], newGoal] };
    });
  }

  return (
    <MockGoalsContext.Provider value={{ goals, addGoal }}>{children}</MockGoalsContext.Provider>
  );
}

export function useMockGoals() {
  const ctx = useContext(MockGoalsContext);
  if (!ctx) throw new Error("useMockGoals は MockGoalsProvider の内側で使ってください");
  return ctx;
}
