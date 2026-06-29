"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { childThemes } from "@/lib/theme/childTheme";
import { HOME_GOALS } from "@/lib/mock/homeGoals";
import { BalanceCard } from "@/components/child/BalanceCard";
import { Mascot } from "@/components/child/Mascot";

export default function HomePage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  // TODO(auth): accountsテーブルをprofile_idで取得し、kind別にマッピングする
  const balances = useMockBalances().balances[themeKey];
  const goal = HOME_GOALS[themeKey];

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Mascot theme={theme} message="今日も おかねを ためよう！" />

      <BalanceCard
        theme={theme}
        label="ためる"
        emoji="🐷"
        amount={balances.save}
        goal={{ name: goal.name, current: balances.save, target: goal.target, otherCount: goal.otherCount }}
      />

      <div className="grid grid-cols-2 gap-4">
        <BalanceCard theme={theme} label="つかう" emoji="👛" amount={balances.spend} />
        <BalanceCard theme={theme} label="ふやす" emoji="🌱" amount={balances.grow} variant="grow" />
      </div>
    </div>
  );
}
