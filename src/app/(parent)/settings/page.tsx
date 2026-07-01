"use client";

import { useState } from "react";
import Link from "next/link";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockSettings } from "@/lib/mock/MockSettingsContext";
import { useMockBalances } from "@/lib/mock/MockBalancesContext";
import { useFamilySettings } from "@/hooks/useFamilySettings";
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
  } = useMockSettings();
  const { creditReward } = useMockBalances();

  const { settings: familySettings, loading: settingsLoading, updateFamilySettings } = useFamilySettings();
  const { overview, refetch: refetchOverview } = useFamilyOverview();
  const { profile: parentProfile } = useProfile();
  const isReal = familySettings !== null;

  const [salaryMessage, setSalaryMessage] = useState<string | null>(null);
  // 基本給: ローカルstate + onBlurでDB保存
  const [salaryDraft, setSalaryDraft] = useState<Record<string, number | string>>({});
  // 投資設定: ローカルstate + 反映ボタンでDB保存
  const [investRateDraft, setInvestRateDraft] = useState<number | null>(null);
  const [maturityDaysDraft, setMaturityDaysDraft] = useState<number | null>(null);
  const [investSaved, setInvestSaved] = useState(false);
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

  const [passkeyMessage, setPasskeyMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [pinMessages, setPinMessages] = useState<Record<string, { kind: "ok" | "error"; text: string }>>({});

  if (settingsLoading) return <LoadingScreen />;

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

  // 投資設定はdraftがあればそちらを表示、なければDBの値
  const investRate = investRateDraft ?? (isReal ? familySettings.investment_rate : mockSettings.investRate);
  const investTermDays = maturityDaysDraft ?? (isReal ? familySettings.maturity_days : mockSettings.investTermDays);
  const examplePrincipal = 500;
  const exampleInterest = Math.round(examplePrincipal * investRate);

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
          onIncrement={() => { setInvestRateDraft(Math.min(0.5, investRate + 0.01)); setInvestSaved(false); if (!isReal) setInvestRate(Math.min(0.5, investRate + 0.01)); }}
          onDecrement={() => { setInvestRateDraft(Math.max(0, investRate - 0.01)); setInvestSaved(false); if (!isReal) setInvestRate(Math.max(0, investRate - 0.01)); }}
        />
        <SettingRow
          theme={theme}
          label="満期までの日数"
          value={investTermDays}
          unit="日"
          onIncrement={() => { setMaturityDaysDraft(investTermDays + 1); setInvestSaved(false); if (!isReal) setInvestTermDays(investTermDays + 1); }}
          onDecrement={() => { setMaturityDaysDraft(Math.max(1, investTermDays - 1)); setInvestSaved(false); if (!isReal) setInvestTermDays(Math.max(1, investTermDays - 1)); }}
        />
        <p style={{ fontSize: 12, color: theme.sub, marginTop: 10 }}>
          ¥{examplePrincipal} 運用 → 満期に{" "}
          <strong style={{ color: theme.accentInk }}>
            ¥{examplePrincipal + exampleInterest}
          </strong>{" "}
          (+¥{exampleInterest}) が「ためる」へ
        </p>
        {isReal && (
          <button
            type="button"
            onClick={() => {
              updateFamilySettings({
                investment_rate: investRate,
                maturity_days: investTermDays,
              });
              setInvestSaved(true);
            }}
            style={{
              marginTop: 10,
              fontSize: 12,
              fontWeight: 700,
              color: investSaved ? "#3DB66E" : theme.accent,
              border: `1px solid ${investSaved ? "#3DB66E" : theme.accent}`,
              borderRadius: 12,
              padding: "6px 16px",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            {investSaved ? "反映済" : "反映"}
          </button>
        )}
      </section>

      <Link href="/settings/jobs" style={{ display: "block", textDecoration: "none" }}>
        <section
          style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 14, color: theme.ink }}>おしごとの単価</h2>
            <p style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>おしごとの一覧・単価・完了条件を編集</p>
          </div>
          <span style={{ fontSize: 16, color: theme.sub }}>›</span>
        </section>
      </Link>

      <Link href="/settings/promises" style={{ display: "block", textDecoration: "none" }}>
        <section
          style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 14, color: theme.ink }}>やくそく（約束）</h2>
            <p style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>子供画面に表示するやくそくを編集</p>
          </div>
          <span style={{ fontSize: 16, color: theme.sub }}>›</span>
        </section>
      </Link>

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
