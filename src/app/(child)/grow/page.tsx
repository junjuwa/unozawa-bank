"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { INVEST_LOTS } from "@/lib/mock/investLots";
import { useInvestmentLots } from "@/hooks/useInvestmentLots";
import { useAccounts } from "@/hooks/useAccounts";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { LotCard } from "@/components/child/LotCard";
import { GrowHintBanner } from "@/components/child/GrowHintBanner";
import { GrowDepositSheet } from "@/components/child/GrowDepositSheet";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function GrowPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { lots: realLots, loading, refetch: refetchLots } = useInvestmentLots();
  const { accounts, refetch: refetchAccounts } = useAccounts();
  const { balances: mockBalances } = useMockBalances();

  const lots = realLots ?? INVEST_LOTS[themeKey];
  const spendBalance = accounts?.spend ?? mockBalances[themeKey].spend;
  const hasRealAccounts = !!accounts;

  const [showSheet, setShowSheet] = useState(false);

  if (loading) return <LoadingScreen />;

  const isJun = themeKey === "jun_red";

  function handleSuccess() {
    refetchAccounts?.();
    refetchLots?.();
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <GrowHintBanner theme={theme} />
      {lots.map((lot, i) => (
        <LotCard key={lot.id} theme={theme} lot={lot} index={i} total={lots.length} />
      ))}
      <button
        type="button"
        onClick={() => setShowSheet(true)}
        style={{
          background: "linear-gradient(135deg,#3DB66E,#2da05e)",
          color: "#fff",
          borderRadius: isJun ? 12 : theme.cardRadius,
          border: isJun ? "3px solid #111" : "none",
          boxShadow: isJun ? "4px 4px 0 #111" : "0 4px 14px rgba(27,158,90,.35)",
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

      {showSheet && (
        <GrowDepositSheet
          theme={theme}
          themeKey={themeKey}
          spendBalance={spendBalance}
          hasRealAccounts={hasRealAccounts}
          onClose={() => setShowSheet(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
