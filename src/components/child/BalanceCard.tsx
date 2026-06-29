import { ChildTheme } from "@/lib/theme/childTheme";
import { CoinRow } from "@/components/child/Coin";
import { GoalCard } from "@/components/child/GoalCard";

type BalanceCardProps = {
  theme: ChildTheme;
  label: string;
  emoji: string;
  amount: number;
  variant?: "default" | "grow";
  // ためるカードのみ目標を内包表示する(HANDOFF.md §3-1のためる大カード相当)
  goal?: { name: string; current: number; target: number; otherCount: number };
};

export function BalanceCard({ theme, label, emoji, amount, variant = "default", goal }: BalanceCardProps) {
  const progressFill = variant === "grow" ? theme.progressFillGrow : theme.progressFill;

  return (
    <div
      style={{
        background: theme.cardBg,
        color: theme.ink,
        borderRadius: theme.cardRadius,
        boxShadow: theme.cardShadow,
        border: theme.cardBorder,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: theme.fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{emoji}</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{label}</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 22, color: theme.accentInk }}>
          {new Intl.NumberFormat("ja-JP").format(amount)}えん
        </span>
      </div>

      {goal && goal.target > 0 ? (
        <>
          <GoalCard theme={theme} name={goal.name} current={goal.current} target={goal.target} />
          {goal.otherCount > 0 && (
            <div style={{ fontSize: 12, color: theme.sub, textAlign: "right" }}>
              ほかに {goal.otherCount}こ ＞
            </div>
          )}
        </>
      ) : (
        <CoinRow coin={theme.coin} count={Math.max(1, Math.min(6, Math.round(amount / 200)))} />
      )}

      {/* CSS変数は globals.css 側のフォールバック。テーマ別の質感差は progressFill 等で表現 */}
      {variant === "grow" && (
        <div style={{ height: 8, borderRadius: 4, background: theme.progressTrack, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "40%", background: progressFill }} />
        </div>
      )}
    </div>
  );
}
