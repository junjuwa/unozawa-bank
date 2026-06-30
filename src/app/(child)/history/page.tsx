"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useSpendHistory } from "@/hooks/useTransactions";
import { childThemes } from "@/lib/theme/childTheme";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function HistoryPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];

  const { records: realRecords, loading } = useSpendHistory();
  const mockRecords = useMockBalances().spendHistory[themeKey];
  if (loading) return <LoadingScreen />;
  const records = realRecords
    ? realRecords.map((r) => ({ id: r.id, amount: r.amount, memo: r.memo ?? "", createdAt: r.created_at }))
    : mockRecords;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>つかった きろく</h1>

      {records.length === 0 ? (
        <p style={{ color: theme.sub, fontSize: 13 }}>まだ きろくが ありません</p>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((r) => (
            <div
              key={r.id}
              style={{
                background: theme.cardBg,
                borderRadius: theme.cardRadius,
                border: theme.cardBorder,
                boxShadow: theme.cardShadow,
                padding: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: theme.ink,
                fontFamily: theme.fontFamily,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: theme.sub }}>
                  {new Date(r.createdAt).toLocaleDateString("ja-JP")}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.memo || "（なし）"}</div>
              </div>
              <span style={{ fontWeight: 900, fontSize: 16, color: theme.accentInk }}>
                -{new Intl.NumberFormat("ja-JP").format(r.amount)}えん
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
