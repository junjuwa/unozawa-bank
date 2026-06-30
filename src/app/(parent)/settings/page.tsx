"use client";

import { useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useFamilySettings } from "@/hooks/useFamilySettings";
import { useJobCatalogAdmin } from "@/hooks/useJobCatalogAdmin";
import { useFamilyOverview } from "@/hooks/useFamilyOverview";
import { paySalaryNow, payCustomAmount, setPin } from "@/lib/money/rpc";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import { THEME_LABELS } from "@/lib/theme/themes";
import { SettingRow } from "@/components/parent/SettingRow";
import { registerPasskey } from "@/lib/auth/passkey";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function SettingsPage() {
  const theme = childThemes.parent_dark;
  const {
    settings: mockSettings,
    setBasePay,
    setInvestRate,
    setInvestTermDays,
    setJobReward,
    setJobCondition,
    addJob,
    removeJob,
  } = useMockSettings();
  const { creditReward } = useMockBalances();

  const { settings: familySettings, loading: settingsLoading, updateFamilySettings } = useFamilySettings();
  const {
    catalog: realCatalog,
    loading: catalogLoading,
    addJobTask,
    updateJobTask,
    removeJobTask,
  } = useJobCatalogAdmin();
  const { overview, refetch: refetchOverview } = useFamilyOverview();
  const { profile: parentProfile } = useProfile();
  const isReal = familySettings !== null;

  const [salaryMessage, setSalaryMessage] = useState<string | null>(null);
  // 基本給の編集はローカルstateで管理し、onBlurでDBに保存する
  // （DBの値をそのままvalueにするとrefetchのたびに入力がリセットされる）
  const [salaryDraft, setSalaryDraft] = useState<Record<string, number | string>>({});
  const [customPayTarget, setCustomPayTarget] = useState<string>("");
  const [customPayAmount, setCustomPayAmount] = useState<number>(0);
  const [customPayMessage, setCustomPayMessage] = useState<string | null>(null);

  async function handlePayNow(profileId: string) {
    setSalaryMessage(null);
    const { error } = await paySalaryNow(profileId);
    if (error) {
      setSalaryMessage(`しっぱい: ${error.message}`);
    } else {
      setSalaryMessage("きほんきゅうを しきゅうしました！");
      refetchOverview();
    }
  }

  async function handleCustomPay() {
    setCustomPayMessage(null);
    if (!customPayTarget || customPayAmount <= 0) {
      setCustomPayMessage("たいしょうと きんがくを にゅうりょくしてください");
      return;
    }
    const { error } = await payCustomAmount(customPayTarget, customPayAmount);
    if (error) {
      setCustomPayMessage(`しっぱい: ${error.message}`);
    } else {
      setCustomPayMessage("しきゅうしました！");
      setCustomPayAmount(0);
      refetchOverview();
    }
  }

  async function handleUpdateBaseSalary(profileId: string, value: number) {
    const supabase = createClient();
    await supabase.from("profiles").update({ base_salary: value }).eq("id", profileId);
    refetchOverview();
  }

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newReward, setNewReward] = useState(0);
  const [newCondition, setNewCondition] = useState("");
  const [newPromise, setNewPromise] = useState("");
  const [passkeyMessage, setPasskeyMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [pinMessages, setPinMessages] = useState<Record<string, { kind: "ok" | "error"; text: string }>>({});

  if (settingsLoading || catalogLoading) return <LoadingScreen />;

  async function handleSetPin(profileId: string) {
    const pin = pinInputs[profileId] ?? "";
    if (!/^\d{4}$/.test(pin)) {
      setPinMessages((m) => ({ ...m, [profileId]: { kind: "error", text: "4けたの すうじを にゅうりょくしてください" } }));
      return;
    }
    const { error } = await setPin(profileId, pin);
    if (error) {
      setPinMessages((m) => ({ ...m, [profileId]: { kind: "error", text: error.message } }));
    } else {
      setPinMessages((m) => ({ ...m, [profileId]: { kind: "ok", text: "あんしょうばんごうを せってい しました" } }));
      setPinInputs((v) => ({ ...v, [profileId]: "" }));
    }
  }

  async function handleRegisterPasskey() {
    setPasskeyMessage(null);
    const { error } = await registerPasskey();
    if (error) {
      setPasskeyMessage({ kind: "error", text: error.message });
      return;
    }
    setPasskeyMessage({ kind: "ok", text: "パスキーを登録しました" });
  }

  const investRate = isReal ? familySettings.investment_rate : mockSettings.investRate;
  const investTermDays = isReal ? familySettings.maturity_days : mockSettings.investTermDays;
  const examplePrincipal = 500;
  const exampleInterest = Math.round(examplePrincipal * investRate);

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

  function handleAddPromise() {
    if (!isReal || !newPromise.trim()) return;
    updateFamilySettings({ promises: [...familySettings.promises, newPromise.trim()] });
    setNewPromise("");
  }

  function handleRemovePromise(index: number) {
    if (!isReal) return;
    updateFamilySettings({ promises: familySettings.promises.filter((_, i) => i !== index) });
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
        {salaryMessage && (
          <p style={{ fontSize: 12, color: salaryMessage.startsWith("しっぱい") ? "#E26D62" : "#3DB66E", marginBottom: 8 }}>
            {salaryMessage}
          </p>
        )}
        {isReal ? (
          (overview ?? []).map((child) => (
            <div key={child.profileId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ flex: 1, fontSize: 13, color: theme.ink }}>{child.displayName}</span>
              <input
                type="number"
                value={salaryDraft[child.profileId] ?? child.baseSalary}
                onChange={(e) => setSalaryDraft((d) => ({ ...d, [child.profileId]: e.target.value }))}
                onBlur={(e) => {
                  const v = Math.max(0, Number(e.target.value));
                  setSalaryDraft((d) => ({ ...d, [child.profileId]: v }));
                  handleUpdateBaseSalary(child.profileId, v);
                }}
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
              <span style={{ fontSize: 12, color: theme.sub }}>円/月</span>
              <button
                type="button"
                onClick={() => handlePayNow(child.profileId)}
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
                今すぐ支給
              </button>
            </div>
          ))
        ) : (
          CHILDREN.map((key) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <SettingRow
                  theme={theme}
                  label={THEME_LABELS[key].split("（")[0]}
                  value={mockSettings.basePay[key]}
                  unit="円/月"
                  onIncrement={() => setBasePay(key, mockSettings.basePay[key] + 50)}
                  onDecrement={() => setBasePay(key, Math.max(0, mockSettings.basePay[key] - 50))}
                />
              </div>
              <input
                type="number"
                value={mockSettings.basePay[key]}
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
                onClick={() => creditReward(key, mockSettings.basePay[key])}
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
          ))
        )}
      </section>

      {/* 今すぐ支給セクション（実モード・モック共通。実モードはpay_custom_amount RPC、モックはcreditReward） */}
      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>てあてを おくる</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 10 }}>
          たいしょうと きんがくを えらんで すぐに「つかう」へ いれます
        </p>
        {customPayMessage && (
          <p style={{ fontSize: 12, color: customPayMessage.startsWith("しっぱい") ? "#E26D62" : "#3DB66E", marginBottom: 8, fontWeight: 700 }}>
            {customPayMessage}
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <select
            value={isReal ? customPayTarget : ""}
            onChange={(e) => setCustomPayTarget(e.target.value)}
            style={{ background: theme.frameBg, color: theme.ink, border: "1px solid #3A424C", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
          >
            <option value="">たいしょうを えらぶ</option>
            {isReal
              ? (overview ?? []).map((child) => (
                  <option key={child.profileId} value={child.profileId}>{child.displayName}</option>
                ))
              : (["rei_blue", "jun_red"] as const).map((key) => (
                  <option key={key} value={key}>{THEME_LABELS[key].split("（")[0]}</option>
                ))}
          </select>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              placeholder="きんがく（えん）"
              value={customPayAmount || ""}
              onChange={(e) => setCustomPayAmount(Math.max(0, Number(e.target.value)))}
              style={{ flex: 1, background: theme.frameBg, color: theme.ink, border: "1px solid #3A424C", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
            />
            <span style={{ fontSize: 12, color: theme.sub }}>えん</span>
            <button
              type="button"
              onClick={() => {
                if (isReal) {
                  handleCustomPay();
                } else {
                  if (!customPayTarget || customPayAmount <= 0) return;
                  if (customPayTarget === "rei_blue" || customPayTarget === "jun_red") {
                    creditReward(customPayTarget, customPayAmount);
                    setCustomPayMessage("（モック）しきゅうしました！");
                    setCustomPayAmount(0);
                  }
                }
              }}
              style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: theme.accent, borderRadius: 14, padding: "8px 14px", whiteSpace: "nowrap" }}
            >
              今すぐ支給
            </button>
          </div>
        </div>
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
          value={Math.round(investRate * 100)}
          unit="%"
          onIncrement={() =>
            isReal
              ? updateFamilySettings({ investment_rate: Math.min(0.5, investRate + 0.01) })
              : setInvestRate(Math.min(0.5, investRate + 0.01))
          }
          onDecrement={() =>
            isReal
              ? updateFamilySettings({ investment_rate: Math.max(0, investRate - 0.01) })
              : setInvestRate(Math.max(0, investRate - 0.01))
          }
        />
        <SettingRow
          theme={theme}
          label="満期までの日数"
          value={investTermDays}
          unit="日"
          onIncrement={() =>
            isReal
              ? updateFamilySettings({ maturity_days: investTermDays + 1 })
              : setInvestTermDays(investTermDays + 1)
          }
          onDecrement={() =>
            isReal
              ? updateFamilySettings({ maturity_days: Math.max(1, investTermDays - 1) })
              : setInvestTermDays(Math.max(1, investTermDays - 1))
          }
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
        {jobCatalog.map((job) => (
          <div key={job.id} style={{ borderBottom: "1px solid #3A424C", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <SettingRow
                  theme={theme}
                  label={job.name}
                  value={job.reward}
                  unit="円"
                  onIncrement={() =>
                    isReal
                      ? updateJobTask(job.id, { reward: job.reward + 10 })
                      : setJobReward(job.id, job.reward + 10)
                  }
                  onDecrement={() =>
                    isReal
                      ? updateJobTask(job.id, { reward: Math.max(0, job.reward - 10) })
                      : setJobReward(job.id, Math.max(0, job.reward - 10))
                  }
                />
              </div>
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
            <label style={{ display: "block", fontSize: 11, color: theme.sub, marginTop: 6 }}>
              完了条件
              <input
                type="text"
                value={job.condition}
                onChange={(e) =>
                  isReal
                    ? updateJobTask(job.id, { condition: e.target.value })
                    : setJobCondition(job.id, e.target.value)
                }
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

      {isReal && (
        <section
          style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
        >
          <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>やくそく</h2>
          <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
            子供画面の「やくそく」に追加で表示されます（ひらがな推奨）
          </p>
          {familySettings.promises.map((promise, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid #3A424C",
              }}
            >
              <span style={{ flex: 1, fontSize: 13, color: theme.ink }}>{promise}</span>
              <button
                type="button"
                onClick={() => handleRemovePromise(i)}
                aria-label="削除"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#E26D62",
                  border: "1px solid #E26D62",
                  borderRadius: 14,
                  padding: "6px 10px",
                }}
              >
                削除
              </button>
            </div>
          ))}
          <div className="flex gap-2" style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="あたらしい やくそく"
              value={newPromise}
              onChange={(e) => setNewPromise(e.target.value)}
              style={{
                flex: 1,
                background: theme.frameBg,
                color: theme.ink,
                border: "1px solid #3A424C",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={handleAddPromise}
              style={{
                background: theme.accent,
                color: "#fff",
                borderRadius: 8,
                padding: "8px 14px",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              追加
            </button>
          </div>
        </section>
      )}

      {isReal && (
        <section
          style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
        >
          <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>あんしょうばんごう（PIN）</h2>
          <p style={{ fontSize: 11, color: theme.sub, marginBottom: 12 }}>
            パスキーでログインした後に入力する4けたの番号です。共用端末でのなりすまし防止に使います。
          </p>
          {parentProfile?.id ? (
            <PinSetRow
              label="おや"
              profileId={String(parentProfile.id)}
              selfPin
              pinValue={pinInputs[String(parentProfile.id)] ?? ""}
              onPinChange={(v) => setPinInputs((m) => ({ ...m, [String(parentProfile!.id)]: v }))}
              message={pinMessages[String(parentProfile.id)] ?? null}
              onSave={() => handleSetPin(String(parentProfile!.id))}
              theme={theme}
            />
          ) : null}
          {/* 子供ごとのPIN */}
          {(overview ?? []).map((child) => (
            <PinSetRow
              key={child.profileId}
              label={child.displayName}
              profileId={child.profileId}
              selfPin={false}
              pinValue={pinInputs[child.profileId] ?? ""}
              onPinChange={(v) => setPinInputs((m) => ({ ...m, [child.profileId]: v }))}
              message={pinMessages[child.profileId] ?? null}
              onSave={() => handleSetPin(child.profileId)}
              theme={theme}
            />
          ))}
        </section>
      )}

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>おやのパスキー</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          この端末にパスキーを登録すると、次回から/parent-loginでパスキーログインできます
        </p>
        {passkeyMessage && (
          <p
            style={{
              fontSize: 12,
              color: passkeyMessage.kind === "error" ? "#E26D62" : "#3DB66E",
              marginBottom: 8,
            }}
          >
            {passkeyMessage.text}
          </p>
        )}
        <button
          type="button"
          onClick={handleRegisterPasskey}
          style={{
            width: "100%",
            background: theme.accent,
            color: "#fff",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          パスキーを登録する
        </button>
      </section>
    </div>
  );
}

function PinSetRow({
  label,
  pinValue,
  onPinChange,
  message,
  onSave,
  theme,
}: {
  label: string;
  profileId: string | null;
  selfPin: boolean;
  pinValue: string;
  onPinChange: (v: string) => void;
  message: { kind: "ok" | "error"; text: string } | null;
  onSave: () => void;
  theme: import("@/lib/theme/childTheme").ChildTheme;
}) {
  return (
    <div style={{ borderBottom: "1px solid #3A424C", padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 13, color: theme.ink, fontWeight: 700 }}>{label}</span>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="4けた"
          value={pinValue}
          onChange={(e) => onPinChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          style={{
            width: 72,
            textAlign: "center",
            background: theme.frameBg,
            color: theme.ink,
            border: "1px solid #3A424C",
            borderRadius: 8,
            padding: "7px 8px",
            fontSize: 16,
            letterSpacing: 4,
          }}
        />
        <button
          type="button"
          onClick={onSave}
          style={{
            background: theme.accent,
            color: "#fff",
            borderRadius: 8,
            padding: "7px 14px",
            fontWeight: 700,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          セット
        </button>
      </div>
      {message && (
        <p style={{ fontSize: 11, marginTop: 4, color: message.kind === "ok" ? "#3DB66E" : "#E26D62" }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
