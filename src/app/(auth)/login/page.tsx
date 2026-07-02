"use client";

// 認証フロー:
//  phase "passkey" → signInWithPasskey()（デバイス解錠のみ・ユーザ識別しない）
//  phase "select"  → 家族メンバーを一覧表示
//  phase "pin"     → PIN入力 → 一致したらそのユーザのセッションへ切り替え

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInWithPasskey } from "@/lib/auth/passkey";

type Member = {
  id: string;
  display_name: string;
  role: string;
  theme_key: string | null;
  avatar_url: string | null;
  has_pin: boolean;
};

// localStorageキャッシュ（https URLのみ）
function getCachedAvatar(themeKey: string): string | null {
  try {
    const v = localStorage.getItem(`login_avatar_${themeKey}`);
    if (v?.startsWith("data:")) { localStorage.removeItem(`login_avatar_${themeKey}`); return null; }
    return v || null;
  } catch { return null; }
}

// テーマカラー
const THEME_BG: Record<string, string> = {
  rei_blue: "#4BA3D9",
  jun_red:  "#E24A4A",
  parent_dark: "#3D4D5C",
};

function Avatar({ member, size = 64 }: { member: Member; size?: number }) {
  const avatarUrl = member.avatar_url ?? (member.theme_key ? getCachedAvatar(member.theme_key) : null);
  const bg = THEME_BG[member.theme_key ?? "parent_dark"] ?? "#3D4D5C";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: size * 0.4, color: "#fff", fontFamily: "'Zen Maru Gothic', system-ui" }}>
      {avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (member.display_name ?? "?").slice(0, 1)}
    </div>
  );
}

export default function LoginPage() {
  const [phase, setPhase] = useState<"passkey" | "select" | "pin">("passkey");
  const [members, setMembers] = useState<Member[]>([]);
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── フェーズ1: パスキーでデバイス解錠 ──────────────────────────
  async function handlePasskey() {
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await signInWithPasskey();
    if (signInError || !data?.user) {
      setLoading(false);
      setError(signInError?.message ?? "にんしょうできませんでした");
      return;
    }
    setAuthedUserId(data.user.id);

    // 家族メンバー一覧を取得
    const supabase = createClient();
    const { data: memberData, error: rpcErr } = await supabase.rpc("get_family_members");
    setLoading(false);
    if (rpcErr || !memberData?.length) {
      setError("メンバーのとりこみに しっぱいしました");
      return;
    }
    const list: Member[] = memberData.map((r: Record<string, unknown>) => ({
      id:           r.m_id as string,
      display_name: (r.m_display_name as string) ?? "",
      role:         r.m_role as string,
      theme_key:    r.m_theme_key as string | null,
      avatar_url:   r.m_avatar_url as string | null,
      has_pin:      r.m_has_pin as boolean,
    }));
    setMembers(list);
    setPhase("select");
  }

  // ── フェーズ2: ユーザ選択 ────────────────────────────────────
  function handleSelect(member: Member) {
    setSelected(member);
    setPin("");
    setError(null);
    setPhase("pin");
  }

  // ── フェーズ3: PIN入力 ───────────────────────────────────────
  async function handlePin(p: string) {
    if (!selected) return;
    setLoading(true);
    setError(null);

    // パスキーで認証済みのユーザと同一 → switch-user API でも問題ないが直遷移も可
    const isSameUser = selected.id === authedUserId;

    const res = await fetch("/api/auth/switch-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId: selected.id, pin: p }),
    });
    const json = await res.json() as { token_hash?: string; error?: string };

    if (!res.ok || !json.token_hash) {
      setLoading(false);
      if (json.error === "wrong pin")          setError("PINが ちがいます");
      else if (json.error === "target has no pin") setError("このひとは まだ PINが ないよ");
      else                                     setError("にんしょうに しっぱいしました");
      setPin("");
      return;
    }

    // 切り替え先のPINゲートをスキップ
    sessionStorage.setItem(`pin_verified_${selected.id}`, "1");

    if (!isSameUser) {
      const supabase = createClient();
      await supabase.auth.signOut();
      await supabase.auth.verifyOtp({ token_hash: json.token_hash, type: "magiclink" });
    }

    const dest = selected.role === "parent" ? "/dashboard" : "/home";
    window.location.replace(dest);
  }

  function handleKey(k: string) {
    if (loading) return;
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) setTimeout(() => handlePin(next), 120);
  }

  // ── 画面 ─────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: 24, fontFamily: "'Zen Maru Gothic', system-ui", background: "#0D1117", color: "#fff" }}>
      <img src="/brand/logo-lockup-dark.svg" alt="UNOZAWA BANK" style={{ height: 44, width: "auto" }} />

      {/* ── フェーズ1: パスキー ── */}
      {phase === "passkey" && (
        <>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#9AA3B0", textAlign: "center" }}>
            はじめに にんしょうして ください
          </p>
          <button
            type="button"
            onClick={handlePasskey}
            disabled={loading}
            style={{ width: "100%", maxWidth: 280, height: 64, borderRadius: 20, border: "none", background: loading ? "#2A3340" : "#4BA3D9", color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: "inherit", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 8px 24px rgba(75,163,217,.4)" }}
          >
            {loading ? "にんしょうちゅう…" : <><span style={{ fontSize: 26 }}>🔑</span> にんしょうする</>}
          </button>
          {error && <p style={{ fontSize: 13, color: "#E26D62", fontWeight: 700 }}>{error}</p>}
        </>
      )}

      {/* ── フェーズ2: ユーザ選択 ── */}
      {phase === "select" && (
        <>
          <p style={{ fontSize: 16, fontWeight: 900 }}>だれですか？</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m)}
                style={{ display: "flex", alignItems: "center", gap: 14, background: "#1C2430", border: "1.5px solid #2A3340", borderRadius: 20, padding: "14px 18px", color: "#fff", fontWeight: 700, fontSize: 17, fontFamily: "inherit", cursor: "pointer" }}
              >
                <Avatar member={m} size={52} />
                <span style={{ flex: 1, textAlign: "left" }}>{m.display_name}</span>
                {!m.has_pin && <span style={{ fontSize: 11, color: "#9AA3B0" }}>PINなし</span>}
                <span style={{ color: "#4A5568", fontSize: 20 }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── フェーズ3: PIN ── */}
      {phase === "pin" && selected && (
        <>
          <button type="button" onClick={() => { setPhase("select"); setError(null); }} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#7A8494", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            ← もどる
          </button>
          <Avatar member={selected} size={72} />
          <p style={{ fontWeight: 900, fontSize: 18, marginTop: -8 }}>{selected.display_name} の PIN</p>

          <div style={{ display: "flex", gap: 18 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pin.length ? "#fff" : "#2A3340", transition: "background .1s", display: "block" }} />
            ))}
          </div>

          {error && <p style={{ fontSize: 13, color: "#E26D62", fontWeight: 700 }}>{error}</p>}
          {loading && <p style={{ fontSize: 13, color: "#7A8494" }}>にんしょうちゅう…</p>}

          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: 280 }}>
              {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) =>
                k === "" ? <span key={i} /> : (
                  <button key={i} type="button" onClick={() => handleKey(k)}
                    style={{ height: 64, borderRadius: 14, border: "none", background: "#1C2430", color: "#fff", fontWeight: 900, fontSize: k === "del" ? 18 : 24, fontFamily: "inherit", cursor: "pointer" }}>
                    {k === "del" ? "⌫" : k}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
