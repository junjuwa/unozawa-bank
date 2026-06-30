"use client";

import { childThemes } from "@/lib/theme/childTheme";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { getGoalsList } from "@/lib/mock/goalsList";
import { INVEST_LOTS } from "@/lib/mock/investLots";
import { THEME_LABELS } from "@/lib/theme/themes";
import { KpiCard } from "@/components/parent/KpiCard";
import { ChildSummaryCard } from "@/components/parent/ChildSummaryCard";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function DashboardPage() {
  const theme = childThemes.parent_dark;
  const { balances, weeklyHistory } = useMockBalances();
  const { jobs } = useMockJobs();
  const { settings } = useMockSettings();

  function catalogName(catalogId: string) {
    return settings.jobCatalog.find((c) => c.id === catalogId)?.name ?? catalogId;
  }

  const totalBalance = CHILDREN.reduce((sum, key) => {
    const b = balances[key];
    return sum + b.spend + b.save + b.grow;
  }, 0);

  const pendingCount = CHILDREN.reduce(
    (sum, key) => sum + jobs[key].filter((j) => j.status === "pending").length,
    0,
  );

  const maturingInterest = CHILDREN.reduce(
    (sum, key) => sum + INVEST_LOTS[key].reduce((s, lot) => s + lot.interestAmount, 0),
    0,
  );

  // 「ためる」へ移動された額の曜日別累積（セッション内、§MockBalancesContext参照）の合計
  const weeklySaved = CHILDREN.reduce(
    (sum, key) => sum + weeklyHistory[key].reduce((s, n) => s + n, 0),
    0,
  );

  const activities = CHILDREN.flatMap((key) =>
    jobs[key]
      .filter((j) => j.decidedAt)
      .map((j) => ({
        child: THEME_LABELS[key].split("（")[0],
        text: `おしごと「${catalogName(j.catalogId)}」を${j.status === "approved" ? "承認" : "却下"}`,
        decidedAt: j.decidedAt!,
      })),
  ).sort((a, b) => (a.decidedAt < b.decidedAt ? 1 : -1));

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <KpiCard theme={theme} label="合計残高" value={`¥${totalBalance.toLocaleString("ja-JP")}`} />
        <KpiCard
          theme={theme}
          label="承認待ち"
          value={`${pendingCount}けん`}
          caption={pendingCount > 0 ? "要対応" : undefined}
        />
        <KpiCard theme={theme} label="今週ためた額" value={`+¥${weeklySaved.toLocaleString("ja-JP")}`} />
        <KpiCard
          theme={theme}
          label="満期で増える額"
          value={`+¥${maturingInterest.toLocaleString("ja-JP")}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        {CHILDREN.map((key) => {
          const b = balances[key];
          const goals = getGoalsList(key, b.save);
          const active = goals.find((g) => g.active);
          return (
            <ChildSummaryCard
              key={key}
              theme={theme}
              name={THEME_LABELS[key].split("（")[0]}
              total={b.spend + b.save + b.grow}
              boxes={b}
              goalName={active?.name ?? ""}
              goalProgress={
                active ? Math.min(100, Math.round((active.current / active.target) * 100)) : 0
              }
              weeklyHistory={weeklyHistory[key]}
            />
          );
        })}
      </div>

      <div
        style={{
          background: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          padding: 16,
        }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>さいきんの うごき</h2>
        {activities.length === 0 ? (
          <p style={{ fontSize: 12, color: theme.sub }}>まだ うごきが ありません</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {activities.map((a, i) => (
              <li key={i} style={{ fontSize: 13, display: "flex", gap: 8 }}>
                <span style={{ color: theme.accent }}>●</span>
                <span style={{ fontWeight: 700 }}>{a.child}</span>
                <span style={{ color: theme.sub }}>{a.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
