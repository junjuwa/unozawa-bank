"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SpendTransaction = {
  id: string;
  amount: number;
  memo: string | null;
  created_at: string;
};

// 自分のtype='spend'なtransactionsを取得する。未ログインならnull。
export function useSpendHistory() {
  const [records, setRecords] = useState<SpendTransaction[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setRecords(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("transactions")
      .select("id, amount, memo, created_at")
      .eq("profile_id", userData.user.id)
      .eq("type", "spend")
      .order("created_at", { ascending: false });

    setRecords((data as SpendTransaction[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { records, loading, refetch };
}
