"use client";

// design.md §5: パスキー登録は「ログイン済み」が前提のため、初回だけ親が橋渡しする。
// ①子アカウント作成(/api/admin/create-child) ②一時サインイン(verifyOtp)
// ③パスキー登録(registerPasskey) ④サインアウトして親に戻す、を実際に行う。
import { useState } from "react";
import { useRouter } from "next/navigation";
import { childThemes, ChildTheme } from "@/lib/theme/childTheme";
import { THEME_LABELS, ThemeKey } from "@/lib/theme/themes";
import { SetupStepCard } from "@/components/parent/SetupStepCard";
import { createClient } from "@/lib/supabase/client";
import { registerPasskey } from "@/lib/auth/passkey";

const STEPS = [
  { title: "子アカウントを作成", description: "管理画面から子のアカウントを作成します（パスワードなし）" },
  { title: "子の端末で一時サインイン", description: "親が子の端末で一時的にその子としてサインインします" },
  { title: "パスキーを登録", description: "その場でTouch ID / Face IDなどのパスキーを端末に登録します" },
  { title: "以後はパスキーのみでログイン", description: "次回からは子が自分でパスキーだけでログインできます" },
];

type ChildThemeKey = "rei_blue" | "jun_red";

export default function SetupPage() {
  const theme = childThemes.parent_dark;
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [displayName, setDisplayName] = useState("れい");
  const [themeKey, setThemeKey] = useState<ChildThemeKey>("rei_blue");
  const [hashedToken, setHashedToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateChild() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/create-child", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, themeKey }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "子アカウントの作成に失敗しました");
      return;
    }
    setHashedToken(data.hashedToken);
    setCurrent(1);
  }

  async function handleTempSignIn() {
    if (!hashedToken) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: hashedToken,
      type: "email",
    });
    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    setCurrent(2);
  }

  async function handleRegisterPasskey() {
    setSubmitting(true);
    setError(null);
    const { error: passkeyError } = await registerPasskey();
    setSubmitting(false);
    if (passkeyError) {
      setError(passkeyError.message);
      return;
    }
    setCurrent(3);
  }

  async function handleFinish() {
    setSubmitting(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setSubmitting(false);
    router.push("/parent-login");
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 style={{ fontWeight: 800, fontSize: 18, color: theme.ink }}>はじめての せってい</h1>
      <p style={{ fontSize: 12, color: theme.sub }}>
        子のパスキー登録は、初回だけ親が橋渡しします。
        アカウントが既にある場合は下の「パスキーを追加」から。
      </p>
      <AddPasskeySection theme={theme} />

      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <SetupStepCard
            key={step.title}
            theme={theme}
            step={i + 1}
            title={step.title}
            description={step.description}
            state={i < current ? "done" : i === current ? "current" : "upcoming"}
          />
        ))}
      </div>

      {current === 0 && (
        <ChildCreateForm
          theme={theme}
          displayName={displayName}
          themeKey={themeKey}
          onDisplayNameChange={setDisplayName}
          onThemeKeyChange={setThemeKey}
        />
      )}

      {error && <p style={{ color: "#E26D62", fontSize: 13 }}>{error}</p>}

      {current === 3 ? (
        <div
          style={{
            background: theme.cardBg,
            borderRadius: theme.cardRadius,
            border: theme.cardBorder,
            padding: 16,
            textAlign: "center",
            color: "#3DB66E",
            fontWeight: 700,
          }}
        >
          かんりょう！子どもはパスキーだけでログインできるようになりました。
        </div>
      ) : null}

      <button
        type="button"
        disabled={submitting}
        onClick={
          current === 0
            ? handleCreateChild
            : current === 1
              ? handleTempSignIn
              : current === 2
                ? handleRegisterPasskey
                : handleFinish
        }
        style={{
          background: theme.accent,
          color: "#fff",
          borderRadius: theme.cardRadius,
          padding: 14,
          fontWeight: 800,
          fontSize: 14,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting
          ? "しょりちゅう…"
          : current === 0
            ? "子アカウントを作成"
            : current === 1
              ? "一時サインイン"
              : current === 2
                ? "パスキーを登録"
                : "おやログインへ もどる"}
      </button>
    </div>
  );
}

