"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useMockGoals } from "@/lib/mock/MockGoalsContext";
import { childThemes } from "@/lib/theme/childTheme";
import { GoalCard } from "@/components/child/GoalCard";

export default function GoalsPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const save = useMockBalances().balances[themeKey].save;
  const { goals, addGoal, removeGoal, moveGoal } = useMockGoals();
  const childGoals = goals[themeKey];

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState(0);

  function handleAdd() {
    if (!newName.trim() || newTarget <= 0) return;
    addGoal(themeKey, newName.trim(), newTarget);
    setNewName("");
    setNewTarget(0);
    setShowAddForm(false);
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
                onClick={() => moveGoal(themeKey, goal.id, "up")}
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
                onClick={() => moveGoal(themeKey, goal.id, "down")}
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
                  if (confirm(`「${goal.name}」を削除しますか？`)) removeGoal(themeKey, goal.id);
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
            <GoalCard
              theme={theme}
              name={goal.name}
              current={goal.active ? save : 0}
              target={goal.target}
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
            border: `1px dashed ${theme.accent}`,
            color: theme.accent,
            borderRadius: theme.cardRadius,
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
