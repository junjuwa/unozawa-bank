import { ChildTheme } from "@/lib/theme/childTheme";

type Boxes = { spend: number; save: number; grow: number };

export function ChildSummaryCard({
  theme,
  name,
  total,
  boxes,
  goalName,
  goalProgress,
}: {
  theme: ChildTheme;
  name: string;
  total: number;
  boxes: Boxes;
  goalName: string;
  goalProgress: number;
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
          <div style={{ height: 8, borderRadius: 4, background: theme.progressTrack, overflow: "hidden" }}>
            <div
              style={{ height: "100%", width: `${goalProgress}%`, background: theme.progressFill }}
            />
          </div>
        </>
      )}
    </div>
  );
}
