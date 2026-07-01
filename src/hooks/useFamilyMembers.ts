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
      console.log("[useFamilyMembers] user:", user.id, "data:", data, "error:", error);

      if (!cancelled) {
        setMembers((data ?? []) as FamilyMember[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { members, loading };
}
