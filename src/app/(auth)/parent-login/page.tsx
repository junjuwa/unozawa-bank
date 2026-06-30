"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { childThemes } from "@/lib/theme/childTheme";
import { createClient } from "@/lib/supabase/client";

export default function ParentLoginPage() {
  const router = useRouter();
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
    router.push("/dashboard");
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
      </form>
    </main>
  );
}
