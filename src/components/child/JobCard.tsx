// HANDOFF.md §3-4: おしごと。絵カード＋報酬＋状態（しんせいちゅう／申請する／OK！承認）
import { ChildTheme } from "@/lib/theme/childTheme";
import { MockJob } from "@/lib/mock/jobsMock";
import { STATUS_COLORS } from "@/lib/theme/statusColors";

export function JobCard({
  theme,
  job,
  name,
  reward,
  onApply,
}: {
  theme: ChildTheme;
  job: MockJob;
  name: string;
  reward: number;
  onApply: () => void;
}) {
  const status = STATUS_COLORS[job.status];
  const isApply = job.status === "apply";

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        boxShadow: theme.cardShadow,
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 13, color: theme.sub }}>
          {new Intl.NumberFormat("ja-JP").format(reward)}えん
        </div>
      </div>

      {isApply ? (
        <button
          type="button"
          onClick={onApply}
          style={{
            background: theme.accent,
            color: "#fff",
            borderRadius: 20,
            padding: "8px 16px",
            fontWeight: 800,
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {status.label}
        </button>
      ) : (
        <span
          style={{
            color: status.fg,
            background: status.bg,
            border: status.border ? `1px solid ${status.border}` : undefined,
            borderRadius: 20,
            padding: "6px 14px",
            fontWeight: 800,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {status.label}
        </span>
      )}
    </div>
  );
}
