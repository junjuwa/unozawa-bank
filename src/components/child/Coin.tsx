import React from "react";
import type { ThemeKey } from "@/lib/theme/childTheme";

export function Coin({ size = 22, themeKey }: { size?: 22 | 44; themeKey: ThemeKey }) {
  const fontSize = Math.round(size * 0.42);
  const isJun = themeKey === "jun_red";
  const common: React.CSSProperties = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Zen Maru Gothic'", fontWeight: 900, fontSize, position: "relative",
  };
  if (isJun) {
    return <span style={{ ...common, background: "#FFD23F", border: "2.5px solid #111", boxShadow: "2px 2px 0 #111", color: "#111" }}>¥</span>;
  }
  return (
    <span style={{ ...common, background: "radial-gradient(circle at 35% 30%, #FFE89A, #FFD23F)", border: "2px solid #fff", boxShadow: "0 3px 5px rgba(27,58,107,.16)", color: "#C98A12" }}>
      ¥
      <span style={{ position: "absolute", top: "14%", left: "20%", width: "38%", height: "26%", borderRadius: "50%", background: "rgba(255,255,255,.7)", transform: "rotate(-18deg)" }} />
    </span>
  );
}

export function CoinRow({ themeKey, count, size = 22 }: { themeKey: ThemeKey; count: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
      {Array.from({ length: Math.max(1, Math.min(count, 6)) }).map((_, i) => (
        <Coin key={i} themeKey={themeKey} size={size <= 22 ? 22 : 44} />
      ))}
    </span>
  );
}
