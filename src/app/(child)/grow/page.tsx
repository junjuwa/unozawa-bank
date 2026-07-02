"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { INVEST_LOTS } from "@/lib/mock/investLots";
import { useInvestmentLots } from "@/hooks/useInvestmentLots";
import { LotCard } from "@/components/child/LotCard";
import { GrowHintBanner } from "@/components/child/GrowHintBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function GrowPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { lots: realLots, loading } = useInvestmentLots();
  const lots = realLots ?? INVEST_LOTS[themeKey];
  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <GrowHintBanner theme={theme} />
      {lots.length === 0 ? (
        <p style={{ color: theme.sub }}>まだ ふやしてないよ</p>
      ) : (
        lots.map((lot, i) => <LotCard key={lot.id} theme={theme} lot={lot} index={i} />)
      )}
    </div>
  );
}
