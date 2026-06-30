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

export async function rejectJobRequest(requestId: string) {
  const supabase = createClient();
  return supabase.rpc("reject_job_request", { p_request_id: requestId });
}

export async function spendMoney(profileId: string, amount: number, memo?: string) {
  const supabase = createClient();
  return supabase.rpc("spend_money", {
    p_profile_id: profileId,
    p_amount: amount,
    p_memo: memo ?? null,
  });
}
