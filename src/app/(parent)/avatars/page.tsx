"use client";

import { useRef, useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockAvatars } from "@/lib/mock/MockAvatarsContext";
import { useMockMascot } from "@/lib/mock/MockMascotContext";
import { useFamilyOverview } from "@/hooks/useFamilyOverview";
import { THEME_LABELS } from "@/lib/theme/themes";
import { createClient } from "@/lib/supabase/client";

const CHILDREN = ["rei_blue", "jun_red"] as const;

export default function AvatarsPage() {
  const theme = childThemes.parent_dark;
  const { avatars, setAvatar, clearAvatar } = useMockAvatars();
  const { mascots, setMascotImage, clearMascotImage } = useMockMascot();
  const { overview, refetch } = useFamilyOverview();
  const isReal = overview !== null;
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mascotInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function readAsDataUrl(file: File, onDone: (dataUrl: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onDone(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleFileChange(key: "rei_blue" | "jun_red", file: File | null) {
    if (!file) return;
    readAsDataUrl(file, async (dataUrl) => {
      if (isReal) {
        const child = overview.find((c) => c.themeKey === key);
        if (child) {
          const supabase = createClient();
          const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: dataUrl })
            .eq("id", child.profileId);
          if (error) {
            setSaveMessage("ほぞんに しっぱいしました");
          } else {
            setSaveMessage("ほぞんしました！");
            refetch();
          }
        }
      }
      setAvatar(key, dataUrl);
    });
  }

  async function handleMascotFileChange(key: "rei_blue" | "jun_red", file: File | null) {
    if (!file) return;
    readAsDataUrl(file, async (dataUrl) => {
      if (isReal) {
        const child = overview.find((c) => c.themeKey === key);
        if (child) {
          const supabase = createClient();
          const { error } = await supabase
            .from("profiles")
            .update({ mascot_url: dataUrl })
            .eq("id", child.profileId);
          if (error) {
            setSaveMessage("ほぞんに しっぱいしました");
          } else {
            setSaveMessage("ほぞんしました！");
            refetch();
          }
        }
      }
      setMascotImage(key, dataUrl);
    });
  }

  async function handleClearAvatar(key: "rei_blue" | "jun_red") {
    if (isReal) {
      const child = overview.find((c) => c.themeKey === key);
      if (child) {
        const supabase = createClient();
        await supabase.from("profiles").update({ avatar_url: null }).eq("id", child.profileId);
        refetch();
      }
    }
    clearAvatar(key);
  }

  async function handleClearMascot(key: "rei_blue" | "jun_red") {
    if (isReal) {
      const child = overview.find((c) => c.themeKey === key);
      if (child) {
        const supabase = createClient();
        await supabase.from("profiles").update({ mascot_url: null }).eq("id", child.profileId);
        refetch();
      }
    }
    clearMascotImage(key);
  }

  // 実モードではDBのavatar_urlを優先表示
  function currentAvatarUrl(key: "rei_blue" | "jun_red"): string | null {
    if (isReal) {
      const child = overview.find((c) => c.themeKey === key);
      if (child && (child as { avatarUrl?: string | null }).avatarUrl) {
        return (child as { avatarUrl?: string | null }).avatarUrl!;
      }
    }
    return avatars[key] ?? null;
  }

  function currentMascotUrl(key: "rei_blue" | "jun_red"): string | null {
    if (isReal) {
      const child = overview.find((c) => c.themeKey === key);
      if (child && (child as { mascotUrl?: string | null }).mascotUrl) {
        return (child as { mascotUrl?: string | null }).mascotUrl!;
      }
    }
    return mascots[key] ?? null;
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <p style={{ fontSize: 12, color: theme.sub }}>
        子供のアイコン画像をアップロードできます（実在キャラクターの画像は使用しないでください）。
        {isReal && " ✓ 実DBに保存されます"}
      </p>
      {saveMessage && (
        <p style={{ fontSize: 12, color: "#3DB66E", fontWeight: 700 }}>{saveMessage}</p>
      )}
      {CHILDREN.map((key) => {
        const avatarUrl = currentAvatarUrl(key);
        return (
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
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL表示のため
                <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                THEME_LABELS[key].split("（")[0].slice(0, 1)
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: theme.ink, marginBottom: 8 }}>
                {THEME_LABELS[key].split("（")[0]}
              </div>
              <input
                ref={(el) => { inputRefs.current[key] = el; }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRefs.current[key]?.click()}
                  style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: theme.accent, borderRadius: 14, padding: "6px 12px" }}
                >
                  画像をえらぶ
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleClearAvatar(key)}
                    style={{ fontSize: 12, fontWeight: 700, color: "#E26D62", border: "1px solid #E26D62", borderRadius: 14, padding: "6px 12px" }}
                  >
                    けす
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <p style={{ fontSize: 12, color: theme.sub, marginTop: 8 }}>
        ホーム画面のマスコット画像も変更できます（スティッチ・スパイダーマンなどの実在キャラクター画像は著作権の都合上こちらでは作成できないため、ご家庭で用意した画像をアップロードしてください）。
      </p>
      {CHILDREN.map((key) => {
        const mascotUrl = currentMascotUrl(key);
        return (
          <section
            key={`mascot-${key}`}
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
                background: childThemes[key].accent,
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
              {mascotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL表示のため
                <img src={mascotUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                "🖼"
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: theme.ink, marginBottom: 8 }}>
                {THEME_LABELS[key].split("（")[0]} の マスコット
              </div>
              <input
                ref={(el) => { mascotInputRefs.current[key] = el; }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleMascotFileChange(key, e.target.files?.[0] ?? null)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => mascotInputRefs.current[key]?.click()}
                  style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: childThemes[key].accent, borderRadius: 14, padding: "6px 12px" }}
                >
                  画像をえらぶ
                </button>
                {mascotUrl && (
                  <button
                    type="button"
                    onClick={() => handleClearMascot(key)}
                    style={{ fontSize: 12, fontWeight: 700, color: "#E26D62", border: "1px solid #E26D62", borderRadius: 14, padding: "6px 12px" }}
                  >
                    けす
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
