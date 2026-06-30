// goalsテーブルはお金を動かさないため、RPCを介さずクライアントから直接操作する
// （0005_goals.sqlのgoals_write_child RLSで子は自分の行のみ書込可）。
import { createClient } from "@/lib/supabase/client";
import { GoalRow } from "@/hooks/useGoals";

export async function addGoal(
  profileId: string,
  name: string,
  target: number,
  hasActive: boolean,
  nextPosition: number,
) {
  const supabase = createClient();
  return supabase.from("goals").insert({
    profile_id: profileId,
    name,
    target,
    active: !hasActive,
    position: nextPosition,
  });
}

export async function removeGoal(goalId: string) {
  const supabase = createClient();
  return supabase.from("goals").delete().eq("id", goalId);
}

export async function activateGoal(goalId: string) {
  const supabase = createClient();
  return supabase.from("goals").update({ active: true }).eq("id", goalId);
}

// 隣接する2件のpositionを入れ替える
export async function swapGoalPositions(a: GoalRow, b: GoalRow) {
  const supabase = createClient();
  const [r1, r2] = await Promise.all([
    supabase.from("goals").update({ position: b.position }).eq("id", a.id),
    supabase.from("goals").update({ position: a.position }).eq("id", b.id),
  ]);
  return r1.error ?? r2.error ?? null;
}

export async function setGoalImage(goalId: string, dataUrl: string) {
  const supabase = createClient();
  return supabase.from("goals").update({ image_url: dataUrl }).eq("id", goalId);
}
