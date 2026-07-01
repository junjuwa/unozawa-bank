import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeKey } from "@/lib/theme/themes";

export type ActivityEntry = {
  id: string;
  profileId: string;
  displayName: string;
  themeKey: ThemeKey;
  type: string;
  amount: number;
  fromKind: string | null;
  toKind: string | null;
  memo: string | null;
  createdAt: string;
};

// type に対する日本語ラベル
export const TYPE_LABEL: Record<string, string> = {
  salary:     "月次支給",
  job_reward: "お手伝い報酬",
  transfer:   "口座振替",
  interest:   "ふやす満期",
};

export function useFamilyActivity() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // 自分が親かチェック
    const { data: me } = await supabase
      .from("profiles")
      .select("role, family_id")
      .eq("id", user.id)
      .single();
    if (!me || me.role !== "parent") { setLoading(false); return; }

    // 家族の子供 profile 一覧
    const { data: children } = await supabase
      .from("profiles")
      .select("id, display_name, theme_key")
      .eq("family_id", me.family_id)
      .eq("role", "child");
    if (!children || children.length === 0) { setLoading(false); return; }

    const childIds = children.map((c) => c.id);
    const profileMap = Object.fromEntries(
      children.map((c) => [c.id, { displayName: c.display_name ?? "", themeKey: c.theme_key as ThemeKey }])
    );

    // 直近200件（salary/job_reward/transfer/interest のみ）
    const { data: txs } = await supabase
      .from("transactions")
      .select("id, profile_id, type, amount, from_kind, to_kind, memo, created_at")
      .in("profile_id", childIds)
      .in("type", ["salary", "job_reward", "transfer", "interest"])
      .order("created_at", { ascending: false })
      .limit(200);

    const mapped: ActivityEntry[] = (txs ?? []).map((t) => ({
      id: t.id,
      profileId: t.profile_id,
      displayName: profileMap[t.profile_id]?.displayName ?? t.profile_id,
      themeKey: profileMap[t.profile_id]?.themeKey ?? "rei_blue",
      type: t.type,
      amount: t.amount,
      fromKind: t.from_kind ?? null,
      toKind: t.to_kind ?? null,
      memo: t.memo ?? null,
      createdAt: t.created_at,
    }));

    setEntries(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, refetch: fetch };
}
