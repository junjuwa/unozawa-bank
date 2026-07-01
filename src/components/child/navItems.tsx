// public/icons/*.svg を <img> タグで参照。アイコン差し替えはファイル置換のみでOK。

function NavIcon({ src, label }: { src: string; label: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={label} width={24} height={24} style={{ display: "block" }} />
  );
}

export const NAV_ITEMS = [
  { href: "/home",     Icon: () => <NavIcon src="/icons/home.svg"     label="ホーム" />,    label: "ホーム" },
  { href: "/transfer", Icon: () => <NavIcon src="/icons/transfer.svg" label="うごかす" />,  label: "うごかす" },
  { href: "/grow",     Icon: () => <NavIcon src="/icons/grow.svg"     label="ふやす" />,    label: "ふやす" },
  { href: "/jobs",     Icon: () => <NavIcon src="/icons/jobs.svg"     label="おしごと" />,  label: "おしごと" },
  { href: "/rules",    Icon: () => <NavIcon src="/icons/promise.svg"  label="やくそく" />,  label: "やくそく" },
] as const;
