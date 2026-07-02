"use client";

// 認証フロー:
//  phase "passkey" → signInWithPasskey()（デバイス解錠のみ・ユーザ識別しない）
//  phase "select"  → 家族メンバーを一覧表示
//  phase "pin"     → PIN入力 → 一致したらそのユーザのセッションへ切り替え

import "@/styles/auth.css";
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

// テーマ→au-* スタイル設定
const THEME_CONFIG: Record<string, { accent: string; avatarBg: string; role: string }> = {
  rei_blue:    { accent: "#FF7E6B", avatarBg: "#FFE3DC", role: "こども" },
  jun_red:     { accent: "#E2231A", avatarBg: "#FFE0DD", role: "こども" },
  parent_dark: { accent: "#2F353E", avatarBg: "",        role: "かんり（ほごしゃ）" },
};

// ユーザ人物アイコン SVG
function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.6"/>
      <path d="M5 20 a7 7 0 0 1 14 0"/>
    </svg>
  );
}

function MemberAvatar({ member }: { member: Member }) {
  const cfg = THEME_CONFIG[member.theme_key ?? "parent_dark"] ?? THEME_CONFIG.parent_dark;
  const avatarUrl = member.avatar_url ?? (member.theme_key ? getCachedAvatar(member.theme_key) : null);
  const isParent = member.role === "parent";

  if (isParent) {
    return (
      <span className="au-avatar au-avatar--parent">
        <PersonIcon color="#fff" />
      </span>
    );
  }

  return (
    <span className="au-avatar" style={{ ["--au-avatar-bg" as string]: cfg.avatarBg }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={member.display_name} />
      ) : (
        <PersonIcon color={cfg.accent} />
      )}
    </span>
  );
}

