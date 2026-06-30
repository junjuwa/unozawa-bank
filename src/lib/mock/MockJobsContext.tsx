"use client";

// MOCK ONLY: 本実装では削除し、src/lib/money/rpc.tsの仕組みに揃えて
// job_requests insert（申請）→ 親のapproveJobRequest RPC（承認）の流れに置き換える。
// 承認は親側操作のため、ここでは「申請する→しんせいちゅう」までのみ再現する。

import { createContext, useContext, useState } from "react";
import { ThemeKey } from "@/lib/theme/themes";
import { INITIAL_JOBS, MockJob } from "@/lib/mock/jobsMock";

type MockJobsContextValue = {
  jobs: Record<ThemeKey, MockJob[]>;
  applyJob: (theme: ThemeKey, jobId: string, rewardSnapshot: number) => void;
  decideJob: (theme: ThemeKey, jobId: string, decision: "approved" | "rejected") => void;
};

const MockJobsContext = createContext<MockJobsContextValue | null>(null);

export function MockJobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Record<ThemeKey, MockJob[]>>(INITIAL_JOBS);

  // design.md §7: job_requests.reward_snapshot相当。申請時点の単価を固定する。
  function applyJob(theme: ThemeKey, jobId: string, rewardSnapshot: number) {
    setJobs((prev) => ({
      ...prev,
      [theme]: prev[theme].map((job) =>
        job.id === jobId ? { ...job, status: "pending", rewardSnapshot } : job,
      ),
    }));
  }

  function decideJob(theme: ThemeKey, jobId: string, decision: "approved" | "rejected") {
    setJobs((prev) => ({
      ...prev,
      [theme]: prev[theme].map((job) =>
        job.id === jobId
          ? { ...job, status: decision, decidedAt: new Date().toISOString() }
          : job,
      ),
    }));
  }

  return (
    <MockJobsContext.Provider value={{ jobs, applyJob, decideJob }}>
      {children}
    </MockJobsContext.Provider>
  );
}

export function useMockJobs() {
  const ctx = useContext(MockJobsContext);
  if (!ctx) throw new Error("useMockJobs は MockJobsProvider の内側で使ってください");
  return ctx;
}
