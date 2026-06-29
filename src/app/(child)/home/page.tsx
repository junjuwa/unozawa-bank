"use client";

import Link from "next/link";
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

      {/* HANDOFF.md §3: ためるカードはボトムナビ項目ではなく、ホームからのタップで /goals へ遷移 */}
      <Link href="/goals">
        <BalanceCard
          theme={theme}
          label="ためる"
          emoji="🐷"
          amount={balances.save}
          goal={{ name: goal.name, current: balances.save, target: goal.target, otherCount: goal.otherCount }}
        />
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        <BalanceCard theme={theme} label="つかう" emoji="👛" amount={balances.spend} />
        <BalanceCard theme={theme} label="ふやす" emoji="🌱" amount={balances.grow} variant="grow" />
      </div>
    </div>
  );
}
