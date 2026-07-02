"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { InvestLot } from "@/lib/mock/investLots";

// 実ログイン済みプロフィールのactiveなinvestment_lotsを取得する。未ログインならnull。
// remainingDays/totalDaysはmatures_at/started_atから計算する（満期日数はlotに保存されないため）。
export function useInvestmentLots() {
  const [lots, setLots] = useState<InvestLot[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLots(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("investment_lots")
      .select("id, principal, interest_amount, started_at, matures_at")
      .eq("profile_id", userData.user.id)
      .eq("status", "active")
      .order("matures_at", { ascending: true });

    const now = Date.now();
    const mapped: InvestLot[] = (
      (data as
        | { id: string; principal: number; interest_amount: number; started_at: string; matures_at: string }[]
        | null) ?? []
    ).map((row) => {
      const startedAt = new Date(row.started_at).getTime();
      const maturesAt = new Date(row.matures_at).getTime();
      const totalDays = Math.max(1, Math.round((maturesAt - startedAt) / 86400000));
      const remainingDays = Math.max(0, Math.ceil((maturesAt - now) / 86400000));
      return {
        id: row.id,
        principal: row.principal,
        interestAmount: row.interest_amount,
        totalDays,
        remainingDays,
        startedAt: row.started_at.slice(0, 10),
      };
    });

    setLots(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { lots, loading, refetch };
}
