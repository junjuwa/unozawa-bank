"use client";

import { useState } from "react";

// Tutorial.html の6スライドをコンポーネント化。何度でも開ける。
const SLIDES = [
  {
    emoji: "🏦",
    title: "ようこそ！",
    body: "UNOZAWA BANKは じぶんの おかねを じょうずに つかう れんしゅうを するアプリだよ。",
  },
  {
    emoji: "📦",
    title: "3つの はこが あるよ",
    body: "「つかう」「ためる」「ふやす」。もらった おかねを 3つの はこで わけて かんがえよう。",
  },
  {
    emoji: "🎯",
    title: "ためると ゆめが かなう",
    body: "ほしい ものを きめて、おかねを あつめよう。バーが いっぱいに なったら たっせい！",
  },
  {
    emoji: "📈",
    title: "ふやすと おかねが ふえる",
    body: "はこに おかねを あずけると、なんかい か ねると すこし ふえて かえってくるよ。まってみよう！",
  },
  {
    emoji: "💼",
    title: "おしごとで おかねを もらう",
    body: "おてつだいを ボタンで しんせいして、おうちの ひとが OKすると おかねが もらえるよ。",
  },
  {
    emoji: "🎉",
    title: "さあ、はじめよう！",
    body: "まずは ホームで いまの おかねを みてみよう。たのしく ためて いこう！",
  },
] as const;

type Props = {
  accentColor: string;
  onClose: () => void;
};

export function AboutModal({ accentColor, onClose }: Props) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(10,20,40,.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: "28px 28px 0 0",
          padding: "28px 28px 44px",
          fontFamily: "'Zen Maru Gothic', system-ui, sans-serif",
        }}
      >
        {/* ドットインジケーター */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              style={{
                height: 8,
                width: i === step ? 22 : 8,
                borderRadius: 5,
                background: i === step ? accentColor : "#DCE0E8",
                transition: "width .2s",
              }}
            />
          ))}
        </div>

        {/* イラスト枠 */}
        <div
          style={{
            fontSize: 72,
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 1,
          }}
        >
          {slide.emoji}
        </div>

        {/* テキスト */}
        <h2 style={{ fontWeight: 900, fontSize: 22, color: "#1B3A6B", textAlign: "center", marginBottom: 12 }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#2C6F96", lineHeight: 2, textAlign: "center", marginBottom: 28 }}>
          {slide.body}
        </p>

        {/* ボタン */}
        <div style={{ display: "flex", gap: 12 }}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              style={{
                flex: 1,
                height: 56,
                borderRadius: 16,
                border: "2px solid #DCE0E8",
                background: "#fff",
                fontWeight: 900,
                fontSize: 16,
                color: "#6B7480",
                fontFamily: "inherit",
              }}
            >
              ← もどる
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (isLast) { onClose(); setStep(0); }
              else setStep((s) => s + 1);
            }}
            style={{
              flex: 2,
              height: 56,
              borderRadius: 16,
              border: "none",
              background: accentColor,
              color: "#fff",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: `0 10px 22px ${accentColor}55`,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {isLast ? "とじる ✕" : "つぎへ →"}
          </button>
        </div>

        {/* スキップ */}
        {!isLast && (
          <button
            type="button"
            onClick={() => { onClose(); setStep(0); }}
            style={{
              display: "block",
              margin: "14px auto 0",
              background: "none",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "#9AA3B0",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            とばす
          </button>
        )}
      </div>
    </div>
  );
}
