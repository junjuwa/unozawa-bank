"use client";

import { childThemes } from "@/lib/theme/childTheme";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { THEME_LABELS } from "@/lib/theme/themes";
import { SettingRow } from "@/components/parent/SettingRow";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function SettingsPage() {
  const theme = childThemes.parent_dark;
  const { settings, setBasePay, setInvestRate, setInvestTermDays, setJobReward } =
    useMockSettings();
  const { creditReward } = useMockBalances();

  const examplePrincipal = 500;
  const exampleInterest = Math.round(examplePrincipal * settings.investRate);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>基本給</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          支給日：毎月1日（固定。design.md §1.6④/0002_monthly_salary.sql）
        </p>
        {CHILDREN.map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <SettingRow
                theme={theme}
                label={THEME_LABELS[key].split("（")[0]}
                value={settings.basePay[key]}
                unit="円/月"
                onIncrement={() => setBasePay(key, settings.basePay[key] + 50)}
                onDecrement={() => setBasePay(key, Math.max(0, settings.basePay[key] - 50))}
              />
            </div>
            <button
              type="button"
              onClick={() => creditReward(key, settings.basePay[key])}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: theme.accent,
                border: `1px solid ${theme.accent}`,
                borderRadius: 14,
                padding: "6px 10px",
                whiteSpace: "nowrap",
              }}
            >
              今すぐ支給（テスト）
            </button>
          </div>
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
          承認時に「つかう」へ加算。すでに申請中／承認済みのおしごとには反映されません（申請時点の単価で固定）
        </p>
        {settings.jobCatalog.map((job) => (
          <SettingRow
            key={job.id}
            theme={theme}
            label={job.name}
            value={job.reward}
            unit="円"
            onIncrement={() => setJobReward(job.id, job.reward + 10)}
            onDecrement={() => setJobReward(job.id, Math.max(0, job.reward - 10))}
          />
        ))}
      </section>
    </div>
  );
}
