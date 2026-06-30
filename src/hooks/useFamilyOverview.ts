"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeKey } from "@/lib/theme/themes";

export type ChildOverview = {
  profileId: string;
  themeKey: ThemeKey;
  displayName: string;
  baseSalary: number;
  avatarUrl: string | null;
  mascotUrl: string | null;
  boxes: { spend: number; save: number; grow: number };
  weeklyHistory: number[]; // [日,月,火,水,木,金,土]の今週「ためる」へ移動した額
  activeGoal: { name: string; target: number } | null;
  maturingInterest: number; // status='active'なinvestment_lotsのinterest_amount合計
};

// 今週の日曜0時(Asia/Tokyo)を返す
function startOfWeekTokyo(): Date {
  const now = new Date();
  const tokyoNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const dow = tokyoNow.getDay();
  tokyoNow.setHours(0, 0, 0, 0);
  tokyoNow.setDate(tokyoNow.getDate() - dow);
  return tokyoNow;
}

function dayOfWeekTokyo(iso: string): number {
  return new Date(new Date(iso).toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).getDay();
}

// 親プロフィールなら家族の子供全員ぶんを横断集計して返す。未ログイン/子なら null。
export function useFamilyOverview() {
  const [overview, setOverview] = useState<ChildOverview[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setOverview(null);
      setLoading(false);
      return;
    }

    const { data: children } = await supabase
      .from("profiles")
      .select("id, display_name, theme_key, base_salary, avatar_url, mascot_url")
      .eq("role", "child");

    if (!children || children.length === 0) {
      setOverview(null);
      setLoading(false);
      return;
    }

    const childIds = children.map((c) => c.id as string);

    const [{ data: accountRows }, { data: weekTxRows }, { data: goalRows }, { data: lotRows }] =
      await Promise.all([
        supabase.from("accounts").select("profile_id, kind, balance").in("profile_id", childIds),
        supabase
          .from("transactions")
          .select("profile_id, amount, created_at")
          .in("profile_id", childIds)
          .eq("to_kind", "save")
          .gte("created_at", startOfWeekTokyo().toISOString()),
        supabase
          .from("goals")
          .select("profile_id, name, target")
          .in("profile_id", childIds)
          .eq("active", true),
        supabase
          .from("investment_lots")
          .select("profile_id, interest_amount")
          .in("profile_id", childIds)
          .eq("status", "active"),
      ]);

    const result: ChildOverview[] = children.map((child) => {
      const boxes = { spend: 0, save: 0, grow: 0 };
      for (const row of (accountRows as { profile_id: string; kind: string; balance: number }[]) ?? []) {
        if (row.profile_id !== child.id) continue;
        if (row.kind === "spend" || row.kind === "save" || row.kind === "grow") {
          boxes[row.kind] = row.balance;
        }
      }

      const weeklyHistory = [0, 0, 0, 0, 0, 0, 0];
      for (const row of (weekTxRows as { profile_id: string; amount: number; created_at: string }[]) ?? []) {
        if (row.profile_id !== child.id) continue;
        weeklyHistory[dayOfWeekTokyo(row.created_at)] += row.amount;
      }

      const goal = ((goalRows as { profile_id: string; name: string; target: number }[]) ?? []).find(
        (g) => g.profile_id === child.id,
      );

      const maturingInterest = (
        (lotRows as { profile_id: string; interest_amount: number }[]) ?? []
      ).reduce((sum, lot) => (lot.profile_id === child.id ? sum + lot.interest_amount : sum), 0);

      return {
        profileId: child.id as string,
        themeKey: child.theme_key as ThemeKey,
        displayName: child.display_name as string,
        baseSalary: (child as { base_salary?: number }).base_salary ?? 0,
        avatarUrl: (child as { avatar_url?: string | null }).avatar_url ?? null,
        mascotUrl: (child as { mascot_url?: string | null }).mascot_url ?? null,
        boxes,
        weeklyHistory,
        activeGoal: goal ? { name: goal.name, target: goal.target } : null,
        maturingInterest,
      };
    });

    setOverview(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { overview, loading, refetch };
}
