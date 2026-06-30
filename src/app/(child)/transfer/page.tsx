"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes, ChildTheme } from "@/lib/theme/childTheme";
import {
  AccountKind,
  useMockBalances,
} from "@/lib/mock/MockBalancesContext";
import { useAccounts } from "@/hooks/useAccounts";
import { transferMoney } from "@/lib/money/rpc";
import { BoxIcon } from "@/components/child/boxIcons";
import { ConfirmPopup } from "@/components/child/ConfirmPopup";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// transfer_money RPC(supabase/migrations/0001_init.sql)の例外メッセージを
// モックと同じひらがなメッセージにマッピングする
function mapRpcError(message: string): string {
  if (message.includes("insufficient balance")) return "おかねがたりないよ";
  if (message.includes("same account")) return "おなじはこにはうごかせないよ";
  if (message.includes("grow is locked")) return "ふやすは まんきまで うごかせないよ";
  if (message.includes("amount must be positive")) return "きんがくをいれてね";
  return message;
}

const ACCOUNTS: { kind: AccountKind; label: string }[] = [
  { kind: "spend", label: "つかう" },
  { kind: "save", label: "ためる" },
  { kind: "grow", label: "ふやす" },
];

function AccountTile({
  kind,
  label,
  amount,
  selected,
  disabled,
  onClick,
  theme,
  hint,
}: {
  kind: AccountKind;
  label: string;
  amount: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  theme: ChildTheme;
  hint?: string;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={disabled ? "opacity-40 cursor-not-allowed" : ""}
        style={{
          position: "relative",
          width: "100%",
          background: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: selected ? `3px solid ${theme.accent}` : theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: "16px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          color: theme.ink,
        }}
      >
        {selected && (
          <span
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: theme.accent,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 900,
              border: "2px solid #fff",
            }}
          >
            ✓
          </span>
        )}
        <BoxIcon kind={kind} size={28} />
        <span style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          {new Intl.NumberFormat("ja-JP").format(amount)}えん
        </span>
      </button>
      {hint && (
        <p style={{ fontSize: 10, color: theme.sub, textAlign: "center", lineHeight: 1.3 }}>{hint}</p>
      )}
    </div>
  );
}

function AmountButton({
  theme,
  label,
  onClick,
  tone,
}: {
  theme: ChildTheme;
  label: string;
  onClick: () => void;
  tone: "plus" | "minus";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        height: 36,
        borderRadius: 18,
        padding: "0 2px",
        background: tone === "plus" ? theme.accent : theme.progressTrack,
        color: tone === "plus" ? "#fff" : theme.ink,
        fontWeight: 900,
        fontSize: 11,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {label}
    </button>
  );
}

