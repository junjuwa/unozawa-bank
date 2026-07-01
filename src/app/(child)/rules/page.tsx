"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { RULES } from "@/lib/mock/rulesMock";
import { useFamilySettings } from "@/hooks/useFamilySettings";
import { RuleCard } from "@/components/child/RuleCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AboutModal } from "@/components/ui/AboutModal";

export default function RulesPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { settings, loading } = useFamilySettings();
  const [showAbout, setShowAbout] = useState(false);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>やくそく</h1>
      {RULES.map((rule, i) => (
        <RuleCard key={i} theme={theme} icon={rule.icon} segs={rule.segs} />
      ))}
      {settings?.promises.map((promise, i) => (
        <RuleCard key={`promise-${i}`} theme={theme} icon="📌" segs={[promise]} />
      ))}

      {/* このアプリについて */}
      <button
        type="button"
        onClick={() => setShowAbout(true)}
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: theme.cardBg,
          border: theme.cardBorder !== "none" ? theme.cardBorder : "1.5px solid rgba(0,0,0,.07)",
          borderRadius: theme.cardRadius,
          padding: "14px 18px",
          width: "100%",
          fontFamily: theme.fontFamily,
          fontWeight: 700,
          fontSize: 15,
          color: theme.ink,
          cursor: "pointer",
          boxShadow: theme.cardShadow,
        }}
      >
        <span style={{ fontSize: 22 }}>ℹ️</span>
        このアプリについて
        <span style={{ marginLeft: "auto", color: theme.sub, fontSize: 18 }}>›</span>
      </button>

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}
    </div>
  );
}
