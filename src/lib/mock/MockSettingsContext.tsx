"use client";

// MOCK ONLY: 本実装では削除し、family_settingsテーブルのupdate（親のみRLS許可）・
// job_tasksテーブルのupdateに置き換える。永続化はせず、設定画面内での
// 表示の一貫性のためだけにstateを持つ。

import { createContext, useContext, useState } from "react";
import { INITIAL_JOB_CATALOG, JobCatalogItem } from "@/lib/mock/jobCatalog";

type Settings = {
  basePay: Record<"rei_blue" | "jun_red", number>; // 円/月（毎月1日支給で固定。0002_monthly_salary.sql参照）
  investRate: number; // 0.05 = 5%
  investTermDays: number;
  jobCatalog: JobCatalogItem[];
};

const INITIAL_SETTINGS: Settings = {
  basePay: { rei_blue: 500, jun_red: 500 },
  investRate: 0.05,
  investTermDays: 30,
  jobCatalog: INITIAL_JOB_CATALOG,
};

type MockSettingsContextValue = {
  settings: Settings;
  setBasePay: (theme: "rei_blue" | "jun_red", value: number) => void;
  setInvestRate: (value: number) => void;
  setInvestTermDays: (value: number) => void;
  setJobReward: (jobId: string, value: number) => void;
  setJobCondition: (jobId: string, value: string) => void;
  addJob: (name: string, reward: number, condition: string) => void;
};

const MockSettingsContext = createContext<MockSettingsContextValue | null>(null);

export function MockSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);

  function setBasePay(theme: "rei_blue" | "jun_red", value: number) {
    setSettings((prev) => ({ ...prev, basePay: { ...prev.basePay, [theme]: value } }));
  }
  function setInvestRate(value: number) {
    setSettings((prev) => ({ ...prev, investRate: value }));
  }
  function setInvestTermDays(value: number) {
    setSettings((prev) => ({ ...prev, investTermDays: value }));
  }
  function setJobReward(jobId: string, value: number) {
    setSettings((prev) => ({
      ...prev,
      jobCatalog: prev.jobCatalog.map((job) => (job.id === jobId ? { ...job, reward: value } : job)),
    }));
  }
  function setJobCondition(jobId: string, value: string) {
    setSettings((prev) => ({
      ...prev,
      jobCatalog: prev.jobCatalog.map((job) => (job.id === jobId ? { ...job, condition: value } : job)),
    }));
  }
  function addJob(name: string, reward: number, condition: string) {
    setSettings((prev) => ({
      ...prev,
      jobCatalog: [
        ...prev.jobCatalog,
        { id: crypto.randomUUID(), name, reward, condition },
      ],
    }));
  }

  return (
    <MockSettingsContext.Provider
      value={{
        settings,
        setBasePay,
        setInvestRate,
        setInvestTermDays,
        setJobReward,
        setJobCondition,
        addJob,
      }}
    >
      {children}
    </MockSettingsContext.Provider>
  );
}

export function useMockSettings() {
  const ctx = useContext(MockSettingsContext);
  if (!ctx) throw new Error("useMockSettings は MockSettingsProvider の内側で使ってください");
  return ctx;
}
