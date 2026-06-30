import { ChildTheme } from "@/lib/theme/childTheme";
import { CoinRow } from "@/components/child/Coin";
import { GoalCard } from "@/components/child/GoalCard";
import { BOX_COLORS } from "@/lib/theme/boxColors";

type BoxKind = keyof typeof BOX_COLORS;

type BalanceCardProps = {
  theme: ChildTheme;
  kind: BoxKind;
  label: string;
  icon: React.ReactNode;
  amount: number;
  // ためるカードのみ"featured"（アイコン+ラベル+金額を横一列のヘッダーにし、目標を内包する）。
  // つかう/ふやすは"compact"（アイコン→ラベル→金額→コイン列の縦並び。HANDOFF.md実例の構造）。
  layout?: "featured" | "compact";
  goal?: { name: string; current: number; target: number; otherCount: number; imageUrl?: string };
};

export function BalanceCard({
  theme,
  kind,
  label,
  icon,
  amount,
  layout = "compact",
  goal,
}: BalanceCardProps) {
  const box = BOX_COLORS[kind];
  const coinCount = Math.max(1, Math.min(6, Math.round(amount / 150)));

  const iconBadge = (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 13,
        background: box.tint,
        color: box.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );

  if (layout === "featured") {
    return (
      <div
        style={{
          background: theme.cardBg,
          color: theme.ink,
          borderRadius: theme.cardRadius,
          boxShadow: theme.cardShadow,
          border: theme.cardBorder,
          padding: 16,
          fontFamily: theme.fontFamily,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {iconBadge}
          <span style={{ fontWeight: 900, fontSize: 18 }}>{label}</span>
          <span style={{ marginLeft: "auto", fontWeight: 900, fontSize: 22, color: theme.accentInk }}>
            {new Intl.NumberFormat("ja-JP").format(amount)}
            <span style={{ fontSize: 13 }}>えん</span>
          </span>
        </div>
        {goal && goal.target > 0 && (
          <>
            <GoalCard
              theme={theme}
              name={goal.name}
              current={goal.current}
              target={goal.target}
              imageUrl={goal.imageUrl}
            />
            {goal.otherCount > 0 && (
              <div style={{ fontSize: 12, color: theme.sub, textAlign: "right", marginTop: 4 }}>
                ほかに {goal.otherCount}こ ＞
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme.cardBg,
        color: theme.ink,
        borderRadius: theme.cardRadius,
        boxShadow: theme.cardShadow,
        border: theme.cardBorder,
        padding: 15,
        fontFamily: theme.fontFamily,
      }}
    >
      <div style={{ marginBottom: 10 }}>{iconBadge}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontWeight: 900, fontSize: 17 }}>{label}</span>
        {kind === "grow" && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              background: "#3DB66E",
              borderRadius: 8,
              padding: "2px 6px",
            }}
          >
            ▲ふえる
          </span>
        )}
      </div>

      <div style={{ fontWeight: 900, fontSize: 22, margin: "2px 0 8px" }}>
        {new Intl.NumberFormat("ja-JP").format(amount)}
        <span style={{ fontSize: 12 }}>えん</span>
      </div>

      <CoinRow coin={theme.coin} count={coinCount} size={18} />
    </div>
  );
}
