import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // service role を使うため Edge 不可
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel Cron が自動付与する Authorization: Bearer <CRON_SECRET> を検証
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient(); // service role（RLS バイパス）

  // ① 満期投資 → 元本+利息を「ためる」へ
  const { data: matured, error: e1 } = await supabase.rpc(
    "process_matured_investments",
  );
  // ② 基本給：支給曜日なら支給
  const { data: paid, error: e2 } = await supabase.rpc("pay_base_salary");
  // ↑ この実クエリ自体が「DBアクセス」となり、無料枠の7日pauseを回避する

  if (e1 || e2) return Response.json({ ok: false, e1, e2 }, { status: 500 });
  return Response.json({ ok: true, matured, paid, ranAt: new Date().toISOString() });
}
