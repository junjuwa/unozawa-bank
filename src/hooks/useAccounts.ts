"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Accounts = { spend: number; save: number; grow: number };

// 実ログイン済みプロフィールのaccountsをkindごとにマッピングして返す。
// 未ログインならaccountsはnull（呼び出し側でモックにフォールバックする）。
export function useAccounts() {
  const [accounts, setAccounts] = useState<Accounts | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAccounts(null);
      setLoading(false);
      return;
    }

    const { data: rows } = await supabase
      .from("accounts")
      .select("kind, balance")
      .eq("profile_id", userData.user.id);

    if (!rows) {
      setAccounts(null);
      setLoading(false);
      return;
    }

    const next: Accounts = { spend: 0, save: 0, grow: 0 };
    for (const row of rows as { kind: string; balance: number }[]) {
      if (row.kind === "spend" || row.kind === "save" || row.kind === "grow") {
        next[row.kind] = row.balance;
      }
    }
    setAccounts(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { accounts, loading, refetch };
}
