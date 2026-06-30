// Claude designで作成したicons/use.svg, save.svg, invest.svgを移植。
// つかう/ためる/ふやすの箱アイコン（絵文字プレースホルダの差し替え用）。
import { AccountKind } from "@/lib/mock/MockBalancesContext";

export function UseIcon({ size = 20 }: { size?: number }) {
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
      <path d="M4 7 a2 2 0 0 1 2-2 h11 a1 1 0 0 1 1 1 v2" />
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M16 12.5 h5 v3 h-5 a1.5 1.5 0 0 1 0 -3 Z" />
    </svg>
  );
}

export function SaveIcon({ size = 20 }: { size?: number }) {
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
      <path d="M3 13 a7 5 0 0 1 7-5 h2 l3 -2 v3.2 a7 5 0 0 1 4 3.8 h1.5 v3 h-1.8 a7 5 0 0 1 -2.7 2.8 V21 h-2 v-1.4 a8 5 0 0 1 -4 0 V21 H8 v-1.6 A7 5 0 0 1 3 15 Z" />
      <path d="M10 8.5 h3" />
      <circle cx="6.5" cy="13.5" r=".6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InvestIcon({ size = 20 }: { size?: number }) {
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
      <ellipse cx="12" cy="16.5" rx="6" ry="2.5" />
      <path d="M6 16.5 v2 a6 2.5 0 0 0 12 0 v-2" />
      <path d="M12 13 V4" />
      <path d="M8.5 7.5 L12 4 L15.5 7.5" />
    </svg>
  );
}

export function BoxIcon({ kind, size }: { kind: AccountKind; size?: number }) {
  if (kind === "spend") return <UseIcon size={size} />;
  if (kind === "save") return <SaveIcon size={size} />;
  return <InvestIcon size={size} />;
}
