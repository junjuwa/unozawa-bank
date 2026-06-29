// MOCK: TODO(auth) — investment_lotsテーブルをprofile_idで取得する。
// design.md §1.6①: 利率5%・満期30日が既定。matures_atではなく残日数で表示。
import { ThemeKey } from "@/lib/theme/themes";

export type InvestLot = {
  id: string;
  principal: number;
  remainingDays: number;
  totalDays: number;
  interestAmount: number;
};

// Okozukai-Home.html のふやす実例(300円/あと3かい/満期315円、200円/あと18かい)に合わせた
export const INVEST_LOTS: Record<ThemeKey, InvestLot[]> = {
  rei_blue: [
    { id: "lot1", principal: 300, remainingDays: 3, totalDays: 30, interestAmount: 315 },
    { id: "lot2", principal: 200, remainingDays: 18, totalDays: 30, interestAmount: 210 },
  ],
  jun_red: [
    { id: "lot1", principal: 500, remainingDays: 12, totalDays: 30, interestAmount: 525 },
  ],
  parent_dark: [],
};
