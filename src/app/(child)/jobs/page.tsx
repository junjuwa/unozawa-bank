"use client";

import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockJobs } from "@/lib/mock/MockJobsContext";
import { JobCard } from "@/components/child/JobCard";

export default function JobsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { jobs, applyJob } = useMockJobs();

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>おしごと</h1>
      {jobs[themeKey].map((job) => (
        <JobCard key={job.id} theme={theme} job={job} onApply={() => applyJob(themeKey, job.id)} />
      ))}
    </div>
  );
}
