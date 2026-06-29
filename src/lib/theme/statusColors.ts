// HANDOFF.md theme.ts: 状態色（テーマ非依存）。必ず色＋アイコン/ラベルを併用すること。
export type JobStatus = "pending" | "apply" | "approved" | "rejected";

export const STATUS_COLORS: Record<
  JobStatus,
  { fg: string; bg: string; border: string; label: string }
> = {
  pending: { fg: "#B07D12", bg: "#FFF1CC", border: "#F2C94C", label: "しんせいちゅう" },
  apply: { fg: "#ffffff", bg: "", border: "", label: "申請する" }, // bg/borderは呼び出し側でtheme.accentを使う
  approved: { fg: "#2E9C5B", bg: "#DCF5E6", border: "#3DB66E", label: "OK！承認" },
  rejected: { fg: "#E26D62", bg: "transparent", border: "#E26D62", label: "却下" },
};
