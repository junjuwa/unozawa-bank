// MOCK: TODO(0002) — goalsテーブル実装後はprofile_idで取得する。
// HOME_GOALSの「いま ためてる」を先頭に、「つぎ」の目標を1件追加した一覧。
import { ThemeKey } from "@/lib/theme/themes";
import { HOME_GOALS } from "@/lib/mock/homeGoals";

export type GoalListItem = {
  id: string;
  name: string;
  target: number;
  current: number;
  active: boolean; // 「いま ためてる」
};

// じゅんの「つぎ」目標はOkozukai-Home.htmlの実例(じてんしゃ)に合わせた
const NEXT_GOALS: Record<ThemeKey, { name: string; target: number; current: number }> = {
  rei_blue: { name: "じてんしゃ", target: 12000, current: 0 },
  jun_red: { name: "じてんしゃ", target: 12000, current: 0 },
  parent_dark: { name: "", target: 0, current: 0 },
};

export function getGoalsList(theme: ThemeKey, activeCurrent: number): GoalListItem[] {
  const active = HOME_GOALS[theme];
  const next = NEXT_GOALS[theme];
  if (!active.target) return [];
  return [
    { id: "active", name: active.name, target: active.target, current: activeCurrent, active: true },
    { id: "next", name: next.name, target: next.target, current: next.current, active: false },
  ];
}
