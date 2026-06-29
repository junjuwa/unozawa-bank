"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import { childThemes, ChildTheme } from "@/lib/theme/childTheme";
import {
  AccountKind,
  useMockBalances,
} from "@/lib/mock/MockBalancesContext";
import { CoinRow } from "@/components/child/Coin";

const ACCOUNTS: { kind: AccountKind; label: string; emoji: string }[] = [
  { kind: "spend", label: "つかう", emoji: "👛" },
  { kind: "save", label: "ためる", emoji: "🐷" },
  { kind: "grow", label: "ふやす", emoji: "🌱" },
];

function AccountTile({
  emoji,
  label,
  amount,
  selected,
  disabled,
  onClick,
  theme,
}: {
  emoji: string;
  label: string;
  amount: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  theme: ChildTheme;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={disabled ? "opacity-40 cursor-not-allowed" : ""}
      style={{
        position: "relative",
        flex: 1,
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
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 11, opacity: 0.8 }}>
        {new Intl.NumberFormat("ja-JP").format(amount)}えん
      </span>
    </button>
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
        minWidth: 52,
        height: 40,
        borderRadius: 20,
        padding: "0 12px",
        background: tone === "plus" ? theme.accent : theme.progressTrack,
        color: tone === "plus" ? "#fff" : theme.ink,
        fontWeight: 900,
        fontSize: 13,
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
  const currentBalances = balances[themeKey];

  const [from, setFrom] = useState<AccountKind | null>(null);
  const [to, setTo] = useState<AccountKind | null>(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );

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
              emoji={account.emoji}
              label={account.label}
              amount={currentBalances[account.kind]}
              selected={from === account.kind}
              disabled={account.kind === "grow"}
              onClick={() => handleSelectFrom(account.kind)}
            />
          ))}
        </div>
        {/* design.md §1.6①: ふやすは満期までロック（早期引き出し不可） */}
        <p style={{ fontSize: 11, color: theme.sub, marginTop: 8 }}>
          ふやすは まんきまで うごかせないよ
        </p>
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
              emoji={account.emoji}
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
          うつす かず
        </h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
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
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 900,
              fontSize: 22,
              margin: "0 10px",
            }}
          >
            <CoinRow coin={theme.coin} count={1} size={18} />
            {amount}えん
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
        style={{
          background: theme.accent,
          color: "#fff",
          borderRadius: theme.cardRadius,
          border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
          boxShadow: theme.cardShadow,
          padding: 16,
          fontWeight: 900,
          fontSize: 16,
        }}
      >
        うごかす
      </button>

      {message && (
        <p
          className="text-center font-bold"
          style={{ color: message.kind === "error" ? "#dc2626" : theme.accentInk }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
