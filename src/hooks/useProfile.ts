"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useProfile() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(profileRow ?? null);
      setLoading(false);
    });
  }, []);

  return { profile, loading };
}
