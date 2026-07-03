"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useFamilySettings } from "@/hooks/useFamilySettings";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { OnboardingCarousel } from "@/components/child/OnboardingCarousel";
import { FrameDecoration } from "@/components/child/FrameDecoration";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const DEFAULT_MATURITY_DAYS = 30;
const DEFAULT_RATE = 0.05;

export default function AboutPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { settings: realSettings, loading } = useFamilySettings();
  const mockSettings = useMockSettings();

  if (loading) return <LoadingScreen />;

  const maturityDays =
    realSettings?.maturity_days ?? mockSettings.settings.investTermDays ?? DEFAULT_MATURITY_DAYS;
  const rate =
    realSettings?.investment_rate ?? mockSettings.settings.investRate ?? DEFAULT_RATE;

  const isJun = themeKey === "jun_red";

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.frameBg,
        fontFamily: theme.fontFamily,
        overflow: "hidden",
      }}
    >
      <FrameDecoration themeKey={themeKey} />

      {/* コンテンツ：中央寄せ・最大幅制限 */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 580,
          margin: "0 auto",
          height: "100%",
        }}
      >
        <OnboardingCarousel
          theme={theme}
          isJun={isJun}
          maturityDays={maturityDays}
          rate={rate}
        />
      </div>
    </div>
  );
}
