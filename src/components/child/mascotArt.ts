// Claude designで作成したmascots/mascot-rei.svg, mascot-jun.svgをそのまま埋め込む。
// 静的な信頼済みアセット（ユーザー入力は含まれない）のためinnerHTMLで描画する。
export const MASCOT_SVG: Record<"rei_blue" | "jun_red", string> = {
  rei_blue: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 96 112" fill="none">
  <defs>
    <radialGradient id="reiBody" cx="42%" cy="34%" r="72%">
      <stop offset="0%" stop-color="#BDEBFF"></stop>
      <stop offset="60%" stop-color="#7FCDF4"></stop>
      <stop offset="100%" stop-color="#56B7EC"></stop>
    </radialGradient>
    <linearGradient id="reiLeaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7FD89A"></stop><stop offset="100%" stop-color="#4FB477"></stop>
    </linearGradient>
  </defs>
  <ellipse cx="48" cy="60" rx="42" ry="44" fill="#BFE9FF" opacity=".35"></ellipse>
  <path d="M48 18 C45 9 36 7 30 9 C31 17 39 21 48 20 Z" fill="url(#reiLeaf)"></path>
  <path d="M48 19 C51 11 59 9 65 11 C64 18 56 22 48 20 Z" fill="url(#reiLeaf)" opacity=".92"></path>
  <path d="M48 22 C70 22 84 40 84 62 C84 86 68 100 48 100 C28 100 12 86 12 62 C12 40 26 22 48 22 Z" fill="url(#reiBody)"></path>
  <ellipse cx="48" cy="70" rx="24" ry="22" fill="#EAF8FF" opacity=".55"></ellipse>
  <circle cx="30" cy="68" r="7" fill="#FF9C8C" opacity=".75"></circle>
  <circle cx="66" cy="68" r="7" fill="#FF9C8C" opacity=".75"></circle>
  <circle cx="38" cy="56" r="5.4" fill="#1B3A6B"></circle>
  <circle cx="58" cy="56" r="5.4" fill="#1B3A6B"></circle>
  <circle cx="39.6" cy="54.2" r="1.8" fill="#fff"></circle>
  <circle cx="59.6" cy="54.2" r="1.8" fill="#fff"></circle>
  <path d="M40 70 Q48 78 56 70" stroke="#1B3A6B" stroke-width="3.4" stroke-linecap="round" fill="none"></path>
  <circle cx="30" cy="44" r="4.4" fill="#fff" opacity=".7"></circle>
</svg>`,
  jun_red: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 96 112" fill="none">
  <path d="M48 6 53 22 70 14 64 31 84 32 70 44 84 58 64 60 70 78 53 70 48 88 43 70 26 78 32 60 12 58 26 44 12 32 32 31 26 14 43 22 Z" fill="#FFD23F" stroke="#111" stroke-width="2.4" stroke-linejoin="round"></path>
  <circle cx="48" cy="50" r="30" fill="#FF6A5E" stroke="#111" stroke-width="4"></circle>
  <path d="M28 62 a24 24 0 0 0 40 0" fill="#E2231A" opacity=".35"></path>
  <path d="M19 44 C30 40 66 40 77 44 L72 56 C70 60 64 60 60 57 C54 53 42 53 36 57 C32 60 26 60 24 56 Z" fill="#1B6CD9" stroke="#111" stroke-width="3.5" stroke-linejoin="round"></path>
  <path d="M30 47 L42 47 L38 54 L31 54 Z" fill="#fff" stroke="#111" stroke-width="2"></path>
  <path d="M66 47 L54 47 L58 54 L65 54 Z" fill="#fff" stroke="#111" stroke-width="2"></path>
  <path d="M38 66 Q48 74 58 66" stroke="#111" stroke-width="4" stroke-linecap="round" fill="none"></path>
  <path d="M40 67 Q48 71 56 67" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"></path>
  <path d="M50 28 L42 41 L47 41 L45 49 L54 37 L49 37 Z" fill="#FFD23F" stroke="#111" stroke-width="2" stroke-linejoin="round"></path>
</svg>`,
};
