"use client";
import React from "react";

export type TextLevel = "kanji-ruby" | "hiragana";

// string = プレーン文字列、[漢字, よみ] = ルビ対
export type Seg = string | [kanji: string, yomi: string];

export function RubyText({
  segs,
  level = "kanji-ruby",
  className,
}: {
  segs: Seg[];
  level?: TextLevel;
  className?: string;
}) {
  const seen = new Set<string>();
  return (
    <span className={className} style={{ lineHeight: 1.9 }}>
      {segs.map((s, i) => {
        if (typeof s === "string") return <React.Fragment key={i}>{s}</React.Fragment>;
        const [kanji, yomi] = s;
        if (level === "hiragana") return <React.Fragment key={i}>{yomi}</React.Fragment>;
        const dup = seen.has(kanji);
        seen.add(kanji);
        return dup ? (
          <React.Fragment key={i}>{kanji}</React.Fragment>
        ) : (
          <ruby key={i} style={{ rubyAlign: "center" } as React.CSSProperties}>
            {kanji}
            <rt style={{ fontSize: "0.5em", fontWeight: 500, letterSpacing: ".02em" }}>{yomi}</rt>
          </ruby>
        );
      })}
    </span>
  );
}
