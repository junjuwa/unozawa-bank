import { ChildTheme } from "@/lib/theme/childTheme";

export function ApprovalCard({
  theme,
  childName,
  jobName,
  reward,
  onApprove,
  onReject,
}: {
  theme: ChildTheme;
  childName: string;
  jobName: string;
  reward: number;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: theme.sub }}>{childName}</div>
        <div style={{ fontWeight: 800, color: theme.ink }}>{jobName}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: theme.accentInk }}>
          ¥{new Intl.NumberFormat("ja-JP").format(reward)}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReject}
          style={{
            background: "transparent",
            border: "1px solid #E26D62",
            color: "#E26D62",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          却下
        </button>
        <button
          type="button"
          onClick={onApprove}
          style={{
            background: "#3DB66E",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          承認する
        </button>
      </div>
    </div>
  );
}
