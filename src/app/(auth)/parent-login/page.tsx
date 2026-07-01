"use client";

import { useState } from "react";
import Link from "next/link";
import { childThemes } from "@/lib/theme/childTheme";
import { createClient } from "@/lib/supabase/client";
import { signInWithPasskey } from "@/lib/auth/passkey";

export default function ParentLoginPage() {
  const theme = childThemes.parent_dark;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    window.location.replace("/dashboard");
  }

  // /loginの子フローと同じ防御方針：認証後にrole==='parent'を確認し、
  // 一致しなければサインアウトしてエラーにする
  async function handlePasskeySignIn() {
    setSubmitting(true);
    setError(null);
    const { data, error: signInError } = await signInWithPasskey();
    if (signInError || !data?.user) {
      setSubmitting(false);
      setError(signInError?.message ?? "サインインできませんでした");
      return;
    }

    const supabase = createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    setSubmitting(false);

    if (profileError || !profile || profile.role !== "parent") {
      await supabase.auth.signOut();
      setError("おやのパスキーではありません");
      return;
    }

    window.location.replace("/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: theme.fontFamily,
        color: theme.ink,
      }}
    >
      <Link
        href="/login"
        style={{ fontSize: 12, color: theme.sub, marginBottom: 12, alignSelf: "flex-start", maxWidth: 320, width: "100%" }}
      >
        ← だれですか？にもどる
      </Link>
      <h1 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>おや ログイン</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 320,
          background: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <label style={{ fontSize: 12, color: theme.sub }}>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <label style={{ fontSize: 12, color: theme.sub }}>
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        {error && <p style={{ color: "#E26D62", fontSize: 12 }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 8,
            background: theme.accent,
            color: "#fff",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 14,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "ログイン中…" : "ログイン"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
          <span style={{ flex: 1, height: 1, background: "#3A424C" }} />
          <span style={{ fontSize: 11, color: theme.sub }}>または</span>
          <span style={{ flex: 1, height: 1, background: "#3A424C" }} />
        </div>

        <button
          type="button"
          onClick={handlePasskeySignIn}
          disabled={submitting}
          style={{
            background: "transparent",
            border: `1px solid ${theme.accent}`,
            color: theme.accent,
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 14,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          パスキーでログイン
        </button>
      </form>
    </main>
  );
}
