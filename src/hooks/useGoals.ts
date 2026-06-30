"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type GoalRow = {
  id: string;
  name: string;
  target: number;
  active: boolean;
  image_url: string | null;
  position: number;
};

// 実ログイン済みプロフィールのgoalsを取得する。未ログインならnull。
export function useGoals() {
  const [goals, setGoals] = useState<GoalRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setGoals(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("goals")
      .select("id, name, target, active, image_url, position")
      .eq("profile_id", userData.user.id)
      .order("position", { ascending: true });

    setGoals((data as GoalRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { goals, loading, refetch };
}
