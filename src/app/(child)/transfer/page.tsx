"use client";

import { useState } from "react";
import { useMockChildTheme } from "@/lib/theme/MockChildThemeContext";
import {
  AccountKind,
  useMockBalances,
} from "@/lib/mock/MockBalancesContext";

const ACCOUNTS: { kind: AccountKind; label: string; emoji: string }[] = [
  { kind: "spend", label: "つかう", emoji: "👛" },
  { kind: "save", label: "ためる", emoji: "🐷" },
  { kind: "grow", label: "ふやす", emoji: "🌱" },
];

function AccountButton({
  kind,
  label,
  emoji,
  amount,
  selected,
  disabled,
  onClick,
}: {
  kind: AccountKind;
  label: string;
  emoji: string;
  amount: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-none border-2 p-4 flex-1 flex flex-col items-center gap-1 ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
      style={{
        borderColor: "var(--color-primary)",
        background: selected ? "var(--color-primary)" : "transparent",
        color: selected ? "white" : "var(--color-fg)",
      }}
      key={kind}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xs">{new Intl.NumberFormat("ja-JP").format(amount)}円</span>
    </button>
  );
}

export default function TransferPage() {
  const { theme } = useMockChildTheme();
  const { balances, mockTransfer } = useMockBalances();
  const currentBalances = balances[theme];

  const [from, setFrom] = useState<AccountKind | null>(null);
  const [to, setTo] = useState<AccountKind | null>(null);
  const [amount, setAmount] = useState("");
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
    const result = mockTransfer(theme, from, to, Number(amount));
    if (result.ok) {
      setMessage({ kind: "ok", text: "うごかしました！" });
      setAmount("");
      setFrom(null);
      setTo(null);
    } else {
      setMessage({ kind: "error", text: result.error });
    }
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h2 className="text-sm font-bold mb-2 opacity-80">どこから</h2>
        <div className="flex gap-2">
          {ACCOUNTS.map((account) => (
            <AccountButton
              key={account.kind}
              kind={account.kind}
              label={account.label}
              emoji={account.emoji}
              amount={currentBalances[account.kind]}
              selected={from === account.kind}
              disabled={account.kind === "grow"}
              onClick={() => handleSelectFrom(account.kind)}
            />
          ))}
        </div>
        {/* design.md §1.6①: ふやすは満期までロック（早期引き出し不可） */}
        <p className="text-xs opacity-70 mt-1">ふやすは まんきまで うごかせないよ</p>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2 opacity-80">どこへ</h2>
        <div className="flex gap-2">
          {ACCOUNTS.map((account) => (
            <AccountButton
              key={account.kind}
              kind={account.kind}
              label={account.label}
              emoji={account.emoji}
              amount={currentBalances[account.kind]}
              selected={to === account.kind}
              disabled={from === null || account.kind === from}
              onClick={() => handleSelectTo(account.kind)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2 opacity-80">いくら？</h2>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full border-2 rounded-none p-3 text-2xl font-bold"
          style={{ borderColor: "var(--color-primary)", background: "transparent", color: "var(--color-fg)" }}
        />
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        className="border-2 rounded-none p-4 text-lg font-bold text-white"
        style={{ background: "var(--color-primary)", borderColor: "var(--color-primary)" }}
      >
        うごかす
      </button>

      {message && (
        <p
          className="text-center font-bold"
          style={{ color: message.kind === "error" ? "#dc2626" : "var(--color-primary)" }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
