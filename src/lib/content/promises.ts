export interface PromiseItem {
  id: string;
  icon: string;
  cardClass: string; // CSS modifier key (money/think/work/grow/self)
  iconSvg: string;   // SVG path data
  title: string;     // JSX string (ruby tags inline)
  note?: string;     // optional sub-note (JSX string)
  noteSvgPath?: string; // SVG for note icon
}

export const PROMISES: PromiseItem[] = [
  {
    id: "money",
    icon: "🪙",
    cardClass: "money",
    iconSvg:
      '<circle cx="12" cy="12" r="9"/><path d="M9 9l3 3 3-3M12 12v3.5M9.8 13h4.4M9.8 15h4.4"/>',
    title: 'お<ruby>金<rt>かね</rt></ruby>は <ruby>大事<rt>だいじ</rt></ruby>に つかう',
  },
  {
    id: "think",
    icon: "🤔",
    cardClass: "think",
    iconSvg:
      '<path d="M12 4a6 6 0 0 1 3 11.2V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.8A6 6 0 0 1 12 4Z"/><path d="M10 21h4"/>',
    title: 'お<ruby>金<rt>かね</rt></ruby>の つかいかたは<br>よく <ruby>考<rt>かんが</rt></ruby>えてから きめる',
    note: '「ほしい」と「ひつよう」は ちがうよ',
    noteSvgPath: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
  },
  {
    id: "work",
    icon: "💪",
    cardClass: "work",
    iconSvg:
      '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3.5h6V5"/><path d="M8.4 12.6l2.3 2.3 4.6-4.6"/>',
    title: 'お<ruby>手<rt>て</rt></ruby>つだいを がんばると、<br>お<ruby>金<rt>かね</rt></ruby>が もらえる',
  },
  {
    id: "patient",
    icon: "🌱",
    cardClass: "grow",
    iconSvg:
      '<path d="M12 20v-7"/><path d="M12 13c0-3 2.4-5.5 5.5-5.5C17.5 11 15 13 12 13Z"/><path d="M12 13c0-2.6-2.1-4.8-4.8-4.8C7.2 11.4 9.4 13 12 13Z"/>',
    title: 'がまんして ためると、<br>いいことが ある',
  },
  {
    id: "own",
    icon: "🧭",
    cardClass: "self",
    iconSvg:
      '<circle cx="12" cy="12" r="9"/><polygon points="15.5,8.5 10.5,10.5 8.5,15.5 13.5,13.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="#fff" stroke="none"/>',
    title: '<ruby>自分<rt>じぶん</rt></ruby>の お<ruby>金<rt>かね</rt></ruby>の つかいかたは<br><ruby>自分<rt>じぶん</rt></ruby>で きめる',
    note: 'こまったら パパ・ママに <ruby>相談<rt>そうだん</rt></ruby>してね',
    noteSvgPath: '<path d="M4 5h16v11H9l-4 3z"/>',
  },
];
