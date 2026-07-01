"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SwitchUser = {
  profileId: string;
  label: string;
  avatarUrl?: string | null;
  destinationPath: string;
  hasPin: boolean;
};

type Props = {
  currentProfileId: string | null;
  users: SwitchUser[];
  onClose: () => void;
};

function AvatarCircle({ name, avatarUrl, size = 52 }: { name: string; avatarUrl?: string | null; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#2A3340",
        border: "2.5px solid #3A424C",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: size * 0.38,
        color: "#fff",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        name.slice(0, 1)
      )}
    </div>
  );
}

export function UserSwitchModal({ currentProfileId, users, onClose }: Props) {
  const [target, setTarget] = useState<SwitchUser | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const candidates = users.filter((u) => u.profileId !== currentProfileId);

  async function handleSwitchWith(p: string) {
    if (!target) return;
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/switch-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId: target.profileId, pin: p }),
    });
    const json = await res.json() as { token_hash?: string; error?: string };

    if (!res.ok || !json.token_hash) {
      setLoading(false);
      if (json.error === "wrong pin") setError("PINが ちがいます");
      else if (json.error === "target has no pin") setError("このひとは まだ PINが ないよ");
      else setError("きりかえ できませんでした");
      setPin("");
      return;
    }

    // 切り替え先のPIN検証済みフラグをセット → 新画面でPinGateがスキップする
    sessionStorage.setItem(`pin_verified_${target.profileId}`, "1");

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

  function handleKey(k: string) {
    if (loading) return;
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => handleSwitchWith(next), 120);
    }
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
        background: "rgba(10,20,40,.6)",
        backdropFilter: "blur(6px)",
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
          padding: "24px 24px 48px",
          fontFamily: "'Zen Maru Gothic', system-ui, sans-serif",
          color: "#fff",
        }}
      >
        {!target ? (
          <>
            <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>だれに きりかえる？</h2>
            <p style={{ fontSize: 12, color: "#7A8494", marginBottom: 20 }}>PINで 本人かくにん してきりかえるよ</p>
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
                    padding: "12px 16px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <AvatarCircle name={u.label} avatarUrl={u.avatarUrl} size={48} />
                  <span style={{ flex: 1 }}>{u.label}</span>
                  {!u.hasPin && (
                    <span style={{ fontSize: 11, color: "#9AA3B0", fontWeight: 600 }}>PINなし</span>
                  )}
                  <span style={{ color: "#4A5568", fontSize: 18 }}>›</span>
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
          <>
            <button
              type="button"
              onClick={() => { setTarget(null); setPin(""); setError(null); }}
              style={{ background: "none", border: "none", color: "#7A8494", fontSize: 13, fontWeight: 700, fontFamily: "inherit", marginBottom: 16, cursor: "pointer" }}
            >
              ← もどる
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 6 }}>
              <AvatarCircle name={target.label} avatarUrl={target.avatarUrl} size={64} />
              <h2 style={{ fontWeight: 900, fontSize: 18, marginTop: 10 }}>{target.label} の PIN</h2>
            </div>

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
              <p style={{ textAlign: "center", color: "#E26D62", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                {error}
              </p>
            )}
            {loading && (
              <p style={{ textAlign: "center", color: "#7A8494", fontSize: 13, marginBottom: 10 }}>
                きりかえちゅう…
              </p>
            )}

            {!loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 280, margin: "0 auto" }}>
                {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, idx) =>
                  k === "" ? <span key={idx} /> : (
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
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
