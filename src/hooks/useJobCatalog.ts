"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type JobCatalogRow = {
  id: string;
  name: string;
  reward: number;
  condition: string;
};

// 家族のjob_tasks(is_active=true)を取得する。未ログインならnull。
export function useJobCatalog() {
  const [catalog, setCatalog] = useState<JobCatalogRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setCatalog(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("job_tasks")
      .select("id, name, reward, condition")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    setCatalog((data as JobCatalogRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { catalog, loading, refetch };
}
