"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userName: string;
  /** テーマカラー（子: rei/jun, 親: parent_dark） */
  accentColor: string;
  onVerified: () => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinScreen({ userName, accentColor, onVerified }: Props) {
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKey = useCallback(
    (key: string) => {
      if (checking) return;
      if (key === "⌫") {
        setDigits((d) => d.slice(0, -1));
        setError(null);
        return;
      }
      if (key === "") return;
      if (digits.length >= 4) return;
      const next = [...digits, key];
      setDigits(next);
      if (next.length === 4) {
        verify(next.join(""));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [digits, checking],
  );

  async function verify(pin: string) {
    setChecking(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("verify_pin", { p_pin: pin });
    setChecking(false);
    if (rpcError || !data) {
      setShake(true);
      setError("まちがっているよ");
      setTimeout(() => {
        setShake(false);
        setDigits([]);
      }, 500);
      return;
    }
    onVerified();
  }

  // キーボード対応
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      if (e.key === "Backspace") handleKey("⌫");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0D1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      {/* ユーザー名 */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{userName}</div>
        <div style={{ fontSize: 13, color: "#7A8694", marginTop: 4 }}>あんしょうばんごうを いれてね</div>
      </div>

      {/* ドット表示 */}
      <div
        style={{
          display: "flex",
          gap: 20,
          animation: shake ? "pin-shake 0.4s ease" : "none",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: i < digits.length ? accentColor : "transparent",
              border: `2px solid ${i < digits.length ? accentColor : "#3A424C"}`,
              transition: "background 0.1s, border-color 0.1s",
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "#E26D62", marginTop: -16 }}>{error}</div>
      )}

      {/* 数字パッド */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          width: 240,
        }}
      >
        {KEYS.map((key, i) => (
          <button
            key={i}
            type="button"
            disabled={key === "" || checking}
            onClick={() => handleKey(key)}
            style={{
              height: 64,
              borderRadius: 16,
              fontSize: key === "⌫" ? 22 : 26,
              fontWeight: 700,
              color: key === "" ? "transparent" : "#fff",
              background: key === "" ? "transparent" : "#1E2530",
              border: key === "" ? "none" : "1px solid #2A3240",
              cursor: key === "" ? "default" : "pointer",
              opacity: checking ? 0.5 : 1,
              transition: "opacity 0.1s",
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pin-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
