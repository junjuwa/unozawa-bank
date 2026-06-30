"use client";

import { useEffect, useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useFamilyJobRequests } from "@/hooks/useJobRequests";
import { approveJobRequest, rejectJobRequest } from "@/lib/money/rpc";
import { THEME_LABELS, ThemeKey } from "@/lib/theme/themes";
import { ApprovalCard } from "@/components/parent/ApprovalCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const CHILDREN: ThemeKey[] = ["rei_blue", "jun_red"];

export default function ApprovalsPage() {
  const theme = childThemes.parent_dark;
  const { jobs, decideJob } = useMockJobs();
  const { creditReward } = useMockBalances();
  const { settings } = useMockSettings();
  const { requests, loading: requestsLoading, refetch } = useFamilyJobRequests();
  const [filter, setFilter] = useState<"all" | ThemeKey>("all");

  // 30秒ごとに自動更新（子が申請後に親が更新ボタンを押さなくても反映される）
  useEffect(() => {
    const id = setInterval(() => { refetch(); }, 30_000);
    return () => clearInterval(id);
  }, [refetch]);

  if (requestsLoading) return <LoadingScreen />;

  function catalogName(catalogId: string) {
    return settings.jobCatalog.find((c) => c.id === catalogId)?.name ?? catalogId;
  }

  // 実ログイン済み（requests !== null）なら実DB、未ログインならモックにフォールバック
  if (requests) {
    const filtered =
      filter === "all"
        ? requests
        : requests.filter((r) => r.profiles?.display_name === THEME_LABELS[filter].split("（")[0]);

    const pending = filtered.filter((r) => r.status === "pending");
    const history = filtered.filter((r) => r.decided_at);

    async function handleApprove(requestId: string) {
      await approveJobRequest(requestId);
      refetch();
    }
    async function handleReject(requestId: string) {
      await rejectJobRequest(requestId);
      refetch();
    }

    return (
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex gap-2 items-center">
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
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              marginLeft: "auto",
              fontSize: 12,
              fontWeight: 700,
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: 14,
              padding: "6px 12px",
            }}
          >
            更新
          </button>
        </div>

        <section>
          <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>しんせいちゅう</h2>
          <div className="flex flex-col gap-3">
            {pending.length === 0 ? (
              <p style={{ fontSize: 12, color: theme.sub }}>しんせいは ありません</p>
            ) : (
              pending.map((r) => (
                <ApprovalCard
                  key={r.id}
                  theme={theme}
                  childName={r.profiles?.display_name ?? ""}
                  jobName={r.job_tasks?.name ?? ""}
                  reward={r.reward_snapshot}
                  onApprove={() => handleApprove(r.id)}
                  onReject={() => handleReject(r.id)}
                />
              ))
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
                {history.map((r) => (
                  <li key={r.id} style={{ fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <span>
                      {r.profiles?.display_name ?? ""} — {r.job_tasks?.name ?? ""}
                    </span>
                    <span style={{ color: r.status === "approved" ? "#3DB66E" : "#E26D62" }}>
                      {r.status === "approved" ? "承認" : "却下"} ¥{r.reward_snapshot}
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

  const targets = filter === "all" ? CHILDREN : [filter];

  const pending = targets.flatMap((key) =>
    jobs[key]
      .filter((j) => j.status === "pending")
      .map((j) => ({ key, job: j })),
  );

  const mockHistory = targets
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
          {mockHistory.length === 0 ? (
            <p style={{ fontSize: 12, color: theme.sub }}>まだ ありません</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {mockHistory.map(({ key, job }) => (
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
