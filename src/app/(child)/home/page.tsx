"use client";

import Link from "next/link";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockGoals } from "@/lib/mock/MockGoalsContext";
import { useMockMascot } from "@/lib/mock/MockMascotContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useProfile } from "@/hooks/useProfile";
import { useGoals } from "@/hooks/useGoals";
import { BalanceCard } from "@/components/child/BalanceCard";
import { Mascot } from "@/components/child/Mascot";
import { BoxIcon } from "@/components/child/boxIcons";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function HomePage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  // 実ログイン済みならaccountsテーブルの実残高、未ログインならモックにフォールバック
  const { accounts, loading: accountsLoading } = useAccounts();
  const mockBalances = useMockBalances().balances[themeKey];
  const balances = accounts ?? mockBalances;

  const { goals: realGoals, loading: goalsLoading } = useGoals();
  const mockGoals = useMockGoals().goals[themeKey];
  const childGoals = realGoals ?? mockGoals;
  const activeGoal = childGoals.find((g) => g.active);
  const activeGoalImageUrl = activeGoal
    ? ("image_url" in activeGoal ? activeGoal.image_url ?? undefined : activeGoal.imageUrl)
    : undefined;
  const otherCount = childGoals.length - (activeGoal ? 1 : 0);
  const { profile, loading: profileLoading } = useProfile();
  const mockMascotUrl = useMockMascot().mascots[themeKey];
  // 実ログイン済みかつtheme_keyが一致すれば実DBのmascot_urlを優先
  const mascotImageUrl =
    profile && (profile as { theme_key?: string; mascot_url?: string | null }).theme_key === themeKey
      ? ((profile as { mascot_url?: string | null }).mascot_url ?? mockMascotUrl)
      : mockMascotUrl;

  if (accountsLoading || goalsLoading || profileLoading) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Mascot
        theme={theme}
        themeKey={themeKey}
        message="今日も おかねを ためよう！"
        imageUrl={mascotImageUrl}
      />

      {/* HANDOFF.md §3: ためるカードはボトムナビ項目ではなく、ホームからのタップで /goals へ遷移 */}
      <Link href="/goals">
        <BalanceCard
          theme={theme}
          kind="save"
          layout="featured"
          label="ためる"
          icon={<BoxIcon kind="save" />}
          amount={balances.save}
          goal={
            activeGoal
              ? {
                  name: activeGoal.name,
                  current: balances.save,
                  target: activeGoal.target,
                  otherCount,
                  imageUrl: activeGoalImageUrl,
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
              icon={<BoxIcon kind="spend" />}
              amount={balances.spend}
            />
          </Link>
        </div>
        <div className="flex-1">
          <BalanceCard
            theme={theme}
            kind="grow"
            label="ふやす"
            icon={<BoxIcon kind="grow" />}
            amount={balances.grow}
          />
        </div>
      </div>
    </div>
  );
}
