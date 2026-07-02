// ① LotCard — 運用ロット1件（ふやす画面）。index.html / rei-grow のテイストに準拠。
// 既存 src/components/child/LotCard.tsx を丸ごと置換。純粋レンダリング（"use client" 不要）。
import type { ChildTheme } from "@/lib/theme/childTheme";
import type { InvestLot } from "@/lib/mock/investLots";

export function LotCard({ theme, lot, index, total }: { theme: ChildTheme; lot: InvestLot; index?: number; total?: number }) {
  // 複数ロットがあるときのみ「N かい目」を付ける
  const n = (index ?? 0) + 1;
  const badge = (total ?? 1) > 1 ? `あずけ中 ${n}かい目` : "あずけ中";

  const interest = Math.max(0, lot.interestAmount - lot.principal);
  const ratePct = lot.principal > 0 ? Math.round((interest / lot.principal) * 100) : 0;
  const progress = lot.totalDays > 0 ? Math.min(100, Math.round(((lot.totalDays - lot.remainingDays) / lot.totalDays) * 100)) : 0;

  const green = "#1B9E5A";

  return (
    <div style={{
      background: theme.cardBg,
      borderRadius: theme.cardRadius,
      boxShadow: theme.cardShadow,
      border: theme.cardBorder,
      padding: 18,
      fontFamily: theme.fontFamily,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* 上段：番号バッジ ＋ 運用中バッジ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          font: `700 12px ${theme.fontFamily}`,
          color: theme.sub,
          background: "rgba(27,158,90,.10)",
          border: `1.5px solid rgba(27,158,90,.35)`,
          borderRadius: 8,
          padding: "3px 10px",
        }}>{badge}</span>
        <span style={{
          marginLeft: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          font: `700 11px ${theme.fontFamily}`,
          color: "#fff",
          background: green,
          borderRadius: 999,
          padding: "4px 11px",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,4 20,14 4,14" /></svg>
          運用中
        </span>
      </div>

      {/* 金額 */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, font: `900 16px ${theme.fontFamily}`, color: theme.ink }}>
        ¥<span style={{ fontSize: 34, letterSpacing: "-.02em" }}>{lot.principal.toLocaleString()}</span>
      </div>

      {/* 利息（満期にもらえる） */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, font: `700 13px ${theme.fontFamily}`, color: green }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,4 20,14 4,14" /></svg>
        +¥{interest.toLocaleString()}（+{ratePct}%）
        <span style={{ color: theme.sub, fontWeight: 700 }}>満期に もらえる</span>
      </div>

      {/* プログレスバー */}
      <div style={{
        height: 14,
        borderRadius: theme.cardBorder && theme.cardBorder !== "none" ? 3 : 8,
        background: "rgba(27,58,107,.12)",
        border: theme.cardBorder && theme.cardBorder !== "none" ? "2px solid #111" : "none",
        overflow: "hidden",
      }}>
        <div style={{ width: `${progress}%`, height: "100%", background: theme.progressFillGrow }} />
      </div>

      {/* 残日数 */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ font: `700 12px ${theme.fontFamily}`, color: theme.sub }}>まんきまで</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 2, font: `700 12px ${theme.fontFamily}`, color: theme.ink }}>
          あと <b style={{ fontSize: 20, fontWeight: 900, color: green }}>{lot.remainingDays}</b> 日
        </span>
      </div>
    </div>
  );
}
