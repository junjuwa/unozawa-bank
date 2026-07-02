// ② GrowHintBanner — ふやす画面 最上部のヒント帯。新規作成。純粋レンダリング（"use client" 不要）。
import type { ChildTheme } from "@/lib/theme/childTheme";

export function GrowHintBanner({ theme }: { theme: ChildTheme }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "#E7F6EC",
      border: `${theme.cardBorder && theme.cardBorder !== "none" ? "2px solid #111" : "1.5px solid rgba(27,158,90,.4)"}`,
      borderRadius: 14,
      boxShadow: theme.cardBorder && theme.cardBorder !== "none" ? "3px 3px 0 #111" : "none",
      padding: "12px 14px",
      fontFamily: theme.fontFamily,
    }}>
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }} role="img" aria-label="ヒント">💡</span>
      <p style={{
        margin: 0,
        font: `700 12px ${theme.fontFamily}`,
        color: theme.ink,
        lineHeight: 1.7,
      }}>
        ふやす に あずけると 30日後に すこし おかねが ふえて もどってくるよ！
      </p>
    </div>
  );
}
