import { createClient } from "@/lib/supabase/client";

type AccountKind = "spend" | "save" | "grow";

export async function transferMoney(
  from: AccountKind,
  to: AccountKind,
  amount: number,
) {
  const supabase = createClient();
  return supabase.rpc("transfer_money", {
    p_from: from,
    p_to: to,
    p_amount: amount,
  });
}

export async function approveJobRequest(requestId: string) {
  const supabase = createClient();
  return supabase.rpc("approve_job_request", { p_request_id: requestId });
}