// PIN画面のアバター（大きめ）
function PinAvatar({ member }: { member: Member }) {
  const cfg = THEME_CONFIG[member.theme_key ?? "parent_dark"] ?? THEME_CONFIG.parent_dark;
  const avatarUrl = member.avatar_url ?? (member.theme_key ? getCachedAvatar(member.theme_key) : null);
  const isParent = member.role === "parent";
  const size = 80;

  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: isParent ? "#2F353E" : cfg.avatarBg, border: "3px solid #fff", boxShadow: "0 6px 14px rgba(27,58,107,.2)", flexShrink: 0 }}>
      {avatarUrl && !isParent
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <PersonIcon color={isParent ? "#fff" : cfg.accent} />}
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

  // ── フェーズ3: PIN認証 ────────────────────────────────────────
  async function handlePin(p: string) {
    if (!selected) return;
    setLoading(true);
    setError(null);

    const isSameUser = selected.id === authedUserId;

    const res = await fetch("/api/auth/switch-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId: selected.id, pin: p }),
    });
    const json = await res.json() as { token_hash?: string; error?: string };

    if (!res.ok || !json.token_hash) {
      setLoading(false);
      if (json.error === "wrong pin")           setError("PINが ちがいます");
      else if (json.error === "target has no pin") setError("このひとは まだ PINが ないよ");
      else                                      setError("にんしょうに しっぱいしました");
      setPin("");
      return;
    }

    sessionStorage.setItem(`pin_verified_${selected.id}`, "1");

    if (!isSameUser) {
      const supabase = createClient();
      await supabase.auth.signOut();
      await supabase.auth.verifyOtp({ token_hash: json.token_hash, type: "magiclink" });
    }

    window.location.replace(selected.role === "parent" ? "/dashboard" : "/home");
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
    <div className="au-screen au-screen--flat">
      <div className="au-blob au-blob-1" />
      <div className="au-blob au-blob-2" />
      <div className="au-blob au-blob-3" />
      <div className="au-blob au-blob-4" />

      {/* ── フェーズ1: ログイン ── */}
      {phase === "passkey" && (
        <div className="au-inner">
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div className="au-logo">
              <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
                <rect x="19" y="13" width="26" height="16" rx="2.5" fill="#FFD86F"/>
                <circle cx="26" cy="21" r="4.3" fill="none" stroke="#1B3A6B" strokeWidth="1.6"/>
                <text x="26" y="23.4" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="6" fill="#1B3A6B">¥</text>
                <path d="M33 18 H41 M33 21 H41 M33 24 H38" stroke="#1B3A6B" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M13 20 a4 4 0 0 1 8 0 v13 q11 4.5 22 0 v-13 a4 4 0 0 1 8 0 v13 a15 15 0 0 1 -38 0 Z" fill="#F5B62E"/>
              </svg>
            </div>
            <div className="au-wordmark">UNOZAWA<small>BANK</small></div>
          </div>

          <div style={{ paddingBottom: 56 }}>
            <h1 className="au-title">ようこそ！</h1>
            <p className="au-lead"><ruby>指<rt>ゆび</rt></ruby>や おかおで ログインしよう。</p>
            <button
              className="au-btn"
              type="button"
              onClick={handlePasskey}
              disabled={loading}
              style={{ marginTop: 26, opacity: loading ? 0.7 : 1, cursor: loading ? "default" : "pointer" }}
            >
              {loading ? (
                "にんしょうちゅう…"
              ) : (
                <>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 11a3 3 0 0 0-3 3v3.5"/><path d="M12 11a3 3 0 0 1 3 3c0 1.2 0 2.4-.4 3.5"/>
                    <path d="M7 11a5 5 0 0 1 10 0c0 2-.3 3.8-.9 5.6"/><path d="M4.4 12a7.6 7.6 0 0 1 15.2 0c0 1.3-.1 2.6-.4 3.8"/>
                    <path d="M9.5 20c.6-1.4.9-2.9.9-4.5"/>
                  </svg>
                  ログインする
                </>
              )}
            </button>
            {error ? (
              <p style={{ fontFamily: "'Zen Maru Gothic',system-ui", fontWeight: 700, fontSize: 13, color: "#C0392B", textAlign: "center", marginTop: 12 }}>{error}</p>
            ) : (
              <p className="au-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                パスキーで あんぜんに ログイン
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── フェーズ2: ユーザ選択 ── */}
      {phase === "select" && (
        <div className="au-inner" style={{ justifyContent: "center" }}>
          <h1 className="au-title" style={{ marginBottom: 6 }}>だれが つかう？</h1>
          <p className="au-lead" style={{ marginBottom: 28 }}>じぶんの ボタンを えらんでね。</p>

          <div className="au-userlist">
            {members.map((m) => {
              const cfg = THEME_CONFIG[m.theme_key ?? "parent_dark"] ?? THEME_CONFIG.parent_dark;
              return (
                <button
                  key={m.id}
                  className="au-user"
                  type="button"
                  style={{ ["--au-accent" as string]: cfg.accent }}
                  onClick={() => handleSelect(m)}
                >
                  <MemberAvatar member={m} />
                  <span>
                    <span className="au-name">{m.display_name}</span>
                    <span className="au-role" style={{ display: "block" }}>
                      {cfg.role}{!m.has_pin && "・PINなし"}
                    </span>
                  </span>
                  <span className="au-chev">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="9,5 16,12 9,19 7,17 12,12 7,7"/></svg>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── フェーズ3: PIN ── */}
      {phase === "pin" && selected && (
        <div className="au-inner" style={{ justifyContent: "center", alignItems: "center", gap: 20, paddingTop: 40, paddingBottom: 40 }}>
          <button
            type="button"
            onClick={() => { setPhase("select"); setError(null); }}
            style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--au-sub)", fontFamily: "'Zen Maru Gothic',system-ui", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            ← もどる
          </button>

          <PinAvatar member={selected} />
          <p style={{ fontFamily: "'Zen Maru Gothic',system-ui", fontWeight: 900, fontSize: 18, color: "var(--au-ink)", margin: 0 }}>
            {selected.display_name} の PIN
          </p>

          {/* ドット */}
          <div style={{ display: "flex", gap: 18 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pin.length ? "var(--au-ink)" : "rgba(27,58,107,.18)", transition: "background .1s", display: "block" }} />
            ))}
          </div>

          {error && <p style={{ fontFamily: "'Zen Maru Gothic',system-ui", fontSize: 13, color: "#C0392B", fontWeight: 700, margin: 0 }}>{error}</p>}
          {loading && <p style={{ fontFamily: "'Zen Maru Gothic',system-ui", fontSize: 13, color: "var(--au-sub)", margin: 0 }}>にんしょうちゅう…</p>}

          {/* テンキー */}
          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: 280 }}>
              {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) =>
                k === "" ? <span key={i} /> : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleKey(k)}
                    style={{ height: 64, borderRadius: 16, border: "none", background: "#fff", color: "var(--au-ink)", fontFamily: "'Zen Maru Gothic',system-ui", fontWeight: 900, fontSize: k === "del" ? 18 : 24, cursor: "pointer", boxShadow: "0 4px 12px rgba(27,58,107,.12)" }}
                  >
                    {k === "del" ? "⌫" : k}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
