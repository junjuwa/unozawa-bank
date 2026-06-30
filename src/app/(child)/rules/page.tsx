"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { RULES } from "@/lib/mock/rulesMock";
import { useFamilySettings } from "@/hooks/useFamilySettings";
import { RuleCard } from "@/components/child/RuleCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function RulesPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { settings, loading } = useFamilySettings();

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
    </div>
  );
}
