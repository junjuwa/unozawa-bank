import { ChildTheme } from "@/lib/theme/childTheme";

export function KpiCard({
  theme,
  label,
  value,
  caption,
}: {
  theme: ChildTheme;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 22, color: theme.ink }}>{value}</div>
      <div style={{ fontSize: 12, color: theme.sub, marginTop: 4 }}>{label}</div>
      {caption && (
        <div style={{ fontSize: 11, color: theme.sub, marginTop: 2, opacity: 0.8 }}>{caption}</div>
      )}
    </div>
  );
}
