"use client";

import { useState, useCallback } from "react";
import { ChildTheme } from "@/lib/theme/childTheme";
import { ThemeKey } from "@/lib/theme/themes";
import { transferMoney } from "@/lib/money/rpc";
import { ConfirmPopup } from "./ConfirmPopup";
import { TransferAnimation } from "./TransferAnimation";
import { useMockBalances, AccountKind } from "@/lib/mock/MockBalancesContext";

const DIGITS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "", "0", "⌫"] as const;

function mapRpcError(message: string): string {
  if (message.includes("insufficient balance")) return "おかねがたりないよ";
  if (message.includes("grow is locked")) return "ふやすは まんきまで うごかせないよ";
  if (message.includes("amount must be positive")) return "きんがくをいれてね";
  return message;
}

export function GrowDepositSheet({
  theme,
  themeKey,
  spendBalance,
  hasRealAccounts,
  onClose,
  onSuccess,
}: {
  theme: ChildTheme;
  themeKey: ThemeKey;
  spendBalance: number;
  hasRealAccounts: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isJun = themeKey === "jun_red";
  const { mockTransfer } = useMockBalances();

  const [amountStr, setAmountStr] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAnim, setShowAnim] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseInt(amountStr, 10) || 0;
  const canSubmit = amount > 0 && amount <= spendBalance;

  function handleDigit(key: string) {
    setError(null);
    if (key === "⌫") {
      setAmountStr((s) => (s.length <= 1 ? "0" : s.slice(0, -1)));
    } else if (key === "") {
      // no-op (empty slot)
    } else {
      setAmountStr((s) => {
        const next = s === "0" ? key : s + key;
        // 最大6桁（999,999円）
        return next.length > 6 ? s : next;
      });
    }
  }

  function handleTapConfirm() {
    if (!canSubmit) {
      if (amount <= 0) setError("きんがくをいれてね");
      else setError("つかうの おかねがたりないよ");
      return;
    }
    setShowConfirm(true);
  }

  const executeDeposit = useCallback(async () => {
    setShowConfirm(false);
    if (hasRealAccounts) {
      setSubmitting(true);
      const { error: rpcError } = await transferMoney("spend", "grow", amount);
      setSubmitting(false);
      if (rpcError) {
        setError(mapRpcError(rpcError.message));
        return;
      }
    } else {
      const result = mockTransfer(themeKey, "spend" as AccountKind, "grow" as AccountKind, amount);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    }
    setShowAnim(true);
  }, [hasRealAccounts, amount, themeKey, mockTransfer]);

  const accentGreen = "linear-gradient(135deg,#3DB66E,#2da05e)";
  const borderStyle = isJun ? "3px solid #111" : "none";
  const shadowStyle = isJun ? "4px 4px 0 #111" : "0 4px 14px rgba(27,158,90,.35)";

  return (
    <>
      {/* バックドロップ */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          zIndex: 40,
        }}
      />

      {/* シート本体 */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          background: theme.cardBg,
          borderRadius: "24px 24px 0 0",
          border: isJun ? "3px solid #111" : "none",
          boxShadow: isJun ? "-3px -3px 0 #111" : "0 -8px 32px rgba(27,58,107,.18)",
          padding: "20px 20px 40px",
          fontFamily: theme.fontFamily,
          color: theme.ink,
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: theme.sub }}>
              つかう → ふやす
            </p>
            <p style={{ fontSize: 13, fontWeight: 800 }}>
              つかう ざんだか：
              <span style={{ color: theme.accent }}>
                {new Intl.NumberFormat("ja-JP").format(spendBalance)}えん
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,.08)",
              border: "none",
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
              color: theme.sub,
            }}
          >
            ×
          </button>
        </div>

        {/* 金額表示 */}
        <div
          style={{
            textAlign: "center",
            padding: "12px 0 16px",
            borderBottom: `1.5px solid rgba(0,0,0,.07)`,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1px" }}>
            {new Intl.NumberFormat("ja-JP").format(amount)}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 4 }}>えん</span>
        </div>

        {/* テンキー */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {DIGITS.map((key, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleDigit(key)}
              disabled={key === ""}
              style={{
                height: 52,
                borderRadius: isJun ? 10 : 14,
                border: key === "⌫" ? (isJun ? "2px solid #111" : `1px solid rgba(0,0,0,.12)`) : (isJun ? "2px solid #111" : "none"),
                background: key === "" ? "transparent" : key === "⌫" ? (isJun ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.06)") : theme.frameBg,
                color: theme.ink,
                fontSize: 20,
                fontWeight: 800,
                cursor: key === "" ? "default" : "pointer",
                boxShadow: key !== "" && key !== "⌫" && isJun ? "2px 2px 0 #111" : "none",
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* エラー */}
        {error && (
          <p style={{ textAlign: "center", color: "#dc2626", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            {error}
          </p>
        )}

        {/* ロック警告 */}
        <p style={{ textAlign: "center", fontSize: 11, color: theme.sub, marginBottom: 12, lineHeight: 1.6 }}>
          🔒 いれると まんきまで うごかせなくなるよ
        </p>

        {/* あずけるボタン */}
        <button
          type="button"
          onClick={handleTapConfirm}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "16px 0",
            background: canSubmit ? accentGreen : "rgba(0,0,0,.12)",
            color: canSubmit ? "#fff" : theme.sub,
            borderRadius: isJun ? 12 : theme.cardRadius,
            border: canSubmit ? borderStyle : "none",
            boxShadow: canSubmit ? shadowStyle : "none",
            fontWeight: 900,
            fontSize: 16,
            cursor: canSubmit ? "pointer" : "default",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "あずけちゅう…" : "＋ あずける"}
        </button>
      </div>

      {/* ロック確認ポップアップ */}
      {showConfirm && (
        <ConfirmPopup
          theme={theme}
          title="ほんとうに いい？"
          message={`${new Intl.NumberFormat("ja-JP").format(amount)}えん を ふやすに いれると、まんきまで うごかせなくなるよ。`}
          confirmLabel="うん、いれる"
          cancelLabel="やめる"
          onConfirm={executeDeposit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* 振替アニメーション */}
      {showAnim && (
        <TransferAnimation
          fromKind="spend"
          toKind="grow"
          amount={amount}
          themeKey={themeKey}
          onComplete={() => {
            setShowAnim(false);
            onSuccess();
            onClose();
          }}
        />
      )}
    </>
  );
}
