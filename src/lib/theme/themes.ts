export type ThemeKey = "rei_blue" | "jun_red" | "parent_dark";

export const THEME_KEYS: ThemeKey[] = ["rei_blue", "jun_red", "parent_dark"];

// 実際のトークン値は src/app/globals.css の [data-theme="..."] で定義する。
// ここでは表示名など、TSコードから参照したい付随情報を持つ。
export const THEME_LABELS: Record<ThemeKey, string> = {
  rei_blue: "れい（ハワイアンブルー）",
  jun_red: "じゅん（レッド）",
  parent_dark: "おとうさん（ダーク）",
};
