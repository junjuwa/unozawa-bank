"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useJobCatalog } from "@/hooks/useJobCatalog";
import { useMyJobRequests } from "@/hooks/useJobRequests";
import { createClient } from "@/lib/supabase/client";
import { JobCard } from "@/components/child/JobCard";

export default function JobsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];

  const { catalog } = useJobCatalog();
  const { requests, refetch } = useMyJobRequests();
  const { jobs, applyJob } = useMockJobs();
  const { settings } = useMockSettings();

  // 実ログイン済み（catalog !== null）なら実DB、未ログインならモックにフォールバック
  if (catalog) {
    async function handleApply(taskId: string, reward: number) {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      await supabase.from("job_requests").insert({
        profile_id: userData.user.id,
        task_id: taskId,
        reward_snapshot: reward,
        status: "pending",
      });
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
            <JobCard
              key={task.id}
              theme={theme}
              status={pendingRequest ? "pending" : "apply"}
              name={task.name}
              reward={pendingRequest ? pendingRequest.reward_snapshot : task.reward}
              condition={task.condition}
              onApply={() => handleApply(task.id, task.reward)}
            />
          );
        })}

        {requests && requests.some((r) => r.decided_at) && (
          <section>
            <h2 style={{ fontWeight: 800, fontSize: 13, color: theme.sub, marginBottom: 8 }}>
              さいきんの けっか
            </h2>
            <div className="flex flex-col gap-2">
              {requests
                .filter((r) => r.decided_at)
                .slice(0, 5)
                .map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: theme.sub,
                    }}
                  >
                    <span>{r.job_tasks?.name ?? ""}</span>
                    <span style={{ color: r.status === "approved" ? "#3DB66E" : "#E26D62" }}>
                      {r.status === "approved" ? "OK！承認" : "却下"}
                    </span>
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
