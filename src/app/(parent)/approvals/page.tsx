"use client";

import { useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { THEME_LABELS, ThemeKey } from "@/lib/theme/themes";
import { ApprovalCard } from "@/components/parent/ApprovalCard";

const CHILDREN: ThemeKey[] = ["rei_blue", "jun_red"];

export default function ApprovalsPage() {
  const theme = childThemes.parent_dark;
  const { jobs, decideJob } = useMockJobs();
  const { creditReward } = useMockBalances();
  const { settings } = useMockSettings();
  const [filter, setFilter] = useState<"all" | ThemeKey>("all");

  function catalogName(catalogId: string) {
    return settings.jobCatalog.find((c) => c.id === catalogId)?.name ?? catalogId;
  }

  const targets = filter === "all" ? CHILDREN : [filter];

  const pending = targets.flatMap((key) =>
    jobs[key]
      .filter((j) => j.status === "pending")
      .map((j) => ({ key, job: j })),
  );

  const history = targets
    .flatMap((key) =>
      jobs[key]
        .filter((j) => j.decidedAt)
        .map((j) => ({ key, job: j })),
    )
    .sort((a, b) => (a.job.decidedAt! < b.job.decidedAt! ? 1 : -1));

  function handleApprove(key: ThemeKey, jobId: string, reward: number) {
    decideJob(key, jobId, "approved");
    // design.md §1.6②: お仕事承認 → つかう(spend)へ入金（申請時点のrewardSnapshotを使う）
    creditReward(key, reward);
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex gap-2">
        {(["all", ...CHILDREN] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            style={{
              borderRadius: 16,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              background: filter === key ? theme.accent : "transparent",
              color: filter === key ? "#fff" : theme.sub,
              border: `1px solid ${filter === key ? theme.accent : "#3A424C"}`,
            }}
          >
            {key === "all" ? "ぜんぶ" : THEME_LABELS[key].split("（")[0]}
          </button>
        ))}
      </div>

      <section>
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>しんせいちゅう</h2>
        <div className="flex flex-col gap-3">
          {pending.length === 0 ? (
            <p style={{ fontSize: 12, color: theme.sub }}>しんせいは ありません</p>
          ) : (
            pending.map(({ key, job }) => {
              const reward = job.rewardSnapshot ?? 0;
              return (
                <ApprovalCard
                  key={`${key}-${job.id}`}
                  theme={theme}
                  childName={THEME_LABELS[key].split("（")[0]}
                  jobName={catalogName(job.catalogId)}
                  reward={reward}
                  onApprove={() => handleApprove(key, job.id, reward)}
                  onReject={() => decideJob(key, job.id, "rejected")}
                />
              );
            })
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>承認履歴</h2>
        <div
          style={{
            background: theme.cardBg,
            borderRadius: theme.cardRadius,
            border: theme.cardBorder,
            padding: 16,
          }}
        >
          {history.length === 0 ? (
            <p style={{ fontSize: 12, color: theme.sub }}>まだ ありません</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map(({ key, job }) => (
                <li key={`${key}-${job.id}`} style={{ fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {THEME_LABELS[key].split("（")[0]} — {catalogName(job.catalogId)}
                  </span>
                  <span style={{ color: job.status === "approved" ? "#3DB66E" : "#E26D62" }}>
                    {job.status === "approved" ? "承認" : "却下"}
                    {" "}
                    ¥{job.rewardSnapshot ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
