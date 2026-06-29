"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", emoji: "🏠", label: "ホーム" },
  { href: "/transfer", emoji: "🔁", label: "うごかす" },
  { href: "/grow", emoji: "🌱", label: "ふやす" },
  { href: "/jobs", emoji: "🧹", label: "おしごと" },
  { href: "/rules", emoji: "🤝", label: "やくそく" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 grid grid-cols-5 border-t py-2"
      style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)" }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5"
            style={isActive ? { color: "var(--color-primary)" } : undefined}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className={`text-xs ${isActive ? "font-bold" : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
