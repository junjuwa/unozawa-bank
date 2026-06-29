"use client";

import { childThemes } from "@/lib/theme/childTheme";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { THEME_LABELS } from "@/lib/theme/themes";
import { SettingRow } from "@/components/parent/SettingRow";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function SettingsPage() {
  const theme = childThemes.parent_dark;
  const { settings, setBasePay, setInvestRate, setInvestTermDays } = useMockSettings();

  const examplePrincipal = 500;
  const exampleInterest = Math.round(examplePrincipal * settings.investRate);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>基本給</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          定期的に各ボックスへ自動で入る金額
        </p>
        {CHILDREN.map((key) => (
          <SettingRow
            key={key}
            theme={theme}
            label={THEME_LABELS[key].split("（")[0]}
            value={settings.basePay[key]}
            unit="円/週"
            onIncrement={() => setBasePay(key, settings.basePay[key] + 50)}
            onDecrement={() => setBasePay(key, Math.max(0, settings.basePay[key] - 50))}
          />
        ))}
      </section>

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>ふやす（投資）</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          満期で利息がついて「ためる」へ
        </p>
        <SettingRow
          theme={theme}
          label="利率（満期ごと）"
          value={Math.round(settings.investRate * 100)}
          unit="%"
          onIncrement={() => setInvestRate(Math.min(0.5, settings.investRate + 0.01))}
          onDecrement={() => setInvestRate(Math.max(0, settings.investRate - 0.01))}
        />
        <SettingRow
          theme={theme}
          label="満期までの日数"
          value={settings.investTermDays}
          unit="日"
          onIncrement={() => setInvestTermDays(settings.investTermDays + 1)}
          onDecrement={() => setInvestTermDays(Math.max(1, settings.investTermDays - 1))}
        />
        <p style={{ fontSize: 12, color: theme.sub, marginTop: 10 }}>
          ¥{examplePrincipal} 運用 → 満期に{" "}
          <strong style={{ color: theme.accentInk }}>
            ¥{examplePrincipal + exampleInterest}
          </strong>{" "}
          (+¥{exampleInterest}) が「ためる」へ
        </p>
      </section>

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>おしごとの単価</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          承認時に「つかう」へ加算（表示のみ。子供画面の単価には今回は反映しません）
        </p>
        <p style={{ fontSize: 12, color: theme.sub }}>
          単価マスタの編集UIは次フェーズで対応します。
        </p>
      </section>
    </div>
  );
}
