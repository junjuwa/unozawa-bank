import { ChildTheme } from "@/lib/theme/childTheme";

export function AuthTile({
  theme,
  emoji,
  label,
  onClick,
}: {
  theme: ChildTheme;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        boxShadow: theme.cardShadow,
        padding: "28px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        color: theme.ink,
        fontFamily: theme.fontFamily,
        width: "100%",
      }}
    >
      <span style={{ fontSize: 40 }}>{emoji}</span>
      <span style={{ fontWeight: 900, fontSize: 18 }}>{label}</span>
    </button>
  );
}
