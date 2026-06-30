"use client";

import { useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { THEME_LABELS } from "@/lib/theme/themes";
import { SettingRow } from "@/components/parent/SettingRow";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function SettingsPage() {
  const theme = childThemes.parent_dark;
  const {
    settings,
    setBasePay,
    setInvestRate,
    setInvestTermDays,
    setJobReward,
    setJobCondition,
    addJob,
    removeJob,
  } = useMockSettings();
  const { creditReward } = useMockBalances();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newReward, setNewReward] = useState(0);
  const [newCondition, setNewCondition] = useState("");

  const examplePrincipal = 500;
  const exampleInterest = Math.round(examplePrincipal * settings.investRate);

  function handleAddJob() {
    if (!newName.trim()) return;
    addJob(newName.trim(), newReward, newCondition.trim());
    setNewName("");
    setNewReward(0);
    setNewCondition("");
    setShowAddForm(false);
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>基本給</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          支給日：毎月1日（固定。design.md §1.6④/0002_monthly_salary.sql）
        </p>
        {CHILDREN.map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <SettingRow
                theme={theme}
                label={THEME_LABELS[key].split("（")[0]}
                value={settings.basePay[key]}
                unit="円/月"
                onIncrement={() => setBasePay(key, settings.basePay[key] + 50)}
                onDecrement={() => setBasePay(key, Math.max(0, settings.basePay[key] - 50))}
              />
            </div>
            <input
              type="number"
              value={settings.basePay[key]}
              onChange={(e) => setBasePay(key, Math.max(0, Number(e.target.value)))}
              style={{
                width: 80,
                textAlign: "right",
                background: theme.frameBg,
                color: theme.ink,
                border: "1px solid #3A424C",
                borderRadius: 8,
                padding: "6px 8px",
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={() => creditReward(key, settings.basePay[key])}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: theme.accent,
                border: `1px solid ${theme.accent}`,
                borderRadius: 14,
                padding: "6px 10px",
                whiteSpace: "nowrap",
              }}
            >
              今すぐ支給（テスト）
            </button>
          </div>
        ))}
      </section>

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>ふやす（投資）</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          満期で利息がついて「ためる」へ
        </p>
        <SettingRow
          theme={theme}
          label="利率（満期ごと）"
          value={Math.round(settings.investRate * 100)}
          unit="%"
          onIncrement={() => setInvestRate(Math.min(0.5, settings.investRate + 0.01))}
          onDecrement={() => setInvestRate(Math.max(0, settings.investRate - 0.01))}
        />
        <SettingRow
          theme={theme}
          label="満期までの日数"
          value={settings.investTermDays}
          unit="日"
          onIncrement={() => setInvestTermDays(settings.investTermDays + 1)}
          onDecrement={() => setInvestTermDays(Math.max(1, settings.investTermDays - 1))}
        />
        <p style={{ fontSize: 12, color: theme.sub, marginTop: 10 }}>
          ¥{examplePrincipal} 運用 → 満期に{" "}
          <strong style={{ color: theme.accentInk }}>
            ¥{examplePrincipal + exampleInterest}
          </strong>{" "}
          (+¥{exampleInterest}) が「ためる」へ
        </p>
      </section>

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>おしごとの単価</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          承認時に「つかう」へ加算。すでに申請中／承認済みのおしごとには反映されません（申請時点の単価で固定）
        </p>
        {settings.jobCatalog.map((job) => (
          <div key={job.id} style={{ borderBottom: "1px solid #3A424C", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <SettingRow
                  theme={theme}
                  label={job.name}
                  value={job.reward}
                  unit="円"
                  onIncrement={() => setJobReward(job.id, job.reward + 10)}
                  onDecrement={() => setJobReward(job.id, Math.max(0, job.reward - 10))}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`「${job.name}」を削除しますか？`)) removeJob(job.id);
                }}
                aria-label={`${job.name}を削除`}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#E26D62",
                  border: "1px solid #E26D62",
                  borderRadius: 14,
                  padding: "6px 10px",
                  whiteSpace: "nowrap",
                }}
              >
                削除
              </button>
            </div>
            <label style={{ display: "block", fontSize: 11, color: theme.sub, marginTop: 6 }}>
              完了条件
              <input
                type="text"
                value={job.condition}
                onChange={(e) => setJobCondition(job.id, e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  background: theme.frameBg,
                  color: theme.ink,
                  border: "1px solid #3A424C",
                  borderRadius: 8,
                  padding: "6px 8px",
                  fontSize: 12,
                }}
              />
            </label>
          </div>
        ))}

        {showAddForm ? (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              placeholder="おしごとの名前"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ background: theme.frameBg, color: theme.ink, border: "1px solid #3A424C", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
            />
            <input
              type="number"
              placeholder="単価（円）"
              value={newReward}
              onChange={(e) => setNewReward(Math.max(0, Number(e.target.value)))}
              style={{ background: theme.frameBg, color: theme.ink, border: "1px solid #3A424C", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
            />
            <input
              type="text"
              placeholder="完了条件"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              style={{ background: theme.frameBg, color: theme.ink, border: "1px solid #3A424C", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddJob}
                style={{ flex: 1, background: theme.accent, color: "#fff", borderRadius: 8, padding: "8px 0", fontWeight: 700, fontSize: 13 }}
              >
                追加する
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ flex: 1, border: "1px solid #3A424C", color: theme.sub, borderRadius: 8, padding: "8px 0", fontWeight: 700, fontSize: 13 }}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={{
              marginTop: 12,
              width: "100%",
              border: `1px dashed ${theme.accent}`,
              color: theme.accent,
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ＋ おしごとを追加
          </button>
        )}
      </section>
    </div>
  );
}