export default function TransferPage() {
  const { theme: themeKey } = useMockChildTheme();
  const theme = childThemes[themeKey];
  const { balances, mockTransfer } = useMockBalances();
  const { accounts, loading: accountsLoading, refetch } = useAccounts();
  // 実ログイン済みならaccountsテーブルの実残高、未ログインならモックにフォールバック
  const currentBalances = accounts ?? balances[themeKey];

  const [from, setFrom] = useState<AccountKind | null>(null);
  const [to, setTo] = useState<AccountKind | null>(null);
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );

  if (accountsLoading) return <LoadingScreen />;

  function handleSelectFrom(kind: AccountKind) {
    setFrom(kind);
    if (to === kind) setTo(null);
    setMessage(null);
  }

  function handleSelectTo(kind: AccountKind) {
    setTo(kind);
    setMessage(null);
  }

  function handleSubmit() {
    if (!from || !to) {
      setMessage({ kind: "error", text: "どこから・どこへ を えらんでね" });
      return;
    }
    // ふやすに入れると満期まで動かせなくなるため、実行前に確認する
    if (to === "grow") {
      setShowLockConfirm(true);
      return;
    }
    executeTransfer();
  }

  async function executeTransfer() {
    if (!from || !to) return;
    setShowLockConfirm(false);

    if (accounts) {
      setSubmitting(true);
      const { error } = await transferMoney(from, to, amount);
      setSubmitting(false);
      if (error) {
        setMessage({ kind: "error", text: mapRpcError(error.message) });
        return;
      }
      setMessage({ kind: "ok", text: "うごかしました！" });
      setAmount(0);
      setFrom(null);
      setTo(null);
      refetch();
      return;
    }

    const result = mockTransfer(themeKey, from, to, amount);
    if (result.ok) {
      setMessage({ kind: "ok", text: "うごかしました！" });
      setAmount(0);
      setFrom(null);
      setTo(null);
    } else {
      setMessage({ kind: "error", text: result.error });
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-2" style={{ fontFamily: theme.fontFamily, color: theme.ink }}>
      <section
        style={{
          background: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 13, fontWeight: 800, color: theme.sub, marginBottom: 10 }}>
          どの はこ から
        </h2>
        <div className="flex gap-2">
          {ACCOUNTS.map((account) => (
            <AccountTile
              key={account.kind}
              theme={theme}
              kind={account.kind}
              label={account.label}
              amount={currentBalances[account.kind]}
              selected={from === account.kind}
              disabled={account.kind === "grow"}
              onClick={() => handleSelectFrom(account.kind)}
              // design.md §1.6①: ふやすは満期までロック（早期引き出し不可）。
              // ふやすタイルの直下にだけヒントを出す
              hint={account.kind === "grow" ? "まんきまで うごかせないよ" : undefined}
            />
          ))}
        </div>
      </section>

      <section
        style={{
          background: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 13, fontWeight: 800, color: theme.sub, marginBottom: 10 }}>
          どの はこ へ
        </h2>
        <div className="flex gap-2">
          {ACCOUNTS.map((account) => (
            <AccountTile
              key={account.kind}
              theme={theme}
              kind={account.kind}
              label={account.label}
              amount={currentBalances[account.kind]}
              selected={to === account.kind}
              disabled={from === null || account.kind === from}
              onClick={() => handleSelectTo(account.kind)}
            />
          ))}
        </div>
      </section>

      <section
        style={{
          background: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 13, fontWeight: 800, color: theme.sub, marginBottom: 10, textAlign: "center" }}>
          うごかす きんがく
        </h2>
        <div className="flex items-center justify-center" style={{ gap: 3 }}>
          {[1000, 100, 10].map((step) => (
            <AmountButton
              key={`plus-${step}`}
              theme={theme}
              label={`+${step}`}
              onClick={() => setAmount((a) => a + step)}
              tone="plus"
            />
          ))}
          <span
            style={{
              flexShrink: 0,
              fontWeight: 900,
              fontSize: 18,
              margin: "0 6px",
              whiteSpace: "nowrap",
            }}
          >
            {amount}
            <span style={{ fontSize: 10 }}>えん</span>
          </span>
          {[10, 100, 1000].map((step) => (
            <AmountButton
              key={`minus-${step}`}
              theme={theme}
              label={`-${step}`}
              onClick={() => setAmount((a) => Math.max(0, a - step))}
              tone="minus"
            />
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          background: theme.accent,
          color: "#fff",
          borderRadius: theme.cardRadius,
          border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
          boxShadow: theme.cardShadow,
          padding: 16,
          fontWeight: 900,
          fontSize: 16,
          opacity: submitting ? 0.6 : 1,
          marginBottom: 16,
        }}
      >
        {submitting ? "うごかしちゅう…" : "うごかす"}
      </button>

      {message && (
        <p
          className="text-center font-bold"
          style={{ color: message.kind === "error" ? "#dc2626" : theme.accentInk }}
        >
          {message.text}
        </p>
      )}

      {showLockConfirm && (
        <ConfirmPopup
          theme={theme}
          title="ほんとうに いい？"
          message={`${amount}えん を ふやすに いれると、まんきまで うごかせなくなるよ。`}
          confirmLabel="うん、いれる"
          cancelLabel="やめる"
          onConfirm={executeTransfer}
          onCancel={() => setShowLockConfirm(false)}
        />
      )}
    </div>
  );
}
