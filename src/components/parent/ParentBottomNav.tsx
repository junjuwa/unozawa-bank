"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChildTheme } from "@/lib/theme/childTheme";

// TODO: Claude designで作成したアイコンに差し替える場所（src/components/child/navItems.tsxと同様の方針）。
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="11" width="8" height="10" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function ApproveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.5-2-3.4-2.3.9a8 8 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a8 8 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a8 8 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a8 8 0 0 0 1.7 1l.3 2.5h4l.3-2.5a8 8 0 0 0 1.7-1l2.3.9 2-3.4z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", Icon: DashboardIcon, label: "ダッシュボード" },
  { href: "/approvals", Icon: ApproveIcon, label: "承認" },
  { href: "/settings", Icon: SettingsIcon, label: "設定" },
] as const;

export function ParentBottomNav({ theme }: { theme: ChildTheme }) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#16191D",
        borderTop: "1px solid #3A424C",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        padding: "10px 6px 8px",
        fontFamily: theme.fontFamily,
      }}
    >
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1"
            style={{ color: isActive ? theme.navActive : theme.navIdle, fontWeight: 700, fontSize: 10 }}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
