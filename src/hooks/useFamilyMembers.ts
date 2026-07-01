import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FamilyMember = {
  id: string;
  display_name: string;
  role: "parent" | "child";
  theme_key: string | null;
  avatar_url: string | null;
  has_pin: boolean;
};

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase.rpc("get_family_members");
      if (error) { console.error("get_family_members:", error); }

      const mapped: FamilyMember[] = (data ?? []).map((r: Record<string, unknown>) => ({
        id:           r.m_id as string,
        display_name: (r.m_display_name as string) ?? "",
        role:         r.m_role as "parent" | "child",
        theme_key:    r.m_theme_key as string | null,
        avatar_url:   r.m_avatar_url as string | null,
        has_pin:      r.m_has_pin as boolean,
      }));

      if (!cancelled) {
        setMembers(mapped);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { members, loading };
}
