// components/RubyText.tsx — 漢字＋ルビ（3年生まで）。将来「ぜんぶひらがな」モード対応の布石つき。
'use client';
import React from 'react';

export type TextLevel = 'kanji-ruby' | 'hiragana';

// セグメント：プレーン文字列、または [漢字, よみ] のルビ対。
//   例: ['', ['今日','きょう'], 'も おかねを ためよう！']
export type Seg = string | [kanji: string, yomi: string];

// 同一描画内で繰り返す同語は初出のみルビ（2回目以降は省く）→ 呼び出し側で seen を共有するか、
// ここでは shownOnce オプションで簡易対応。
export function RubyText({
  segs,
  level = 'kanji-ruby',
  className,
}: {
  segs: Seg[];
  level?: TextLevel;
  className?: string;
}) {
  const seen = new Set<string>();
  return (
    <span className={className} style={{ lineHeight: 1.9 /* ルビ込みで最初から確保 */ }}>
      {segs.map((s, i) => {
        if (typeof s === 'string') return <React.Fragment key={i}>{s}</React.Fragment>;
        const [kanji, yomi] = s;
        if (level === 'hiragana') return <React.Fragment key={i}>{yomi}</React.Fragment>;
        const dup = seen.has(kanji);
        seen.add(kanji);
        // 初出のみルビ、2回目以降は漢字のみ
        return dup ? (
          <React.Fragment key={i}>{kanji}</React.Fragment>
        ) : (
          <ruby key={i} style={{ rubyAlign: 'center' as any }}>
            {kanji}
            <rt style={{ fontSize: '0.5em', fontWeight: 500, letterSpacing: '.02em' }}>{yomi}</rt>
          </ruby>
        );
      })}
    </span>
  );
}

// 文言は keys で管理し、表記レベルで描画を切替（ハードコードしない）。
// lib/i18n.ts 側に文言テーブルを置き、ここへ Seg[] を渡す運用を推奨。
