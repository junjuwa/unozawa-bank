"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { JobCard } from "@/components/child/JobCard";

export default function JobsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { jobs, applyJob } = useMockJobs();
  const { settings } = useMockSettings();

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
            job={job}
            name={catalogItem.name}
            reward={reward}
            onApply={() => applyJob(themeKey, job.id, catalogItem.reward)}
          />
        );
      })}
    </div>
  );
}
