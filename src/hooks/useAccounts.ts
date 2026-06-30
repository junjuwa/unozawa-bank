"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Accounts = { spend: number; save: number; grow: number };

function rowsToAccounts(rows: { kind: string; balance: number }[]): Accounts {
  const next: Accounts = { spend: 0, save: 0, grow: 0 };
  for (const row of rows) {
    if (row.kind === "spend" || row.kind === "save" || row.kind === "grow") {
      next[row.kind] = row.balance;
    }
  }
  return next;
}

// 実ログイン済みプロフィールのaccountsをkindごとにマッピングして返す。
// Realtimeサブスクリプションで残高変更を即時反映する。
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

    setAccounts(rowsToAccounts(rows as { kind: string; balance: number }[]));
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setLoading(false); return; }
      userId = data.user.id;

      // 初回フェッチ
      refetch();

      // Realtimeサブスクリプション: accountsテーブルの自分の行が変わったら即時更新
      const channel = supabase
        .channel("accounts-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "accounts", filter: `profile_id=eq.${userId}` },
          () => { refetch(); },
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });
  }, [refetch]);

  return { accounts, loading, refetch };
}
