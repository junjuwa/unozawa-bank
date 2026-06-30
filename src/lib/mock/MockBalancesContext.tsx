"use client";

// MOCK ONLY: ログイン未実装のため、振替の業務ルール(design.md §1.6①)を
// クライアント側で再現している。本実装では削除し、
// src/lib/money/rpc.ts の transferMoney()（transfer_money RPC）を直接呼び、
// 検証はDB側のRLS/RPCに一本化する。

import { createContext, useContext, useState } from "react";
import { ThemeKey } from "@/lib/theme/themes";

export type AccountKind = "spend" | "save" | "grow";
type Balances = { spend: number; save: number; grow: number };
type TransferResult = { ok: true } | { ok: false; error: string };
// 曜日インデックス(0=日..6=土)別の「ためる」への累積額。
// セッション開始からの簡易集計であり、カレンダー週の境界リセットや
// 永続化は行わない。本実装ではtransactionsテーブルからの集計に置き換える。
type WeeklyHistory = number[];

const INITIAL_BALANCES: Record<ThemeKey, Balances> = {
  rei_blue: { spend: 1200, save: 5400, grow: 3000 },
  jun_red: { spend: 800, save: 2100, grow: 0 },
  parent_dark: { spend: 0, save: 0, grow: 0 },
};

const INITIAL_WEEKLY_HISTORY: Record<ThemeKey, WeeklyHistory> = {
  rei_blue: [0, 0, 0, 0, 0, 0, 0],
  jun_red: [0, 0, 0, 0, 0, 0, 0],
  parent_dark: [0, 0, 0, 0, 0, 0, 0],
};

type MockBalancesContextValue = {
  balances: Record<ThemeKey, Balances>;
  weeklyHistory: Record<ThemeKey, WeeklyHistory>;
  mockTransfer: (
    theme: ThemeKey,
    from: AccountKind,
    to: AccountKind,
    amount: number,
  ) => TransferResult;
  creditReward: (theme: ThemeKey, amount: number) => void;
};

const MockBalancesContext = createContext<MockBalancesContextValue | null>(
  null,
);

export function MockBalancesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [balances, setBalances] =
    useState<Record<ThemeKey, Balances>>(INITIAL_BALANCES);
  const [weeklyHistory, setWeeklyHistory] =
    useState<Record<ThemeKey, WeeklyHistory>>(INITIAL_WEEKLY_HISTORY);

  function mockTransfer(
    theme: ThemeKey,
    from: AccountKind,
    to: AccountKind,
    amount: number,
  ): TransferResult {
    if (amount <= 0) return { ok: false, error: "きんがくをいれてね" };
    if (from === to) return { ok: false, error: "おなじはこにはうごかせないよ" };
    if (from === "grow") return { ok: false, error: "ふやすは まんきまで うごかせないよ" };

    const current = balances[theme];
    if (current[from] < amount) {
      return { ok: false, error: "おかねがたりないよ" };
    }

    setBalances((prev) => ({
      ...prev,
      [theme]: {
        ...prev[theme],
        [from]: prev[theme][from] - amount,
        [to]: prev[theme][to] + amount,
      },
    }));

    if (to === "save") {
      const dayIndex = new Date().getDay();
      setWeeklyHistory((prev) => {
        const next = [...prev[theme]];
        next[dayIndex] += amount;
        return { ...prev, [theme]: next };
      });
    }

    return { ok: true };
  }

  // design.md §1.6②: 入金（基本給・お仕事承認）は必ず「つかう(spend)」へ入る
  function creditReward(theme: ThemeKey, amount: number) {
    setBalances((prev) => ({
      ...prev,
      [theme]: { ...prev[theme], spend: prev[theme].spend + amount },
    }));
  }

  return (
    <MockBalancesContext.Provider
      value={{ balances, weeklyHistory, mockTransfer, creditReward }}
    >
      {children}
    </MockBalancesContext.Provider>
  );
}

export function useMockBalances() {
  const ctx = useContext(MockBalancesContext);
  if (!ctx) {
    throw new Error(
      "useMockBalances は MockBalancesProvider の内側で使ってください",
    );
  }
  return ctx;
}
