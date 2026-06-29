"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChildTheme } from "@/lib/theme/childTheme";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M4 7h13l-3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 17H7l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M12 21V9" strokeLinecap="round" />
      <path d="M12 9C12 9 5 9 5 4c5 0 7 3 7 5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13C12 13 19 13 19 8c-5 0-7 3-7 5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function JobIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <rect x="3" y="8" width="18" height="12" rx="1" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M9 12 5.5 8.5a2 2 0 0 1 2.8-2.8L11 8.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12l3.5 3.5a2 2 0 0 1-2.8 2.8L13 15.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l6-6" strokeLinecap="round" />
      <path d="M9 12l-1 5 5-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/home", Icon: HomeIcon, label: "ホーム" },
  { href: "/transfer", Icon: SwapIcon, label: "うごかす" },
  { href: "/grow", Icon: GrowIcon, label: "ふやす" },
  { href: "/jobs", Icon: JobIcon, label: "おしごと" },
  { href: "/rules", Icon: RulesIcon, label: "やくそく" },
] as const;

export function BottomNav({ theme }: { theme: ChildTheme }) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.cardBg,
        borderTop: theme.cardBorder !== "none" ? theme.cardBorder : "1px solid rgba(0,0,0,.08)",
        boxShadow: theme.cardBorder === "none" ? "0 -8px 22px rgba(27,58,107,.12)" : "none",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        padding: "10px 6px 8px",
        fontFamily: theme.fontFamily,
      }}
    >
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const isActive = pathname === href;
        const color = isActive ? theme.navActive : theme.navIdle;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1"
            style={{ color, fontWeight: 700, fontSize: 10 }}
          >
            <span
              style={
                isActive && theme.navActiveBg
                  ? {
                      background: theme.navActiveBg,
                      borderRadius: 15,
                      padding: "4px 12px",
                    }
                  : undefined
              }
            >
              <Icon />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
