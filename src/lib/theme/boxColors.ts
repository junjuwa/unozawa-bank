// HANDOFF.md theme.ts boxColors: 箱の識別色（つかう/ためる/ふやす）。テーマ非依存。
// 命名はDBスキーマのAccountKind(spend/save/grow)に合わせている。
export const BOX_COLORS = {
  spend: { tint: "#E4F5FF", ink: "#2C7BB0" },
  save: { tint: "#FFEDE9", ink: "#FF7E6B" },
  grow: { tint: "#FFF6DA", ink: "#E0A810" },
} as const;
