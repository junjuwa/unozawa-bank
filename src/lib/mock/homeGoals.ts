// MOCK: TODO(0002) — goalsテーブル実装後はprofile_idで取得する。
// 「いま ためてる」目標1件のみ表示し、複数目標の件数は otherCount で件数バッジ表示する。
// Goal.savedAmountとaccounts.balance(save)の整合は0002側の設計課題のため、
// 今回はsave残高をそのままcurrentとして使う（HANDOFF.md §7のGoal型を簡略化）。
import { ThemeKey } from "@/lib/theme/themes";

type HomeGoal = { name: string; target: number; otherCount: number };

// Okozukai-Home.html のれい:ためる画面の実例(850円/あと650円=目標1500円)に合わせた
export const HOME_GOALS: Record<ThemeKey, HomeGoal> = {
  rei_blue: { name: "新しいゲーム", target: 1500, otherCount: 1 },
  jun_red: { name: "あたらしいゲーム", target: 2000, otherCount: 1 },
  parent_dark: { name: "", target: 0, otherCount: 0 },
};
