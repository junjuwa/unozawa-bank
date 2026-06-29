// HANDOFF.md §5: 漢字＋ルビ(3年生までの配当漢字のみ)。
// nextjs/ruby.tsx を本リポジトリの型に合わせて移植。
"use client";

import React from "react";

export type TextLevel = "kanji-ruby" | "hiragana";

// セグメント: プレーン文字列、または[漢字, よみ]のルビ対。
// 例: ['', ['今日', 'きょう'], 'も おかねを ためよう！']
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
          <ruby key={i}>
            {kanji}
            <rt style={{ fontSize: "0.5em", fontWeight: 500, letterSpacing: ".02em" }}>
              {yomi}
            </rt>
          </ruby>
        );
      })}
    </span>
  );
}

// TODO: 画面数が増えたら lib/i18n.ts の t(key, level) に文言テーブルを抽出する
// （HANDOFF.md §10）。今は呼び出し側にSeg配列を直書きしている。
