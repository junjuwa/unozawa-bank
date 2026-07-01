"use client";

import { useState } from "react";
import Link from "next/link";
import { childThemes } from "@/lib/theme/childTheme";
import { useFamilySettings } from "@/hooks/useFamilySettings";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function PromisesSettingsPage() {
  const theme = childThemes.parent_dark;
  const { settings: familySettings, loading: settingsLoading, updateFamilySettings } = useFamilySettings();
  const isReal = familySettings !== null;

  const [newPromise, setNewPromise] = useState("");

  if (settingsLoading) return <LoadingScreen />;

  function handleAddPromise() {
    if (!isReal || !newPromise.trim()) return;
    updateFamilySettings({ promises: [...familySettings.promises, newPromise.trim()] });
    setNewPromise("");
  }

  function handleRemovePromise(index: number) {
    if (!isReal) return;
    updateFamilySettings({ promises: familySettings.promises.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Link
        href="/settings"
        style={{ fontSize: 13, color: theme.accent, fontWeight: 700, display: "inline-block", marginBottom: 4 }}
      >
        ← もどる
      </Link>

      <section
        style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16 }}
      >
        <h2 style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>やくそく</h2>
        <p style={{ fontSize: 11, color: theme.sub, marginBottom: 8 }}>
          子供画面の「やくそく」に追加で表示されます（ひらがな推奨）
        </p>
        {!isReal ? (
          <p style={{ fontSize: 13, color: theme.sub }}>実機でのみ使えます</p>
        ) : (
          <>
            {familySettings.promises.map((promise, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: "1px solid #3A424C",
                }}
              >
                <span style={{ flex: 1, fontSize: 13, color: theme.ink }}>{promise}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePromise(i)}
                  aria-label="削除"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#E26D62",
                    border: "1px solid #E26D62",
                    borderRadius: 14,
                    padding: "6px 10px",
                  }}
                >
                  削除
                </button>
              </div>
            ))}
            <div className="flex gap-2" style={{ marginTop: 10 }}>
              <input
                type="text"
                placeholder="あたらしい やくそく"
                value={newPromise}
                onChange={(e) => setNewPromise(e.target.value)}
                style={{
                  flex: 1,
                  background: theme.frameBg,
                  color: theme.ink,
                  border: "1px solid #3A424C",
                  borderRadius: 8,
                  padding: "8px 10px",
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={handleAddPromise}
                style={{
                  background: theme.accent,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                追加
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
