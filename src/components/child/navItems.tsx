// Claude designで作成したアイコン（icons/home.svg等）に差し替え済み。
// 今後さらに差し替える場合も、このファイルのSVGの中身だけ置き換えれば
// importを変えずにBottomNav/SideNavの両方に反映される。

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M4 11 L12 4 L20 11" />
      <path d="M6 10 V19 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1-1 V10" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M4 9 H17" />
      <path d="M14 6 L17 9 L14 12" />
      <path d="M20 15 H7" />
      <path d="M10 12 L7 15 L10 18" />
    </svg>
  );
}

function GrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 20 V10" />
      <path d="M12 12 C9 12 7 10 7 7 C10 7 12 9 12 12 Z" />
      <path d="M12 10 C15 10 17 8 17 5 C14 5 12 7 12 10 Z" />
    </svg>
  );
}

function JobIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect x="4" y="8" width="16" height="12" rx="2.5" />
      <path d="M9 8 V6.5 a3 3 0 0 1 6 0 V8" />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 20 C12 20 4 14.5 4 8.8 A4 4 0 0 1 12 7 A4 4 0 0 1 20 8.8 C20 14.5 12 20 12 20 Z" />
    </svg>
  );
}

export const NAV_ITEMS = [
  { href: "/home", Icon: HomeIcon, label: "ホーム" },
  { href: "/transfer", Icon: SwapIcon, label: "うごかす" },
  { href: "/grow", Icon: GrowIcon, label: "ふやす" },
  { href: "/jobs", Icon: JobIcon, label: "おしごと" },
  { href: "/rules", Icon: RulesIcon, label: "やくそく" },
] as const;
