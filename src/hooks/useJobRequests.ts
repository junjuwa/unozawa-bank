"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type JobRequestStatus = "pending" | "approved" | "rejected";

export type MyJobRequest = {
  id: string;
  task_id: string;
  reward_snapshot: number;
  status: JobRequestStatus;
  requested_at: string;
  decided_at: string | null;
  job_tasks: { name: string } | null;
};

export type FamilyJobRequest = MyJobRequest & {
  profiles: { display_name: string } | null;
};

// 子: 自分のjob_requestsを取得（お仕事名をjoin）。未ログインならnull。
export function useMyJobRequests() {
  const [requests, setRequests] = useState<MyJobRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setRequests(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("job_requests")
      .select("id, task_id, reward_snapshot, status, requested_at, decided_at, job_tasks(name)")
      .eq("profile_id", userData.user.id)
      .order("requested_at", { ascending: false });

    setRequests((data as unknown as MyJobRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { requests, loading, refetch };
}

// 親: 家族全員分のjob_requestsを取得（お仕事名・子の名前をjoin）。未ログインならnull。
export function useFamilyJobRequests() {
  const [requests, setRequests] = useState<FamilyJobRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setRequests(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("job_requests")
      .select(
        "id, task_id, reward_snapshot, status, requested_at, decided_at, job_tasks(name), profiles(display_name)",
      )
      .order("requested_at", { ascending: false });

    setRequests((data as unknown as FamilyJobRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { requests, loading, refetch };
}
