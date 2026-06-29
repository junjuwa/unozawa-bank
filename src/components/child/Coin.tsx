// HANDOFF.md §9: 金額は数字＋お金の絵を併記し桁感覚を補う。
import { ChildTheme } from "@/lib/theme/childTheme";

export function Coin({ coin, size = 18 }: { coin: ChildTheme["coin"]; size?: number }) {
  if (coin === "none") return null;
  const isHard = coin === "gold-hard";
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="#FFD23F"
        stroke={isHard ? "#111" : "#fff"}
        strokeWidth={isHard ? 2 : 1.5}
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill={isHard ? "#111" : "#B07D12"}
      >
        ¥
      </text>
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
