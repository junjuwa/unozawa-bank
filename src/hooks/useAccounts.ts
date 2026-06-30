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
    // 30秒ごとに自動更新（支給後・振替後に親からの変更を反映）
    const id = setInterval(() => { refetch(); }, 30_000);
    return () => clearInterval(id);
  }, [refetch]);

  return { accounts, loading, refetch };
}
