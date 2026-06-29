"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { BalanceCard } from "@/components/child/BalanceCard";

// MOCK: TODO(auth) — accountsテーブルをprofile_idで取得し、
// kind(spend/save/grow)別にマッピングする。
const MOCK_BALANCES = {
  rei_blue: { spend: 1200, save: 5400, grow: 3000 },
  jun_red: { spend: 800, save: 2100, grow: 0 },
};

export default function HomePage() {
  const { theme } = useMockChildTheme();
  const balances =
    theme === "rei_blue" ? MOCK_BALANCES.rei_blue : MOCK_BALANCES.jun_red;

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <BalanceCard label="つかう" emoji="👛" amount={balances.spend} />
      <BalanceCard label="ためる" emoji="🐷" amount={balances.save} />
      <BalanceCard label="ふやす" emoji="🌱" amount={balances.grow} />
    </div>
  );
}
