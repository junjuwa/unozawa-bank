"use client";

import { childThemes } from "@/lib/theme/childTheme";
import { ParentBottomNav } from "@/components/parent/ParentBottomNav";

export default function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = childThemes.parent_dark;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.frameBg,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <header style={{ padding: "18px 18px 6px" }}>
        <span style={{ fontWeight: theme.headingWeight, fontSize: 18 }}>おこづかい かんり</span>
      </header>
      <main className="pb-28 px-4" style={{ maxWidth: 720, margin: "0 auto" }}>
        {children}
      </main>
      <ParentBottomNav theme={theme} />
    </div>
  );
}
