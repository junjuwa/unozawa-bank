import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FamilyMember = {
  id: string;
  display_name: string;
  role: "parent" | "child";
  theme_key: string | null;
  pin_hash: string | null;
};

// 同じ家族の全メンバー（自分を含む）を返す。未ログインなら null。
export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: me } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();
      if (!me) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, role, theme_key, pin_hash")
        .eq("family_id", me.family_id);

      if (!cancelled) {
        setMembers((data ?? []) as FamilyMember[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { members, loading };
}
