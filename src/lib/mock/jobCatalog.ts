// MOCK: TODO(auth) — job_tasksテーブル（family_id単位、子供間で共有）を取得する。
// 単価マスタは家族で1つ。設定画面の編集はここを直接更新する。
export type JobCatalogItem = { id: string; name: string; reward: number };

export const INITIAL_JOB_CATALOG: JobCatalogItem[] = [
  { id: "osara", name: "おさらあらい", reward: 50 },
  { id: "kutsu", name: "くつ ならべ", reward: 30 },
  { id: "sentaku", name: "せんたくもの たたみ", reward: 40 },
  { id: "gomi", name: "ごみ だし", reward: 30 },
];
