// MOCK: TODO(auth) — job_tasks/job_requestsテーブルをfamily_idで取得する。
import { ThemeKey } from "@/lib/theme/themes";
import { JobStatus } from "@/lib/theme/statusColors";

export type MockJob = {
  id: string;
  name: string;
  reward: number;
  status: JobStatus;
};

export const INITIAL_JOBS: Record<ThemeKey, MockJob[]> = {
  rei_blue: [
    { id: "j1", name: "おさらあらい", reward: 50, status: "apply" },
    { id: "j2", name: "くつ ならべ", reward: 30, status: "pending" },
    { id: "j3", name: "せんたくもの たたみ", reward: 40, status: "approved" },
  ],
  jun_red: [
    { id: "j1", name: "おさらあらい", reward: 50, status: "apply" },
    { id: "j2", name: "ごみ だし", reward: 30, status: "apply" },
    { id: "j3", name: "くつ ならべ", reward: 30, status: "approved" },
  ],
  parent_dark: [],
};
