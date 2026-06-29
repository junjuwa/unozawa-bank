"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChildTheme } from "@/lib/theme/childTheme";
import { NAV_ITEMS } from "./navItems";

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
