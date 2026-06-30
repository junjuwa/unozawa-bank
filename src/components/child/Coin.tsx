// HANDOFF.md §9: 金額は数字＋お金の絵を併記し桁感覚を補う。
// アイコン形状はClaude designで作成したicons/coin.svgを使用。
import { ChildTheme } from "@/lib/theme/childTheme";

export function Coin({ coin, size = 18 }: { coin: ChildTheme["coin"]; size?: number }) {
  if (coin === "none") return null;
  const isHard = coin === "gold-hard";
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={isHard ? "#FFD23F" : "none"}
      stroke={isHard ? "#111" : "#B07D12"}
      strokeWidth={isHard ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" fill={isHard ? "#FFD23F" : "#FFE89A"} />
      <path d="M12 11 V16" />
      <path d="M9 8 L12 11 L15 8" />
      <path d="M9.5 12 H14.5 M9.5 13.8 H14.5" />
    </svg>
  );
}

export function CoinRow({
  coin,
  count,
  size,
}: {
  coin: ChildTheme["coin"];
  count: number;
  size?: number;
}) {
  if (coin === "none") return null;
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: Math.max(1, Math.min(count, 6)) }).map((_, i) => (
        <Coin key={i} coin={coin} size={size} />
      ))}
    </span>
  );
}
