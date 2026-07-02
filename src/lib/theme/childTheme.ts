// HANDOFF.md / Okozukai-Home.html の表層トークンを、既存DBスキーマのThemeKey
// (rei_blue/jun_red/parent_dark)にマッピングして持つ。骨格は共通コンポーネント、
// 表層はここの値だけが画面ごとに差し替わる。ピクセルの最終確認はHANDOFFのHTML参照。

export type { ThemeKey } from "./themes";
import type { ThemeKey } from "./themes";

export interface ChildTheme {
  fontFamily: string;
  headingWeight: number;
  frameBg: string;
  ink: string;
  sub: string;
  accent: string;
  accentInk: string;
  cardBg: string;
  cardRadius: number;
  cardShadow: string;
  cardBorder: string;
  progressTrack: string;
  progressFill: string;
  progressFillGrow: string;
  navActive: string;
  navActiveBg: string;
  navIdle: string;
  coin: "gold-soft" | "gold-hard" | "none";
}

export const childThemes: Record<ThemeKey, ChildTheme> = {
  // れい: 水彩トロピカル(丸ゴシック・大角丸・やわ影)
  rei_blue: {
    fontFamily: "var(--font-rei), 'Zen Maru Gothic', system-ui, sans-serif",
    headingWeight: 900,
    frameBg: "linear-gradient(180deg,#CDEEFF 0%,#A6DEF7 48%,#8FD3F4 100%)",
    ink: "#1B3A6B",
    sub: "#2c6f96",
    accent: "#FF7E6B",
    accentInk: "#FF6B55",
    cardBg: "#ffffff",
    cardRadius: 24,
    cardShadow: "0 13px 28px rgba(27,58,107,.15)",
    cardBorder: "none",
    progressTrack: "#DCEFFB",
    progressFill: "linear-gradient(90deg,#FFB199,#FF7E6B)",
    progressFillGrow: "linear-gradient(90deg,#7FE0A8,#3DB66E)",
    navActive: "#FF7E6B",
    navActiveBg: "#FFE3DC",
    navIdle: "#9bbdd6",
    coin: "gold-soft",
  },
  // じゅん: アメコミ(極太・太黒枠・ハード影)
  jun_red: {
    fontFamily: "var(--font-jun), 'RocknRoll One', system-ui, sans-serif",
    headingWeight: 400,
    frameBg: "#1B6CD9",
    ink: "#102A54",
    sub: "#1B6CD9",
    accent: "#E2231A",
    accentInk: "#E2231A",
    cardBg: "#ffffff",
    cardRadius: 10,
    cardShadow: "6px 6px 0 #111",
    cardBorder: "3px solid #111",
    progressTrack: "#ffffff",
    progressFill:
      "repeating-linear-gradient(45deg,#E2231A,#E2231A 7px,#b81c14 7px,#b81c14 14px)",
    progressFillGrow:
      "repeating-linear-gradient(45deg,#1B9E5A,#1B9E5A 6px,#15833f 6px,#15833f 12px)",
    navActive: "#E2231A",
    navActiveBg: "",
    navIdle: "#102A54",
    coin: "gold-hard",
  },
  // 親: ダークグレー管理UI
  parent_dark: {
    fontFamily:
      "-apple-system,'Hiragino Kaku Gothic ProN',system-ui,sans-serif",
    headingWeight: 700,
    frameBg: "#1E2228",
    ink: "#E7EAEE",
    sub: "#9AA3AD",
    accent: "#5B8DEF",
    accentInk: "#5B8DEF",
    cardBg: "#272D35",
    cardRadius: 13,
    cardShadow: "none",
    cardBorder: "1px solid #3A424C",
    progressTrack: "#3A424C",
    progressFill: "linear-gradient(90deg,#E26D62,#E0846F)",
    progressFillGrow: "linear-gradient(90deg,#4FB477,#62C089)",
    navActive: "#5B8DEF",
    navActiveBg: "",
    navIdle: "#6E7884",
    coin: "none",
  },
};
