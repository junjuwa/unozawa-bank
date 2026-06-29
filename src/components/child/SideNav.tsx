"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChildTheme } from "@/lib/theme/childTheme";
import { NAV_ITEMS } from "./navItems";

export function SideNav({ theme }: { theme: ChildTheme }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 212,
        flexShrink: 0,
        background: theme.cardBg,
        borderRight: theme.cardBorder !== "none" ? theme.cardBorder : "1px solid rgba(0,0,0,.08)",
        display: "flex",
        flexDirection: "column",
        padding: "26px 18px",
        gap: 12,
        fontFamily: theme.fontFamily,
        minHeight: "100vh",
      }}
    >
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 10,
              padding: "13px 14px",
              background: isActive ? theme.accent : "transparent",
              color: isActive ? "#fff" : theme.ink,
              border:
                isActive && theme.cardBorder !== "none" ? "2.5px solid #111" : "2.5px solid transparent",
              boxShadow: isActive && theme.cardBorder !== "none" ? "3px 3px 0 #111" : "none",
              fontWeight: 700,
            }}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
