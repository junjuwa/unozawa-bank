"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { childThemes } from "@/lib/theme/childTheme";
import { getGoalsList } from "@/lib/mock/goalsList";
import { GoalCard } from "@/components/child/GoalCard";

export default function GoalsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const save = useMockBalances().balances[themeKey].save;
  const goals = getGoalsList(themeKey, save);

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>
        もくひょう いちらん
      </h1>
      {goals.map((goal) => (
        <div key={goal.id}>
          <div style={{ fontSize: 12, fontWeight: 800, color: theme.sub, marginBottom: 4 }}>
            {goal.active ? "いま ためてる" : "つぎ"}
          </div>
          <div
            style={{
              background: theme.cardBg,
              borderRadius: theme.cardRadius,
              border: theme.cardBorder,
              boxShadow: theme.cardShadow,
              padding: 16,
            }}
          >
            <GoalCard theme={theme} name={goal.name} current={goal.current} target={goal.target} />
          </div>
        </div>
      ))}
    </div>
  );
}
