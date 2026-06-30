"use client";

import { useRef, useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useMockGoals } from "@/lib/mock/MockGoalsContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useGoals } from "@/hooks/useGoals";
import { createClient } from "@/lib/supabase/client";
import {
  addGoal as addGoalApi,
  removeGoal as removeGoalApi,
  activateGoal,
  swapGoalPositions,
  setGoalImage as setGoalImageApi,
} from "@/lib/goals/api";
import { childThemes } from "@/lib/theme/childTheme";
import { GoalCard } from "@/components/child/GoalCard";

// 実ログイン済みのgoalsテーブルと、未ログイン時のMockGoalsContextを共通の表示型に揃える
type DisplayGoal = { id: string; name: string; target: number; active: boolean; imageUrl?: string | null };

export default function GoalsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];

  const { accounts } = useAccounts();
  const mockSave = useMockBalances().balances[themeKey].save;
  const save = accounts?.save ?? mockSave;

  const { goals: realGoals, refetch: refetchGoals } = useGoals();
  const mock = useMockGoals();
  const mockGoals = mock.goals[themeKey];

  const isReal = realGoals !== null;
  const childGoals: DisplayGoal[] = isReal
    ? realGoals.map((g) => ({ id: g.id, name: g.name, target: g.target, active: g.active, imageUrl: g.image_url }))
    : mockGoals;

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState(0);

  async function handleAdd() {
    if (!newName.trim() || newTarget <= 0) return;

    if (isReal) {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const hasActive = realGoals!.some((g) => g.active);
      const nextPosition = realGoals!.length;
      await addGoalApi(userData.user.id, newName.trim(), newTarget, hasActive, nextPosition);
      refetchGoals();
    } else {
      mock.addGoal(themeKey, newName.trim(), newTarget);
    }

    setNewName("");
    setNewTarget(0);
    setShowAddForm(false);
  }

  async function handleRemove(goalId: string) {
    if (isReal) {
      const removed = realGoals!.find((g) => g.id === goalId);
      await removeGoalApi(goalId);
      const rest = realGoals!.filter((g) => g.id !== goalId);
      if (removed?.active && rest.length > 0 && !rest.some((g) => g.active)) {
        await activateGoal(rest[0].id);
      }
      refetchGoals();
    } else {
      mock.removeGoal(themeKey, goalId);
    }
  }

  async function handleMove(goalId: string, direction: "up" | "down") {
    if (isReal) {
      const list = realGoals!;
      const index = list.findIndex((g) => g.id === goalId);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= list.length) return;
      await swapGoalPositions(list[index], list[swapWith]);
      refetchGoals();
    } else {
      mock.moveGoal(themeKey, goalId, direction);
    }
  }

  function handleImageChange(goalId: string, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      if (isReal) {
        await setGoalImageApi(goalId, reader.result);
        refetchGoals();
      } else {
        mock.setGoalImage(themeKey, goalId, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 style={{ fontWeight: 900, fontSize: 18, color: theme.ink }}>
        もくひょう いちらん
      </h1>
      {childGoals.map((goal, index) => (
        <div key={goal.id}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: theme.sub }}>
              {goal.active ? "いま ためてる" : "つぎ"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(goal.id, "up")}
                disabled={index === 0}
                aria-label="上に動かす"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `1px solid ${theme.sub}`,
                  color: theme.sub,
                  opacity: index === 0 ? 0.3 : 1,
                  fontSize: 12,
                }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMove(goal.id, "down")}
                disabled={index === childGoals.length - 1}
                aria-label="下に動かす"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `1px solid ${theme.sub}`,
                  color: theme.sub,
                  opacity: index === childGoals.length - 1 ? 0.3 : 1,
                  fontSize: 12,
                }}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`「${goal.name}」を削除しますか？`)) handleRemove(goal.id);
                }}
                aria-label="削除"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "1px solid #E26D62",
                  color: "#E26D62",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <div
            style={{
              background: theme.cardBg,
              borderRadius: theme.cardRadius,
              border: theme.cardBorder,
              boxShadow: theme.cardShadow,
              padding: 16,
            }}
          >
            <input
              ref={(el) => {
                inputRefs.current[goal.id] = el;
              }}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageChange(goal.id, e.target.files?.[0] ?? null)}
            />
            <GoalCard
              theme={theme}
              name={goal.name}
              current={goal.active ? save : 0}
              target={goal.target}
              imageUrl={goal.imageUrl}
              onImageClick={() => inputRefs.current[goal.id]?.click()}
            />
          </div>
        </div>
      ))}

      {showAddForm ? (
        <div
          style={{
            background: theme.cardBg,
            borderRadius: theme.cardRadius,
            border: theme.cardBorder,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="ほしいものの名前"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              border: `1px solid ${theme.sub}`,
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 14,
              color: theme.ink,
              background: "transparent",
            }}
          />
          <input
            type="number"
            placeholder="目標金額（円）"
            value={newTarget || ""}
            onChange={(e) => setNewTarget(Math.max(0, Number(e.target.value)))}
            style={{
              border: `1px solid ${theme.sub}`,
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 14,
              color: theme.ink,
              background: "transparent",
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              style={{
                flex: 1,
                background: theme.accent,
                color: "#fff",
                borderRadius: 8,
                padding: "10px 0",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              ついかする
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                flex: 1,
                border: `1px solid ${theme.sub}`,
                color: theme.sub,
                borderRadius: 8,
                padding: "10px 0",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              やめる
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          style={{
            background: theme.accent,
            border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
            color: "#fff",
            borderRadius: theme.cardRadius,
            boxShadow: theme.cardShadow,
            padding: "14px 0",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          ＋ もくひょうを ついかする
        </button>
      )}
    </div>
  );
}
