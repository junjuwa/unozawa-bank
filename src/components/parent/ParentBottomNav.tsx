"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChildTheme } from "@/lib/theme/childTheme";

// Claude designで作成したアイコン（icons/dashboard.svg等）に差し替え済み。
function DashboardIcon() {
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
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ApproveIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12 L11 15 L16.5 9" />
    </svg>
  );
}

function SettingsIcon() {
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
      <path d="M12.2 3 h-.4 a1.8 1.8 0 0 0 -1.8 1.8 v.5 a1.8 1.8 0 0 1 -1.1 1.66 a1.8 1.8 0 0 1 -1.95 -.36 l-.36 -.36 a1.8 1.8 0 0 0 -2.54 0 l-.28 .28 a1.8 1.8 0 0 0 0 2.54 l.36 .36 a1.8 1.8 0 0 1 .36 1.95 a1.8 1.8 0 0 1 -1.66 1.1 h-.5 a1.8 1.8 0 0 0 -1.8 1.8 v.4 a1.8 1.8 0 0 0 1.8 1.8 h.5 a1.8 1.8 0 0 1 1.66 1.1 a1.8 1.8 0 0 1 -.36 1.95 l-.36 .36 a1.8 1.8 0 0 0 0 2.54 l.28 .28 a1.8 1.8 0 0 0 2.54 0 l.36 -.36 a1.8 1.8 0 0 1 1.95 -.36 a1.8 1.8 0 0 1 1.1 1.66 v.5 a1.8 1.8 0 0 0 1.8 1.8 h.4 a1.8 1.8 0 0 0 1.8 -1.8 v-.5 a1.8 1.8 0 0 1 1.1 -1.66 a1.8 1.8 0 0 1 1.95 .36 l.36 .36 a1.8 1.8 0 0 0 2.54 0 l.28 -.28 a1.8 1.8 0 0 0 0 -2.54 l-.36 -.36 a1.8 1.8 0 0 1 -.36 -1.95 a1.8 1.8 0 0 1 1.66 -1.1 h.5 a1.8 1.8 0 0 0 1.8 -1.8 v-.4 a1.8 1.8 0 0 0 -1.8 -1.8 h-.5 a1.8 1.8 0 0 1 -1.66 -1.1 a1.8 1.8 0 0 1 .36 -1.95 l.36 -.36 a1.8 1.8 0 0 0 0 -2.54 l-.28 -.28 a1.8 1.8 0 0 0 -2.54 0 l-.36 .36 a1.8 1.8 0 0 1 -1.95 .36 a1.8 1.8 0 0 1 -1.1 -1.66 v-.5 a1.8 1.8 0 0 0 -1.8 -1.8 Z" />
      <circle cx="12" cy="12" r="3" />
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
