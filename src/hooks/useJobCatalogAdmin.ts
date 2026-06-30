"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type JobCatalogAdminRow = {
  id: string;
  name: string;
  reward: number;
  condition: string;
};

// job_tasksの全件（親向け管理用）。tasks_write_parent RLSにより
// 親はクライアントから直接insert/update/deleteできるためRPCは不要。未ログインならnull。
export function useJobCatalogAdmin() {
  const [catalog, setCatalog] = useState<JobCatalogAdminRow[] | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setCatalog(null);
      setFamilyId(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("family_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile) {
      setCatalog(null);
      setFamilyId(null);
      setLoading(false);
      return;
    }
    setFamilyId(profile.family_id as string);

    const { data } = await supabase
      .from("job_tasks")
      .select("id, name, reward, condition")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    setCatalog((data as JobCatalogAdminRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addJobTask(name: string, reward: number, condition: string) {
    if (!familyId) return;
    const supabase = createClient();
    await supabase.from("job_tasks").insert({ family_id: familyId, name, reward, condition });
    refetch();
  }

  async function updateJobTask(id: string, patch: { reward?: number; condition?: string }) {
    const supabase = createClient();
    await supabase.from("job_tasks").update(patch).eq("id", id);
    refetch();
  }

  async function removeJobTask(id: string) {
    const supabase = createClient();
    await supabase.from("job_tasks").delete().eq("id", id);
    refetch();
  }

  return { catalog, loading, refetch, addJobTask, updateJobTask, removeJobTask };
}
