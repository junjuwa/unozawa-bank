"use client";

import { useState } from "react";
import Link from "next/link";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useFamilySettings } from "@/hooks/useFamilySettings";
import { useJobCatalogAdmin } from "@/hooks/useJobCatalogAdmin";
import { SettingRow } from "@/components/parent/SettingRow";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function JobsSettingsPage() {
  const theme = childThemes.parent_dark;
  const {
    settings: mockSettings,
    setJobReward,
    setJobCondition,
    addJob,
    removeJob,
  } = useMockSettings();

  const { settings: familySettings, loading: settingsLoading } = useFamilySettings();
  const {
    catalog: realCatalog,
    loading: catalogLoading,
    addJobTask,
    updateJobTask,
    removeJobTask,
  } = useJobCatalogAdmin();

  const isReal = familySettings !== null;

  const [conditionDraft, setConditionDraft] = useState<Record<string, string>>({});
  const [conditionSaved, setConditionSaved] = useState<Record<string, boolean>>({});
  const [rewardDraft, setRewardDraft] = useState<Record<string, number>>({});
  const [rewardSaved, setRewardSaved] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newReward, setNewReward] = useState(0);
  const [newCondition, setNewCondition] = useState("");

  if (settingsLoading || catalogLoading) return <LoadingScreen />;

  const jobCatalog = isReal ? realCatalog ?? [] : mockSettings.jobCatalog;

  function handleAddJob() {
    if (!newName.trim()) return;
    if (isReal) {
      addJobTask(newName.trim(), newReward, newCondition.trim());
    } else {
      addJob(newName.trim(), newReward, newCondition.trim());
    }
    setNewName("");
    setNewReward(0);
    setNewCondition("");
    setShowAddForm(false);
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Link
        href="/settings"
        style={{ fontSize: 13, color: theme.accent, fontWeight: 700, display: "inline-block", marginBottom: 4 }}
      >
        ← もどる
      </Link>

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>おしごとの単価</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          承認時に「つかう」へ加算。すでに申請中／承認済みのおしごとには反映されません（申請時点の単価で固定）
        </p>
        {jobCatalog.map((job) => (
          <div key={job.id} style={{ borderBottom: "1px solid #3A424C", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <SettingRow
                  theme={theme}
                  label={job.name}
                  value={rewardDraft[job.id] ?? job.reward}
                  unit="円"
                  onIncrement={() => {
                    const next = (rewardDraft[job.id] ?? job.reward) + 10;
                    setRewardDraft((d) => ({ ...d, [job.id]: next }));
                    setRewardSaved((s) => ({ ...s, [job.id]: false }));
                    if (!isReal) setJobReward(job.id, next);
                  }}
                  onDecrement={() => {
                    const next = Math.max(0, (rewardDraft[job.id] ?? job.reward) - 10);
                    setRewardDraft((d) => ({ ...d, [job.id]: next }));
                    setRewardSaved((s) => ({ ...s, [job.id]: false }));
                    if (!isReal) setJobReward(job.id, next);
                  }}
                />
              </div>
              {isReal && (
                <button
                  type="button"
                  onClick={() => {
                    updateJobTask(job.id, { reward: rewardDraft[job.id] ?? job.reward });
                    setRewardSaved((s) => ({ ...s, [job.id]: true }));
                  }}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: rewardSaved[job.id] ? "#3DB66E" : theme.accent,
                    border: `1px solid ${rewardSaved[job.id] ? "#3DB66E" : theme.accent}`,
                    borderRadius: 14,
                    padding: "6px 10px",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {rewardSaved[job.id] ? "反映済" : "反映"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm(`「${job.name}」を削除しますか？`)) {
                    if (isReal) removeJobTask(job.id);
                    else removeJob(job.id);
                  }
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
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, color: theme.sub }}>完了条件</span>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                <input
                  type="text"
                  value={conditionDraft[job.id] ?? job.condition}
                  onChange={(e) => {
                    setConditionDraft((d) => ({ ...d, [job.id]: e.target.value }));
                    setConditionSaved((s) => ({ ...s, [job.id]: false }));
                  }}
                  style={{
                    flex: 1,
                    background: theme.frameBg,
                    color: theme.ink,
                    border: "1px solid #3A424C",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = conditionDraft[job.id] ?? job.condition;
                    if (isReal) updateJobTask(job.id, { condition: val });
                    else setJobCondition(job.id, val);
                    setConditionSaved((s) => ({ ...s, [job.id]: true }));
                  }}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: conditionSaved[job.id] ? "#3DB66E" : theme.accent,
                    border: `1px solid ${conditionSaved[job.id] ? "#3DB66E" : theme.accent}`,
                    borderRadius: 10,
                    padding: "6px 10px",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {conditionSaved[job.id] ? "反映済" : "反映"}
                </button>
              </div>
            </div>
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
