import { ChildTheme } from "@/lib/theme/childTheme";

type Boxes = { spend: number; save: number; grow: number };

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function ChildSummaryCard({
  theme,
  name,
  total,
  boxes,
  goalName,
  goalProgress,
  weeklyHistory,
}: {
  theme: ChildTheme;
  name: string;
  total: number;
  boxes: Boxes;
  goalName: string;
  goalProgress: number;
  weeklyHistory: number[];
}) {
  const fmt = (n: number) => new Intl.NumberFormat("ja-JP").format(n);

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
              color: "#fff",
            }}
          >
            {name.slice(0, 1)}
          </span>
          <span style={{ fontWeight: 800, color: theme.ink }}>{name}</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>¥{fmt(total)}</span>
      </div>

      <div style={{ display: "flex", gap: 8, fontSize: 12, color: theme.sub, marginBottom: 10 }}>
        <span>つかう ¥{fmt(boxes.spend)}</span>
        <span>ためる ¥{fmt(boxes.save)}</span>
        <span>ふやす ¥{fmt(boxes.grow)}</span>
      </div>

      {goalName && (
        <>
          <div style={{ fontSize: 11, color: theme.sub, marginBottom: 4 }}>
            目標：{goalName}　達成 {goalProgress}%
          </div>
          <div style={{ height: 8, borderRadius: 4, background: theme.progressTrack, overflow: "hidden", marginBottom: 12 }}>
            <div
              style={{ height: "100%", width: `${goalProgress}%`, background: theme.progressFill }}
            />
          </div>
        </>
      )}

      <div style={{ fontSize: 11, color: theme.sub, marginBottom: 4 }}>今週ためた額</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 36 }}>
        {weeklyHistory.map((amount, i) => {
          const max = Math.max(1, ...weeklyHistory);
          const height = Math.max(2, Math.round((amount / max) * 32));
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div
                style={{
                  width: "100%",
                  height,
                  borderRadius: 2,
                  background: amount > 0 ? theme.accent : theme.progressTrack,
                }}
              />
              <span style={{ fontSize: 8, color: theme.sub }}>{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
