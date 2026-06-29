// lib/theme.ts — 表層トークン（骨格は共通、ここだけユーザーで差し替え）
// Okozukai-Home.html を正とした値。ピクセルの最終確認は HTML を参照。

export type ThemeKey = 'rei' | 'jun' | 'parent';

export interface Theme {
  key: ThemeKey;
  fontFamily: string;          // 見出し/本文の主フォント
  headingWeight: number;       // 見出しの太さ
  frameBg: string;             // 端末背景
  ink: string;                 // 主テキスト
  sub: string;                 // サブテキスト
  accent: string;             // 差し色（主）
  accentInk: string;          // 差し色の濃色（強調文字）
  cardBg: string;
  cardRadius: number;          // px
  cardShadow: string;
  cardBorder: string;          // 'none' か枠線
  progressTrack: string;
  progressFill: string;        // ためる/標準
  progressFillGrow: string;    // ふやす（成長＝緑）
  navActive: string;
  navActiveBg: string;         // active ピル背景（''=なし）
  navIdle: string;
  coin: 'gold-soft' | 'gold-hard' | 'none';
  useRuby: boolean;            // 子供=true / 親=false
}

export const themes: Record<ThemeKey, Theme> = {
  // れい：水彩トロピカル（丸ゴシック・大角丸・やわ影）
  rei: {
    key: 'rei',
    fontFamily: "var(--font-rei), 'Zen Maru Gothic', system-ui, sans-serif",
    headingWeight: 900,
    frameBg: 'linear-gradient(180deg,#CDEEFF 0%,#A6DEF7 48%,#8FD3F4 100%)',
    ink: '#1B3A6B', sub: '#2c6f96', accent: '#FF7E6B', accentInk: '#FF6B55',
    cardBg: '#ffffff', cardRadius: 24, cardShadow: '0 13px 28px rgba(27,58,107,.15)', cardBorder: 'none',
    progressTrack: '#DCEFFB', progressFill: 'linear-gradient(90deg,#FFB199,#FF7E6B)',
    progressFillGrow: 'linear-gradient(90deg,#7FE0A8,#3DB66E)',
    navActive: '#FF7E6B', navActiveBg: '#FFE3DC', navIdle: '#9bbdd6',
    coin: 'gold-soft', useRuby: true,
  },
  // じゅん：アメコミ（極太・太黒枠・ハード影・ハーフトーン）
  jun: {
    key: 'jun',
    fontFamily: "var(--font-jun), 'RocknRoll One', system-ui, sans-serif",
    headingWeight: 400, // RocknRoll One は単一ウェイト。太さは字形で担保
    frameBg: '#1B6CD9', // ＋ ハーフトーン網点/集中線はデコレーション層で重ねる
    ink: '#102A54', sub: '#1B6CD9', accent: '#E2231A', accentInk: '#E2231A',
    cardBg: '#ffffff', cardRadius: 10, cardShadow: '6px 6px 0 #111', cardBorder: '3px solid #111',
    progressTrack: '#ffffff', progressFill: 'repeating-linear-gradient(45deg,#E2231A,#E2231A 7px,#b81c14 7px,#b81c14 14px)',
    progressFillGrow: 'repeating-linear-gradient(45deg,#1B9E5A,#1B9E5A 6px,#15833f 6px,#15833f 12px)',
    navActive: '#E2231A', navActiveBg: '', navIdle: '#102A54',
    coin: 'gold-hard', useRuby: true,
  },
  // 親：ダークグレー管理UI（漢字・データ重視・抑制配色）
  parent: {
    key: 'parent',
    fontFamily: "-apple-system,'Hiragino Kaku Gothic ProN',system-ui,sans-serif",
    headingWeight: 700,
    frameBg: '#1E2228',
    ink: '#E7EAEE', sub: '#9AA3AD', accent: '#5B8DEF', accentInk: '#5B8DEF',
    cardBg: '#272D35', cardRadius: 13, cardShadow: 'none', cardBorder: '1px solid #3A424C',
    progressTrack: '#3A424C', progressFill: 'linear-gradient(90deg,#E26D62,#E0846F)',
    progressFillGrow: 'linear-gradient(90deg,#4FB477,#62C089)',
    navActive: '#5B8DEF', navActiveBg: '', navIdle: '#6E7884',
    coin: 'none', useRuby: false,
  },
};

// 状態色（必ず色＋アイコンで併用すること）
export const statusColors = {
  pending:  { fg: '#B07D12', bg: '#FFF1CC', border: '#F2C94C', icon: 'hourglass', label: 'しんせいちゅう' },
  apply:    { fg: '#ffffff', bg: 'accent',  border: 'accent',  icon: 'paper-plane', label: '申請する' },
  approved: { fg: '#2E9C5B', bg: '#DCF5E6', border: '#3DB66E', icon: 'check', label: 'OK！承認' },
  rejected: { fg: '#E26D62', bg: 'transparent', border: '#E26D62', icon: 'x', label: '却下' },
} as const;

// 箱の識別色（つかう/ためる/ふやす）
export const boxColors = {
  use:    { tint: '#E4F5FF', ink: '#2C7BB0', dot: '#5B8DEF' },
  save:   { tint: '#FFEDE9', ink: '#FF7E6B', dot: '#E26D62' },
  invest: { tint: '#FFF6DA', ink: '#E0A810', dot: '#E0A042' },
} as const;
