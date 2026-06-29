"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { INVEST_LOTS } from "@/lib/mock/investLots";
import { LotCard } from "@/components/child/LotCard";

export default function GrowPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const lots = INVEST_LOTS[themeKey];

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>ふやす</h1>
      {lots.length === 0 ? (
        <p style={{ color: theme.sub }}>まだ ふやしてないよ</p>
      ) : (
        lots.map((lot) => <LotCard key={lot.id} theme={theme} lot={lot} />)
      )}
    </div>
  );
}
