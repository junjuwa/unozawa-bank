"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useState } from "react";
import { useJobCatalog } from "@/hooks/useJobCatalog";
import { useMyJobRequests } from "@/hooks/useJobRequests";
import { createClient } from "@/lib/supabase/client";
import { JobCard } from "@/components/child/JobCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function JobsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];

  const { catalog, loading: catalogLoading } = useJobCatalog();
  const { requests, loading: requestsLoading, refetch } = useMyJobRequests();
  const { jobs, applyJob } = useMockJobs();
  const { settings } = useMockSettings();

  const [applyMessage, setApplyMessage] = useState<{ taskId: string; ok: boolean; text: string } | null>(null);

  if (catalogLoading || requestsLoading) return <LoadingScreen />;

  // 実ログイン済み（catalog !== null）なら実DB、未ログインならモックにフォールバック
  function fmtDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  if (catalog) {
    async function handleApply(taskId: string, reward: number) {
      setApplyMessage(null);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { error } = await supabase.from("job_requests").insert({
        profile_id: userData.user.id,
        task_id: taskId,
        reward_snapshot: reward,
        status: "pending",
      });
      if (error) {
        setApplyMessage({ taskId, ok: false, text: "しんせいに しっぱいしました" });
        return;
      }
      setApplyMessage({ taskId, ok: true, text: "もうしこみました！" });
      refetch();
    }

    return (
      <div className="flex flex-col gap-4 pt-2">
        <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>おしごと</h1>
        {catalog.map((task) => {
          // 実DBは申請のたびに行が増える繰り返し可能モデル：
          // 自分のpending中の申請があればそれを表示、無ければ最新単価で申請可能
          const pendingRequest = requests?.find(
            (r) => r.task_id === task.id && r.status === "pending",
          );
          return (
            <div key={task.id}>
              <JobCard
                theme={theme}
                status={pendingRequest ? "pending" : "apply"}
                name={task.name}
                reward={pendingRequest ? pendingRequest.reward_snapshot : task.reward}
                condition={task.condition}
                requestedAt={pendingRequest?.requested_at}
                onApply={() => handleApply(task.id, task.reward)}
              />
              {applyMessage && applyMessage.taskId === task.id && (
                <p style={{ fontSize: 12, marginTop: 4, color: applyMessage.ok ? "#3DB66E" : "#E26D62" }}>
                  {applyMessage.text}
                </p>
              )}
            </div>
          );
        })}

        {requests && requests.some((r) => r.decided_at) && (
          <section>
            <h2 style={{ fontWeight: 800, fontSize: 13, color: theme.sub, marginBottom: 8 }}>
              さいきんの けっか
            </h2>
            <div
              style={{
                background: theme.cardBg,
                borderRadius: theme.cardRadius,
                border: theme.cardBorder,
                boxShadow: theme.cardShadow,
                padding: "4px 0",
              }}
            >
              {requests
                .filter((r) => r.decided_at)
                .slice(0, 5)
                .map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderBottom: `1px solid rgba(0,0,0,.06)`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: theme.ink }}>
                        {r.job_tasks?.name ?? ""}
                      </div>
                      <div style={{ fontSize: 10, color: theme.sub, marginTop: 2 }}>
                        もうしこみ: {fmtDate(r.requested_at)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 12,
                          color: r.status === "approved" ? "#2E9C5B" : "#E26D62",
                        }}
                      >
                        {r.status === "approved" ? "OK！もらえた" : "だめだった"}
                      </div>
                      {r.decided_at && (
                        <div style={{ fontSize: 10, color: theme.sub, marginTop: 2 }}>
                          けってい: {fmtDate(r.decided_at)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>おしごと</h1>
      {jobs[themeKey].map((job) => {
        const catalogItem = settings.jobCatalog.find((c) => c.id === job.catalogId);
        if (!catalogItem) return null;
        // 'apply'(未申請)は単価マスタの現在値、それ以外は申請時点のrewardSnapshotを表示
        const reward = job.status === "apply" ? catalogItem.reward : job.rewardSnapshot ?? catalogItem.reward;
        return (
          <JobCard
            key={job.id}
            theme={theme}
            status={job.status}
            name={catalogItem.name}
            reward={reward}
            condition={catalogItem.condition}
            onApply={() => applyJob(themeKey, job.id, catalogItem.reward)}
          />
        );
      })}
    </div>
  );
}
