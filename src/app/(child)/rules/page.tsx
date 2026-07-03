"use client";

import Link from "next/link";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useProfile } from "@/hooks/useProfile";
import { PROMISES } from "@/lib/content/promises";
import { PromiseCard } from "@/components/child/PromiseCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { THEME_LABELS } from "@/lib/theme/themes";

// マスコットSVG
const MascotSvg = () => (
  <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
    <rect x="19" y="13" width="26" height="16" rx="2.5" fill="#FFD86F" />
    <circle cx="26" cy="21" r="4.3" fill="none" stroke="#1B3A6B" strokeWidth="1.6" />
    <path d="M33 18H41M33 21H41M33 24H38" stroke="#1B3A6B" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13 20a4 4 0 0 1 8 0v13q11 4.5 22 0v-13a4 4 0 0 1 8 0v13a15 15 0 0 1-38 0Z" fill="#F5B62E" />
  </svg>
);

export default function RulesPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { profile, loading } = useProfile();

  if (loading) return <LoadingScreen />;

  const isJun = themeKey === "jun_red";
  const displayName =
    (profile as { display_name?: string; theme_key?: string } | null)?.theme_key === themeKey
      ? ((profile as { display_name?: string }).display_name ?? THEME_LABELS[themeKey])
      : THEME_LABELS[themeKey];

  const nameColor = isJun ? "#FFD23F" : theme.accentInk;
  const titleShadow = isJun
    ? "2px 2px 0 #111,-2px 2px 0 #111,2px -2px 0 #111,-2px -2px 0 #111,0 3px 0 #111"
    : undefined;

  return (
    <div className="pt-2" style={{ fontFamily: theme.fontFamily, color: theme.ink }}>

      {/* ヘッダー */}
      <header style={{ textAlign: "center", padding: "1.25rem 0.5rem 0.75rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            font: `700 0.72rem ${theme.fontFamily}`,
            letterSpacing: "0.14em",
            color: theme.sub,
            marginBottom: "0.7rem",
          }}
        >
          <span style={{ display: "inline-block", width: 20, height: 2, borderRadius: 2, background: "currentColor", opacity: 0.5 }} />
          やくそく
          <span style={{ display: "inline-block", width: 20, height: 2, borderRadius: 2, background: "currentColor", opacity: 0.5 }} />
        </span>
        <h1
          style={{
            margin: 0,
            font: `${theme.headingWeight} 1.55rem ${theme.fontFamily}`,
            color: isJun ? "#fff" : theme.ink,
            lineHeight: 1.5,
            textShadow: titleShadow,
          }}
        >
          <span style={{ color: nameColor }}>{displayName}</span>と パパ・ママの やくそく
        </h1>
      </header>

      {/* マスコット導入 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem",
          margin: "0.5rem 0 1.25rem",
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: isJun ? 14 : "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: isJun ? "3px solid #111" : "3px solid #fff",
            boxShadow: isJun ? "3px 3px 0 #111" : "0 6px 14px rgba(27,58,107,.2)",
          }}
        >
          <MascotSvg />
        </span>
        <div
          style={{
            flex: 1,
            background: theme.cardBg,
            border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
            borderRadius: isJun ? 14 : "18px 18px 18px 6px",
            padding: "0.7rem 0.9rem",
            font: `${isJun ? 400 : 700} 0.82rem ${theme.fontFamily}`,
            color: theme.ink,
            lineHeight: 1.9,
            boxShadow: isJun ? "4px 4px 0 #111" : theme.cardShadow,
          }}
        >
          いっしょに やくそく しようね
        </div>
      </div>

      {/* 約束カード × 5（モバイル1列・iPad 2列グリッド） */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        {PROMISES.map((item, i) => (
          <PromiseCard
            key={item.id}
            theme={theme}
            isJun={isJun}
            item={item}
            index={i}
          />
        ))}
      </div>

      {/* フッター */}
      <footer style={{ textAlign: "center", padding: "1rem 0.5rem 0.5rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            font: `${theme.headingWeight} 1rem ${theme.fontFamily}`,
            color: isJun ? "#fff" : theme.ink,
            textShadow: isJun ? "1.5px 1.5px 0 #111" : undefined,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: isJun ? "#FFD23F" : theme.accent }}>
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
          </svg>
          まもれると かっこいいね
        </span>
        <p
          style={{
            margin: "0.5rem 0 0",
            font: `${isJun ? 400 : 700} 0.74rem ${theme.fontFamily}`,
            color: isJun ? "#EAF2FF" : theme.sub,
          }}
        >
          ゆっくりで だいじょうぶ
        </p>
      </footer>

      {/* このアプリについて */}
      <div style={{ marginTop: "1.5rem", paddingBottom: "0.5rem" }}>
        <Link href="/about" style={{ display: "block", textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: theme.cardBg,
              border: theme.cardBorder !== "none" ? theme.cardBorder : "1.5px solid rgba(0,0,0,.07)",
              borderRadius: theme.cardRadius,
              padding: "14px 18px",
              fontFamily: theme.fontFamily,
              fontWeight: 700,
              fontSize: 15,
              color: theme.ink,
              boxShadow: theme.cardShadow,
            }}
          >
            <span style={{ fontSize: 22 }}>ℹ️</span>
            このアプリについて
            <span style={{ marginLeft: "auto", color: theme.sub, fontSize: 18 }}>›</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
