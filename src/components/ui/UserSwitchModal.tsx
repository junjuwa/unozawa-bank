"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ユーザ切り替えモーダル。
// Step1: 切り替え先を選択（れい / じゅん / おとうさん）
// Step2: その人の PIN を入力
// → /api/auth/switch-user → verifyOtp → 新セッション取得 → リダイレクト

export type SwitchUser = {
  profileId: string;
  label: string;
  emoji: string;
  destinationPath: string;
};

type Props = {
  currentProfileId: string | null;
  users: SwitchUser[];          // 切り替え候補（現在ユーザを除外して渡す）
  onClose: () => void;
};

export function UserSwitchModal({ currentProfileId, users, onClose }: Props) {
  const [target, setTarget] = useState<SwitchUser | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const candidates = users.filter((u) => u.profileId !== currentProfileId);

  async function handleSwitch() {
    if (!target || pin.length < 4) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/switch-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId: target.profileId, pin }),
    });
    const json = await res.json() as { token_hash?: string; error?: string };

    if (!res.ok || !json.token_hash) {
      setLoading(false);
      setError(json.error === "wrong pin" ? "PINが ちがいます" : "きりかえ できませんでした");
      setPin("");
      return;
    }

    // 現セッションを破棄して新セッションを取得
    const supabase = createClient();
    await supabase.auth.signOut();
    const { error: otpErr } = await supabase.auth.verifyOtp({
      token_hash: json.token_hash,
      type: "magiclink",
    });
    if (otpErr) {
      setLoading(false);
      setError("きりかえ できませんでした");
      return;
    }

    window.location.replace(target.destinationPath);
  }

  // キーパッド入力
  function handleKey(k: string) {
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      // 少し待ってから送信（UI的に4桁が見えるように）
      setTimeout(() => {
        setPin(next);
        setLoading(true);
        handleSwitchWith(next);
      }, 120);
    }
  }

  async function handleSwitchWith(p: string) {
    if (!target) return;
    setError(null);
    const res = await fetch("/api/auth/switch-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId: target.profileId, pin: p }),
    });
    const json = await res.json() as { token_hash?: string; error?: string };
    if (!res.ok || !json.token_hash) {
      setLoading(false);
      setError(json.error === "wrong pin" ? "PINが ちがいます" : "きりかえ できませんでした");
      setPin("");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    const { error: otpErr } = await supabase.auth.verifyOtp({
      token_hash: json.token_hash,
      type: "magiclink",
    });
    if (otpErr) {
      setLoading(false);
      setError("きりかえ できませんでした");
      setPin("");
      return;
    }
    window.location.replace(target.destinationPath);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(10,20,40,.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#0D1117",
          borderRadius: "28px 28px 0 0",
          padding: "24px 24px 44px",
          fontFamily: "'Zen Maru Gothic', system-ui, sans-serif",
          color: "#fff",
        }}
      >
        {!target ? (
          /* Step 1: ユーザ選択 */
          <>
            <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>だれに きりかえる？</h2>
            <p style={{ fontSize: 13, color: "#7A8494", marginBottom: 20 }}>
              きりかえ先を えらんで PIN を入力してね
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {candidates.map((u) => (
                <button
                  key={u.profileId}
                  type="button"
                  onClick={() => { setTarget(u); setPin(""); setError(null); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "#1C2430",
                    border: "1.5px solid #2A3340",
                    borderRadius: 16,
                    padding: "14px 18px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 17,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{u.emoji}</span>
                  {u.label}
                  <span style={{ marginLeft: "auto", color: "#4A5568" }}>›</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 18,
                display: "block",
                width: "100%",
                background: "none",
                border: "none",
                color: "#7A8494",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </>
        ) : (
          /* Step 2: PIN 入力 */
          <>
            <button
              type="button"
              onClick={() => { setTarget(null); setPin(""); setError(null); }}
              style={{ background: "none", border: "none", color: "#7A8494", fontSize: 13, fontWeight: 700, fontFamily: "inherit", marginBottom: 12, cursor: "pointer" }}
            >
              ← もどる
            </button>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 36 }}>{target.emoji}</span>
              <h2 style={{ fontWeight: 900, fontSize: 19, marginTop: 6 }}>
                {target.label} の PIN を入力
              </h2>
            </div>

            {/* 4ドット */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", margin: "20px 0" }}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: i < pin.length ? "#fff" : "#2A3340",
                    transition: "background .1s",
                  }}
                />
              ))}
            </div>

            {error && (
              <p style={{ textAlign: "center", color: "#E26D62", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                {error}
              </p>
            )}
            {loading && (
              <p style={{ textAlign: "center", color: "#7A8494", fontSize: 13, marginBottom: 12 }}>
                きりかえちゅう…
              </p>
            )}

            {/* テンキー */}
            {!loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 280, margin: "0 auto" }}>
                {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, idx) => (
                  k === "" ? (
                    <span key={idx} />
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleKey(k)}
                      style={{
                        height: 62,
                        borderRadius: 14,
                        border: "none",
                        background: "#1C2430",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: k === "del" ? 18 : 22,
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      {k === "del" ? "⌫" : k}
                    </button>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
