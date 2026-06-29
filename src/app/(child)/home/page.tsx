"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { BalanceCard } from "@/components/child/BalanceCard";

export default function HomePage() {
  const { theme } = useMockChildTheme();
  // TODO(auth): accountsテーブルをprofile_idで取得し、kind別にマッピングする
  const balances = useMockBalances().balances[theme];

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <BalanceCard label="つかう" emoji="👛" amount={balances.spend} />
      <BalanceCard label="ためる" emoji="🐷" amount={balances.save} />
      <BalanceCard label="ふやす" emoji="🌱" amount={balances.grow} />
    </div>
  );
}
