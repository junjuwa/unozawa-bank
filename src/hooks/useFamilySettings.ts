"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FamilySettingsRow = {
  family_id: string;
  base_salary: number;
  investment_rate: number;
  maturity_days: number;
  promises: string[];
};

// family_settingsを1行取得する（settings_select RLSで自家族分のみ）。未ログインならnull。
export function useFamilySettings() {
  const [settings, setSettings] = useState<FamilySettingsRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("family_settings")
      .select("family_id, base_salary, investment_rate, maturity_days, promises")
      .single();

    setSettings((data as FamilySettingsRow) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // settings_update_parent RLSにより親のみ直接updateできる
  async function updateFamilySettings(patch: Partial<FamilySettingsRow>) {
    if (!settings) return;
    const supabase = createClient();
    await supabase.from("family_settings").update(patch).eq("family_id", settings.family_id);
    refetch();
  }

  return { settings, loading, refetch, updateFamilySettings };
}