// 既存アカウントへのパスキー追加セクション
function AddPasskeySection({ theme }: { theme: ChildTheme }) {
  const [addThemeKey, setAddThemeKey] = useState<"rei_blue" | "jun_red">("rei_blue");
  const [addStep, setAddStep] = useState<"idle" | "signingIn" | "registering" | "done">("idle");
  const [addError, setAddError] = useState<string | null>(null);
  const [hashedToken, setHashedToken] = useState<string | null>(null);

  async function handleGetLink() {
    setAddError(null);
    setAddStep("signingIn");
    const res = await fetch("/api/admin/child-passkey-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeKey: addThemeKey }),
    });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error); setAddStep("idle"); return; }
    setHashedToken(data.hashedToken);
  }

  async function handleTempSignIn() {
    if (!hashedToken) return;
    setAddError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: hashedToken, type: "email" });
    if (error) { setAddError(error.message); setAddStep("idle"); return; }
    setAddStep("registering");
  }

  async function handleRegister() {
    setAddError(null);
    const { error } = await registerPasskey();
    if (error) { setAddError(error.message); return; }
    setAddStep("done");
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <div style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontWeight: 800, fontSize: 14, color: theme.ink }}>既存アカウントにパスキーを追加</p>
      {addStep === "done" ? (
        <p style={{ color: "#3DB66E", fontWeight: 700, fontSize: 13 }}>
          登録完了！親ログインへ戻ってください。
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            {(["rei_blue", "jun_red"] as const).map((key) => (
              <button key={key} type="button" onClick={() => setAddThemeKey(key)}
                style={{ flex: 1, borderRadius: 12, padding: "7px 0", fontSize: 13, fontWeight: 700,
                  background: addThemeKey === key ? theme.accent : "transparent",
                  color: addThemeKey === key ? "#fff" : theme.sub,
                  border: `1px solid ${addThemeKey === key ? theme.accent : "#3A424C"}` }}>
                {THEME_LABELS[key].split("（")[0]}
              </button>
            ))}
          </div>
          {addStep === "idle" && (
            <button type="button" onClick={handleGetLink}
              style={{ background: theme.accent, color: "#fff", borderRadius: 12, padding: "10px 0", fontWeight: 800, fontSize: 13 }}>
              子の端末で → 一時サインインを準備
            </button>
          )}
          {addStep === "signingIn" && hashedToken && (
            <button type="button" onClick={handleTempSignIn}
              style={{ background: theme.accent, color: "#fff", borderRadius: 12, padding: "10px 0", fontWeight: 800, fontSize: 13 }}>
              一時サインイン（子の端末でタップ）
            </button>
          )}
          {addStep === "signingIn" && !hashedToken && (
            <p style={{ fontSize: 12, color: theme.sub }}>リンク取得中…</p>
          )}
          {addStep === "registering" && (
            <button type="button" onClick={handleRegister}
              style={{ background: "#3DB66E", color: "#fff", borderRadius: 12, padding: "10px 0", fontWeight: 800, fontSize: 13 }}>
              パスキーを登録（子の端末でタップ）
            </button>
          )}
          {addError && <p style={{ color: "#E26D62", fontSize: 12 }}>{addError}</p>}
        </>
      )}
    </div>
  );
}

function ChildCreateForm({
  theme,
  displayName,
  themeKey,
  onDisplayNameChange,
  onThemeKeyChange,
}: {
  theme: ChildTheme;
  displayName: string;
  themeKey: ThemeKey;
  onDisplayNameChange: (v: string) => void;
  onThemeKeyChange: (v: "rei_blue" | "jun_red") => void;
}) {
  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <label style={{ fontSize: 12, color: theme.sub }}>
        名前
        <input
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            background: theme.frameBg,
            color: theme.ink,
            border: "1px solid #3A424C",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 14,
          }}
        />
      </label>
      <div className="flex gap-2">
        {(["rei_blue", "jun_red"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onThemeKeyChange(key)}
            style={{
              flex: 1,
              borderRadius: 14,
              padding: "8px 0",
              fontSize: 13,
              fontWeight: 700,
              background: themeKey === key ? theme.accent : "transparent",
              color: themeKey === key ? "#fff" : theme.sub,
              border: `1px solid ${themeKey === key ? theme.accent : "#3A424C"}`,
            }}
          >
            {THEME_LABELS[key].split("（")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
