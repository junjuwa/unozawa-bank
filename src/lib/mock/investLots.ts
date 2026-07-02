// MOCK: TODO(auth) — investment_lotsテーブルをprofile_idで取得する。
// design.md §1.6①: 利率5%・満期30日が既定。matures_atではなく残日数で表示。
import { ThemeKey } from "@/lib/theme/themes";

export type InvestLot = {
  id: string;
  principal: number;
  remainingDays: number;
  totalDays: number;
  interestAmount: number;
  startedAt?: string; // "YYYY-MM-DD"
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const INVEST_LOTS: Record<ThemeKey, InvestLot[]> = {
  rei_blue: [
    { id: "lot1", principal: 300, remainingDays: 3,  totalDays: 30, interestAmount: 315, startedAt: daysAgo(27) },
    { id: "lot2", principal: 200, remainingDays: 18, totalDays: 30, interestAmount: 210, startedAt: daysAgo(12) },
  ],
  jun_red: [
    { id: "lot1", principal: 500, remainingDays: 12, totalDays: 30, interestAmount: 525, startedAt: daysAgo(18) },
  ],
  parent_dark: [],
};
