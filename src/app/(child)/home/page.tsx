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
          kind="save"
          layout="featured"
          label="ためる"
          icon={<span style={{ fontSize: 20 }}>🐷</span>}
          amount={balances.save}
          goal={{ name: goal.name, current: balances.save, target: goal.target, otherCount: goal.otherCount }}
        />
      </Link>

      {/* HANDOFF.md実例: つかう / ふやす row（同サイズ2カラム） */}
      <div className="flex gap-4">
        <div className="flex-1">
          <BalanceCard
            theme={theme}
            kind="spend"
            label="つかう"
            icon={<span style={{ fontSize: 20 }}>👛</span>}
            amount={balances.spend}
          />
        </div>
        <div className="flex-1">
          <BalanceCard
            theme={theme}
            kind="grow"
            label="ふやす"
            icon={<span style={{ fontSize: 20 }}>🌱</span>}
            amount={balances.grow}
          />
        </div>
      </div>
    </div>
  );
}
