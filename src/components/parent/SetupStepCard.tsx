import { ChildTheme } from "@/lib/theme/childTheme";

export function SetupStepCard({
  theme,
  step,
  title,
  description,
  state,
}: {
  theme: ChildTheme;
  step: number;
  title: string;
  description: string;
  state: "done" | "current" | "upcoming";
}) {
  const color = state === "upcoming" ? theme.sub : theme.ink;
  const badgeBg = state === "done" ? "#3DB66E" : state === "current" ? theme.accent : theme.progressTrack;

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        padding: 16,
        display: "flex",
        gap: 14,
        opacity: state === "upcoming" ? 0.6 : 1,
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: badgeBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {state === "done" ? "✓" : step}
      </span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14, color, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: theme.sub }}>{description}</div>
      </div>
    </div>
  );
}
