// HANDOFF.md §3-3: ふやす。ロットごと「あと◯かい ねたら」＋月の列＋プログレス＋満期額
import { ChildTheme } from "@/lib/theme/childTheme";
import { InvestLot } from "@/lib/mock/investLots";

export function LotCard({ theme, lot }: { theme: ChildTheme; lot: InvestLot }) {
  const progress = Math.round(((lot.totalDays - lot.remainingDays) / lot.totalDays) * 100);
  const moonCount = Math.min(lot.remainingDays, 10);

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        boxShadow: theme.cardShadow,
        padding: 16,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>あと</span>
        <span style={{ fontWeight: 900, fontSize: 28, color: theme.accentInk }}>
          {lot.remainingDays}
        </span>
        <span style={{ fontWeight: 700, fontSize: 14 }}>かい ねたら</span>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {Array.from({ length: moonCount }).map((_, i) => (
          <span key={i} style={{ fontSize: 16 }}>
            🌙
          </span>
        ))}
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 6,
          background: theme.progressTrack,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div style={{ height: "100%", width: `${progress}%`, background: theme.progressFillGrow }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>もとで {new Intl.NumberFormat("ja-JP").format(lot.principal)}えん</span>
        <span style={{ fontWeight: 800, color: theme.accentInk }}>
          まんきに もらえる {new Intl.NumberFormat("ja-JP").format(lot.interestAmount)}えん
        </span>
      </div>
    </div>
  );
}
