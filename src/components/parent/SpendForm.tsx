"use client";

import { useState } from "react";
import { ChildTheme } from "@/lib/theme/childTheme";

export function SpendForm({
  theme,
  onSubmit,
}: {
  theme: ChildTheme;
  onSubmit: (amount: number, memo: string) => { ok: true } | { ok: false; error: string };
}) {
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit() {
    const result = onSubmit(amount, memo);
    if (!result.ok) {
      setError(result.error);
      setDone(false);
      return;
    }
    setError(null);
    setDone(true);
    setAmount(0);
    setMemo("");
  }

  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px solid #3A424C",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <input
        type="text"
        placeholder="なにに つかった？"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        style={{
          background: theme.frameBg,
          color: theme.ink,
          border: "1px solid #3A424C",
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 13,
        }}
      />
      <input
        type="number"
        placeholder="きんがく（円）"
        value={amount || ""}
        onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
        style={{
          background: theme.frameBg,
          color: theme.ink,
          border: "1px solid #3A424C",
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 13,
        }}
      />
      {error && <p style={{ color: "#E26D62", fontSize: 12 }}>{error}</p>}
      {done && <p style={{ color: "#3DB66E", fontSize: 12 }}>記録しました</p>}
      <button
        type="button"
        onClick={handleSubmit}
        style={{
          background: theme.accent,
          color: "#fff",
          borderRadius: 8,
          padding: "8px 0",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        記録する
      </button>
    </div>
  );
}
