// MOCK: TODO(auth) — job_requestsテーブルをprofile_idで取得する。
// design.md §7: job_requests.reward_snapshotに倣い、申請時点の単価をrewardSnapshotで固定する。
// 単価マスタ(jobCatalog)自体は家族共有でMockSettingsContext側が持つ。
import { ThemeKey } from "@/lib/theme/themes";
import { JobStatus } from "@/lib/theme/statusColors";

export type MockJob = {
  id: string;
  catalogId: string;
  status: JobStatus;
  rewardSnapshot?: number; // 申請(apply)時点で確定。'apply'のままなら未設定
  decidedAt?: string;
};

export const INITIAL_JOBS: Record<ThemeKey, MockJob[]> = {
  rei_blue: [
    { id: "j1", catalogId: "osara", status: "apply" },
    { id: "j2", catalogId: "kutsu", status: "pending", rewardSnapshot: 30 },
    { id: "j3", catalogId: "sentaku", status: "approved", rewardSnapshot: 40 },
  ],
  jun_red: [
    { id: "j1", catalogId: "osara", status: "apply" },
    { id: "j2", catalogId: "gomi", status: "apply" },
    { id: "j3", catalogId: "kutsu", status: "approved", rewardSnapshot: 30 },
  ],
  parent_dark: [],
};
