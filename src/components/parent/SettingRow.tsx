import { ChildTheme } from "@/lib/theme/childTheme";

export function SettingRow({
  theme,
  label,
  value,
  unit,
  onIncrement,
  onDecrement,
}: {
  theme: ChildTheme;
  label: string;
  value: number;
  unit: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #3A424C",
      }}
    >
      <span style={{ color: theme.ink, fontSize: 14 }}>{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: theme.progressTrack,
            color: theme.ink,
            fontWeight: 900,
          }}
        >
          −
        </button>
        <span style={{ minWidth: 56, textAlign: "center", fontWeight: 800, color: theme.ink }}>
          {value}
          {unit}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: theme.accent,
            color: "#fff",
            fontWeight: 900,
          }}
        >
          ＋
        </button>
      </div>
    </div>
  );
}
