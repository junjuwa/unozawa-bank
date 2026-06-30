"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { useMockAvatars } from "@/lib/mock/MockAvatarsContext";
import { useMockMascot } from "@/lib/mock/MockMascotContext";
import { THEME_LABELS, ThemeKey } from "@/lib/theme/themes";
import { createClient } from "@/lib/supabase/client";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const CHILDREN = ["rei_blue", "jun_red"] as const;

type ChildProfile = { id: string; theme_key: ThemeKey; display_name: string; avatar_url: string | null; mascot_url: string | null };

function useChildProfiles() {
  const [profiles, setProfiles] = useState<ChildProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setProfiles(null); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, theme_key, display_name, avatar_url, mascot_url")
      .eq("role", "child");
    setProfiles((data as ChildProfile[]) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { profiles, loading, refetch };
}

export default function AvatarsPage() {
  const theme = childThemes.parent_dark;
  const { avatars, setAvatar, clearAvatar } = useMockAvatars();
  const { mascots, setMascotImage, clearMascotImage } = useMockMascot();
  const { profiles, loading: profilesLoading, refetch } = useChildProfiles();
  const isReal = profiles !== null;
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mascotInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (profilesLoading) return <LoadingScreen />;

  function readAsDataUrl(file: File, onDone: (dataUrl: string) => void) {
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onDone(reader.result); };
    reader.readAsDataURL(file);
  }

  async function saveToProfile(profileId: string, patch: { avatar_url?: string | null; mascot_url?: string | null }) {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update(patch).eq("id", profileId);
    if (error) {
      setSaveMessage({ ok: false, text: `ほぞんに しっぱいしました: ${error.message}` });
    } else {
      setSaveMessage({ ok: true, text: "ほぞんしました！" });
      refetch();
    }
  }

  async function handleFileChange(key: "rei_blue" | "jun_red", file: File | null) {
    if (!file) return;
    readAsDataUrl(file, async (dataUrl) => {
      setAvatar(key, dataUrl);
      if (isReal) {
        const child = profiles!.find((c) => c.theme_key === key);
        if (child) await saveToProfile(child.id, { avatar_url: dataUrl });
      }
    });
  }

  async function handleMascotFileChange(key: "rei_blue" | "jun_red", file: File | null) {
    if (!file) return;
    readAsDataUrl(file, async (dataUrl) => {
      setMascotImage(key, dataUrl);
      if (isReal) {
        const child = profiles!.find((c) => c.theme_key === key);
        if (child) await saveToProfile(child.id, { mascot_url: dataUrl });
      }
    });
  }

  async function handleClearAvatar(key: "rei_blue" | "jun_red") {
    clearAvatar(key);
    if (isReal) {
      const child = profiles!.find((c) => c.theme_key === key);
      if (child) await saveToProfile(child.id, { avatar_url: null });
    }
  }

  async function handleClearMascot(key: "rei_blue" | "jun_red") {
    clearMascotImage(key);
    if (isReal) {
      const child = profiles!.find((c) => c.theme_key === key);
      if (child) await saveToProfile(child.id, { mascot_url: null });
    }
  }

  function currentAvatarUrl(key: "rei_blue" | "jun_red"): string | null {
    if (isReal) return profiles!.find((c) => c.theme_key === key)?.avatar_url ?? null;
    return avatars[key] ?? null;
  }

  function currentMascotUrl(key: "rei_blue" | "jun_red"): string | null {
    if (isReal) return profiles!.find((c) => c.theme_key === key)?.mascot_url ?? null;
    return mascots[key] ?? null;
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <p style={{ fontSize: 12, color: theme.sub }}>
        子供のアイコン画像をアップロードできます（実在キャラクターの画像は使用しないでください）。
        {isReal && <span style={{ color: "#3DB66E", marginLeft: 4 }}>✓ 実DBに保存されます</span>}
      </p>
      {saveMessage && (
        <p style={{ fontSize: 12, color: saveMessage.ok ? "#3DB66E" : "#E26D62", fontWeight: 700 }}>
          {saveMessage.text}
        </p>
      )}

      {CHILDREN.map((key) => {
        const avatarUrl = currentAvatarUrl(key);
        return (
          <section
            key={key}
            style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16, display: "flex", alignItems: "center", gap: 16 }}
          >
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                THEME_LABELS[key].split("（")[0].slice(0, 1)
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: theme.ink, marginBottom: 8 }}>{THEME_LABELS[key].split("（")[0]}</div>
              <input ref={(el) => { inputRefs.current[key] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileChange(key, e.target.files?.[0] ?? null)} />
              <div className="flex gap-2">
                <button type="button" onClick={() => inputRefs.current[key]?.click()} style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: theme.accent, borderRadius: 14, padding: "6px 12px" }}>画像をえらぶ</button>
                {avatarUrl && <button type="button" onClick={() => handleClearAvatar(key)} style={{ fontSize: 12, fontWeight: 700, color: "#E26D62", border: "1px solid #E26D62", borderRadius: 14, padding: "6px 12px" }}>けす</button>}
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
            style={{ background: theme.cardBg, borderRadius: theme.cardRadius, border: theme.cardBorder, padding: 16, display: "flex", alignItems: "center", gap: 16 }}
          >
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: childThemes[key].accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
              {mascotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mascotUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : "🖼"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: theme.ink, marginBottom: 8 }}>{THEME_LABELS[key].split("（")[0]} の マスコット</div>
              <input ref={(el) => { mascotInputRefs.current[key] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleMascotFileChange(key, e.target.files?.[0] ?? null)} />
              <div className="flex gap-2">
                <button type="button" onClick={() => mascotInputRefs.current[key]?.click()} style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: childThemes[key].accent, borderRadius: 14, padding: "6px 12px" }}>画像をえらぶ</button>
                {mascotUrl && <button type="button" onClick={() => handleClearMascot(key)} style={{ fontSize: 12, fontWeight: 700, color: "#E26D62", border: "1px solid #E26D62", borderRadius: 14, padding: "6px 12px" }}>けす</button>}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
