"use client";

import { useRef } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockAvatars } from "@/lib/mock/MockAvatarsContext";
import { THEME_LABELS } from "@/lib/theme/themes";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function AvatarsPage() {
  const theme = childThemes.parent_dark;
  const { avatars, setAvatar, clearAvatar } = useMockAvatars();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFileChange(theme: "rei_blue" | "jun_red", file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatar(theme, reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <p style={{ fontSize: 12, color: theme.sub }}>
        子供のアイコン画像をアップロードできます（実在キャラクターの画像は使用しないでください）。
      </p>
      {CHILDREN.map((key) => (
        <section
          key={key}
          style={{
            background: theme.cardBg,
            borderRadius: theme.cardRadius,
            border: theme.cardBorder,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 24,
              color: "#fff",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {avatars[key] ? (
              // eslint-disable-next-line @next/next/no-img-element -- モックのdata URL表示のため
              <img src={avatars[key]!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              THEME_LABELS[key].split("（")[0].slice(0, 1)
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: theme.ink, marginBottom: 8 }}>
              {THEME_LABELS[key].split("（")[0]}
            </div>
            <input
              ref={(el) => {
                inputRefs.current[key] = el;
              }}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRefs.current[key]?.click()}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: theme.accent,
                  borderRadius: 14,
                  padding: "6px 12px",
                }}
              >
                画像をえらぶ
              </button>
              {avatars[key] && (
                <button
                  type="button"
                  onClick={() => clearAvatar(key)}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#E26D62",
                    border: "1px solid #E26D62",
                    borderRadius: 14,
                    padding: "6px 12px",
                  }}
                >
                  けす
                </button>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
