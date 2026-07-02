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
      {lots.map((lot, i) => (
        <LotCard key={lot.id} theme={theme} lot={lot} index={i} total={lots.length} />
      ))}
      <button
        type="button"
        style={{
          background: theme.accent === "#E2231A" ? "linear-gradient(135deg,#3DB66E,#2da05e)" : "linear-gradient(135deg,#3DB66E,#2da05e)",
          color: "#fff",
          borderRadius: theme.cardRadius,
          border: theme.cardBorder !== "none" ? "3px solid #111" : "none",
          boxShadow: theme.cardBorder !== "none" ? "4px 4px 0 #111" : "0 4px 14px rgba(27,158,90,.35)",
          padding: "16px 0",
          fontFamily: theme.fontFamily,
          fontWeight: 900,
          fontSize: 16,
          width: "100%",
          cursor: "pointer",
        }}
      >
        ＋ あずける
      </button>
    </div>
  );
}
