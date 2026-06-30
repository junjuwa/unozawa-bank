"use client";

import Link from "next/link";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockGoals } from "@/lib/mock/MockGoalsContext";
import { useAccounts } from "@/hooks/useAccounts";
import { BalanceCard } from "@/components/child/BalanceCard";
import { Mascot } from "@/components/child/Mascot";

export default function HomePage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  // 実ログイン済みならaccountsテーブルの実残高、未ログインならモックにフォールバック
  const { accounts } = useAccounts();
  const mockBalances = useMockBalances().balances[themeKey];
  const balances = accounts ?? mockBalances;
  const childGoals = useMockGoals().goals[themeKey];
  const activeGoal = childGoals.find((g) => g.active);
  const otherCount = childGoals.length - (activeGoal ? 1 : 0);

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
          goal={
            activeGoal
              ? {
                  name: activeGoal.name,
                  current: balances.save,
                  target: activeGoal.target,
                  otherCount,
                  imageUrl: activeGoal.imageUrl,
                }
              : undefined
          }
        />
      </Link>

      {/* HANDOFF.md実例: つかう / ふやす row（同サイズ2カラム） */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Link href="/history">
            <BalanceCard
              theme={theme}
              kind="spend"
              label="つかう"
              icon={<span style={{ fontSize: 20 }}>👛</span>}
              amount={balances.spend}
            />
          </Link>
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
