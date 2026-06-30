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

// 親: SECURITY DEFINER RPC経由で家族全員分のjob_requestsを取得。
// RLS/is_parent()設定に依存せず、auth.uid()→profilesでrole確認するため確実に動作する。
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

    const { data, error } = await supabase.rpc("get_family_job_requests");

    if (error) {
      // forbidden = 親プロフィール未設定などの場合。空配列にしてモックへフォールバックさせない。
      setRequests([]);
      setLoading(false);
      return;
    }

    // RPCの戻り値をFamilyJobRequest型に変換
    const rows = (data ?? []).map((r: {
      id: string; task_id: string; profile_id: string;
      reward_snapshot: number; status: string;
      requested_at: string; decided_at: string | null;
      job_task_name: string | null; profile_display_name: string | null;
    }) => ({
      id: r.id,
      task_id: r.task_id,
      reward_snapshot: r.reward_snapshot,
      status: r.status as JobRequestStatus,
      requested_at: r.requested_at,
      decided_at: r.decided_at,
      job_tasks: r.job_task_name ? { name: r.job_task_name } : null,
      profiles: r.profile_display_name ? { display_name: r.profile_display_name } : null,
    }));

    setRequests(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { requests, loading, refetch };
}
