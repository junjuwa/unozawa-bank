// Claude designで作成したicons/avatar.svg, gift.svgを移植。
// アバター・目標画像が未設定のときのプレースホルダアイコン。

export function AvatarIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20 a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function GiftIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9 h18 v3 H3 Z" />
      <path d="M12 6 V20" />
      <path d="M12 6 C12 6 11 3 8.5 3 a2 2 0 0 0 0 4 H12 C12 7 13 4 15.5 4 a2 2 0 0 1 0 3 H12" />
    </svg>
  );
}
