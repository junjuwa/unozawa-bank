"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ChildTheme } from "@/lib/theme/childTheme";

// ---- マスコットSVG（共通） ----
const MascotSvg = () => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
    <rect x="19" y="13" width="26" height="16" rx="2.5" fill="#FFD86F" />
    <circle cx="26" cy="21" r="4.3" fill="none" stroke="#1B3A6B" strokeWidth="1.6" />
    <path d="M33 18H41M33 21H41M33 24H38" stroke="#1B3A6B" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13 20a4 4 0 0 1 8 0v13q11 4.5 22 0v-13a4 4 0 0 1 8 0v13a15 15 0 0 1-38 0Z" fill="#F5B62E" />
  </svg>
);

// ---- イラスト素材 ----
const ArtWelcome = () => (
  <svg width="150" height="150" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="58" r="34" fill="#FFD86F" stroke="#F5B62E" strokeWidth="4" />
    <circle cx="60" cy="58" r="24" fill="none" stroke="#F5B62E" strokeWidth="2" opacity=".5" />
    <text x="60" y="70" textAnchor="middle" fontFamily="Zen Maru Gothic,sans-serif" fontWeight="900" fontSize="34" fill="#C98A12">¥</text>
    <path d="M22 30l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#FF7E6B" />
    <path d="M96 78l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#7FC4EC" />
    <circle cx="98" cy="34" r="4" fill="#FFB199" />
  </svg>
);

const ArtBoxes = ({ isJun }: { isJun: boolean }) => (
  <div style={{ display: "flex", gap: "0.6rem" }}>
    {(["つかう", "ためる", "ふやす"] as const).map((label) => {
      const bgMap = {
        つかう: isJun ? "#1B6CD9" : "linear-gradient(160deg,#7FC4EC,#3F9FDC)",
        ためる: isJun ? "#E2231A" : "linear-gradient(160deg,#FF9E8C,#FF7E6B)",
        ふやす: isJun ? "#FFD23F" : "linear-gradient(160deg,#FFD86F,#F0B429)",
      };
      const colorMap = { つかう: "#fff", ためる: "#fff", ふやす: isJun ? "#111" : "#7a4e00" };
      return (
        <div
          key={label}
          style={{
            width: 60, height: 74, borderRadius: isJun ? 10 : 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: bgMap[label], color: colorMap[label],
            font: `${isJun ? 400 : 900} 0.66rem sans-serif`,
            boxShadow: isJun ? "2px 2px 0 #111" : "0 6px 12px rgba(27,58,107,.16)",
            border: isJun ? "2.5px solid #111" : "none",
          }}
        >
          {label}
        </div>
      );
    })}
  </div>
);

const ArtTransfer = ({ isJun }: { isJun: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <div style={{ width: 60, height: 74, borderRadius: isJun ? 10 : 16, display: "flex", alignItems: "center", justifyContent: "center", background: isJun ? "#1B6CD9" : "linear-gradient(160deg,#7FC4EC,#3F9FDC)", color: "#fff", font: `${isJun ? 400 : 900} 0.66rem sans-serif`, border: isJun ? "2.5px solid #111" : "none", boxShadow: isJun ? "2px 2px 0 #111" : undefined }}>つかう</div>
    <span style={{ color: isJun ? "#FFD23F" : "#FF7E6B", filter: isJun ? "drop-shadow(1px 1px 0 #111)" : undefined }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><polygon points="4,10 14,10 14,6 21,12 14,18 14,14 4,14" /></svg>
    </span>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {(["ためる", "ふやす"] as const).map((label) => {
        const bg = label === "ためる"
          ? (isJun ? "#E2231A" : "linear-gradient(160deg,#FF9E8C,#FF7E6B)")
          : (isJun ? "#FFD23F" : "linear-gradient(160deg,#FFD86F,#F0B429)");
        return (
          <div key={label} style={{ width: 52, height: 34, borderRadius: isJun ? 10 : 16, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: label === "ふやす" && isJun ? "#111" : "#fff", font: `${isJun ? 400 : 900} 0.6rem sans-serif`, border: isJun ? "2.5px solid #111" : "none", boxShadow: isJun ? "2px 2px 0 #111" : undefined }}>{label}</div>
        );
      })}
    </div>
  </div>
);

const ArtGrow = ({ isJun }: { isJun: boolean }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.7rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ width: 34, height: 34, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: isJun ? "#FFD23F" : "radial-gradient(circle at 35% 30%,#FFE89A,#FFD23F)", border: isJun ? "2.5px solid #111" : "2px solid #fff", color: isJun ? "#111" : "#C98A12", boxShadow: isJun ? "2px 2px 0 #111" : "0 3px 5px rgba(27,58,107,.16)", fontSize: 14, fontWeight: 900 }}>¥</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#3DB66E"><polygon points="12,4 20,14 4,14" /></svg>
      <span style={{ width: 40, height: 40, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: isJun ? "#FFD23F" : "radial-gradient(circle at 35% 30%,#FFE89A,#FFD23F)", border: isJun ? "2.5px solid #111" : "2px solid #fff", color: isJun ? "#111" : "#C98A12", boxShadow: isJun ? "2px 2px 0 #111" : "0 3px 5px rgba(27,58,107,.16)", fontSize: 16, fontWeight: 900 }}>¥</span>
    </div>
    <div style={{ width: 150, height: 16, borderRadius: isJun ? 3 : 9, background: isJun ? "#fff" : "#DCEFFB", overflow: "hidden", border: isJun ? "2.5px solid #111" : "none" }}>
      <div style={{ width: "66%", height: "100%", borderRadius: isJun ? 0 : 9, background: isJun ? "repeating-linear-gradient(45deg,#E2231A,#E2231A 7px,#b81c14 7px,#b81c14 14px)" : "linear-gradient(90deg,#FFB199,#FF7E6B)" }} />
    </div>
  </div>
);

const ArtJob = () => (
  <svg width="150" height="150" viewBox="0 0 120 120" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="30" y="26" width="52" height="64" rx="9" fill="#fff" stroke="#2C7BB0" strokeWidth="4" />
    <path d="M46 26v-6h20v6" stroke="#2C7BB0" strokeWidth="4" />
    <path d="M42 52l10 10 22-24" stroke="#3DB66E" strokeWidth="6" />
    <circle cx="86" cy="82" r="18" fill="#FFD86F" stroke="#F5B62E" strokeWidth="3" />
    <text x="86" y="89" textAnchor="middle" fontFamily="Zen Maru Gothic,sans-serif" fontWeight="900" fontSize="18" fill="#C98A12">¥</text>
  </svg>
);

const ArtGoal = () => (
  <svg width="150" height="150" viewBox="0 0 120 120" fill="none">
    <circle cx="56" cy="60" r="42" fill="#FF9E8C" />
    <circle cx="56" cy="60" r="42" fill="none" stroke="#FF7E6B" strokeWidth="3" />
    <circle cx="56" cy="60" r="28" fill="#fff" />
    <circle cx="56" cy="60" r="15" fill="#FF7E6B" />
    <circle cx="56" cy="60" r="5" fill="#fff" />
    <path d="M84 30v34" stroke="#1B3A6B" strokeWidth="4" strokeLinecap="round" />
    <path d="M84 32h16l-4 6 4 6H84z" fill="#FFD23F" stroke="#1B3A6B" strokeWidth="2" />
  </svg>
);

const ArtStart = () => (
  <svg width="150" height="150" viewBox="0 0 120 120" fill="none">
    <rect x="14" y="20" width="8" height="12" rx="2" fill="#FF7E6B" transform="rotate(18 18 26)" />
    <rect x="96" y="26" width="8" height="12" rx="2" fill="#3DB66E" transform="rotate(-24 100 32)" />
    <rect x="26" y="88" width="8" height="12" rx="2" fill="#5B8DEF" transform="rotate(40 30 94)" />
    <rect x="92" y="86" width="8" height="12" rx="2" fill="#E2231A" transform="rotate(-14 96 92)" />
    <g transform="translate(28,28) scale(1.02)">
      <rect x="19" y="13" width="26" height="16" rx="2.5" fill="#FFD86F" />
      <circle cx="26" cy="21" r="4.3" fill="none" stroke="#1B3A6B" strokeWidth="1.6" />
      <path d="M33 18H41M33 21H41M33 24H38" stroke="#1B3A6B" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 20a4 4 0 0 1 8 0v13q11 4.5 22 0v-13a4 4 0 0 1 8 0v13a15 15 0 0 1-38 0Z" fill="#F5B62E" stroke="#1B3A6B" strokeWidth="1.4" />
    </g>
  </svg>
);

// ---- スライド定義 ----
interface SlideData {
  art: (isJun: boolean, maturityDays: number, rate: number) => React.ReactNode;
  mascotLine: string;
  title: React.ReactNode;
  body?: (maturityDays: number, rate: number) => React.ReactNode;
  isLast?: boolean;
}

const SLIDES: SlideData[] = [
  {
    art: () => <ArtWelcome />,
    mascotLine: "自分の お金を 自分で かんがえて つかう れんしゅうだよ。",
    title: <>ようこそ！<br />じぶんの お金を つかってみよう</>,
  },
  {
    art: (isJun) => <ArtBoxes isJun={isJun} />,
    mascotLine: "お金は はこで わけると わかりやすい！",
    title: "お金は 3つの はこで わける",
    body: () => (
      <>「つかう」は すぐ つかう お金。<br />「ためる」は ほしいものの ための お金。<br />「ふやす」は あずけて ふやす お金。</>
    ),
  },
  {
    art: (isJun) => <ArtTransfer isJun={isJun} />,
    mascotLine: "もらった お金は まず ここに くるよ。",
    title: <>もらった お金は<br />まず「つかう」に 入る</>,
    body: () => <>そこから「ためる」や「ふやす」へ、<br />自分で すきなだけ うつせるよ。</>,
  },
  {
    art: (isJun) => <ArtGrow isJun={isJun} />,
    mascotLine: "まつと ふえる！ でも とちゅうで 出せないよ。",
    title: <>「ふやす」に 入れると<br />お金が ふえる</>,
    body: (maturityDays, rate) => {
      const rateDisplay = Math.round(rate * 100);
      const example = Math.round(100 * (1 + rate));
      return (
        <><b>{maturityDays}</b>日 まつと <b>＋{rateDisplay}%</b> ふえて<br />「ためる」に もどるよ。<br />（例：100円 → <b>{example}円</b>！）<br />そのあいだは 取り出せないから、<br />まつのが だいじ。</>
      );
    },
  },
  {
    art: () => <ArtJob />,
    mascotLine: "がんばった ごほうびに お金が もらえる！",
    title: "お手つだいで お金を かせぐ",
    body: () => <>お仕事を もうしこんで、<br />パパ・ママが OK したら お金が もらえる。<br />きほんきゅうは 家族だから、<br />お仕事は がんばった ごほうびだよ。</>,
  },
  {
    art: () => <ArtGoal />,
    mascotLine: "あと いくらで とどくか わかるよ！",
    title: "ほしいものを もくひょうに できる",
    body: () => <>「ためる」で ほしいものと きんがくを 決めると、<br />あと いくらで とどくか わかるよ。</>,
  },
  {
    art: () => <ArtStart />,
    mascotLine: "こまったら「やくそく」を みてね。",
    title: "さあ、はじめよう！",
    isLast: true,
  },
];

interface Props {
  theme: ChildTheme;
  isJun: boolean;
  maturityDays: number;
  rate: number;
}

export function OnboardingCarousel({ theme, isJun, maturityDays, rate }: Props) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const total = SLIDES.length;

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(total - 1, i));
    setCurrent(clamped);
    const track = trackRef.current;
    if (track) {
      const slide = track.children[clamped] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, [total]);

  const handleNext = () => {
    if (current < total - 1) goTo(current + 1);
  };

  // ドット同期はスクロールで行う
  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    setCurrent(idx);
  }, []);

  const slide = SLIDES[current];
  const isLast = slide.isLast;

  const mascotBadgeStyle: React.CSSProperties = isJun
    ? { border: "3px solid #111", boxShadow: "3px 3px 0 #111", borderRadius: 12 }
    : { borderRadius: "50%", boxShadow: "0 5px 12px rgba(27,58,107,.18)" };

  const mascotBubbleStyle: React.CSSProperties = {
    flex: 1,
    textAlign: "left",
    background: theme.cardBg,
    border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
    borderRadius: isJun ? "14px" : "16px 16px 16px 5px",
    padding: "0.6rem 0.8rem",
    font: `${isJun ? 400 : 700} 0.78rem ${theme.fontFamily}`,
    color: theme.ink,
    lineHeight: 1.85,
    boxShadow: isJun ? "3px 3px 0 #111" : theme.cardShadow,
  };

  const artBoxStyle: React.CSSProperties = {
    width: "100%",
    height: 180,
    borderRadius: 26,
    marginBottom: "1rem",
    flexShrink: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: theme.cardBg,
    border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
    boxShadow: theme.cardShadow,
  };

  const nextBtnStyle: React.CSSProperties = {
    width: "100%",
    height: 56,
    border: isJun ? "3px solid #111" : "none",
    borderRadius: isJun ? 12 : 16,
    background: theme.accent,
    color: "#fff",
    font: `${theme.headingWeight} 1rem ${theme.fontFamily}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    boxShadow: isJun ? "4px 4px 0 #111" : "0 10px 22px rgba(255,126,107,.45)",
    textShadow: isJun ? "1.5px 1.5px 0 #111" : "none",
  };

  const rulesCtaStyle: React.CSSProperties = {
    width: "100%",
    height: 56,
    border: theme.cardBorder !== "none" ? theme.cardBorder : "1.5px solid rgba(0,0,0,.08)",
    borderRadius: isJun ? 12 : 16,
    background: theme.cardBg,
    color: theme.ink,
    font: `${theme.headingWeight} 0.92rem ${theme.fontFamily}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    boxShadow: theme.cardShadow,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: theme.fontFamily, color: theme.ink }}>
      {/* 進捗ドット */}
      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", padding: "0.75rem 0 0.25rem", flexShrink: 0 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`スライド ${i + 1}`}
            style={{
              width: i === current ? 22 : 8,
              height: 8,
              borderRadius: 5,
              background: i === current ? theme.navActive : theme.dotIdle,
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.2s, background 0.2s",
            }}
          />
        ))}
      </div>

      {/* カルーセルトラック */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {SLIDES.map((s, i) => (
          <div
            key={i}
            style={{
              minWidth: "100%",
              maxWidth: "100%",
              scrollSnapAlign: "center",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0.5rem 1.25rem 1rem",
              overflowY: "auto",
            }}
          >
            {/* イラスト */}
            <div style={artBoxStyle}>
              {s.art(isJun, maturityDays, rate)}
            </div>

            {/* マスコット */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem", width: "100%" }}>
              <span
                style={{
                  width: 46, height: 46, flexShrink: 0,
                  background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", border: "3px solid #fff",
                  ...mascotBadgeStyle,
                }}
              >
                <MascotSvg />
              </span>
              <p style={{ margin: 0, ...mascotBubbleStyle }}>{s.mascotLine}</p>
            </div>

            {/* タイトル */}
            <h2
              style={{
                margin: "0.2rem 0 0.6rem",
                font: `${theme.headingWeight} 1.32rem ${theme.fontFamily}`,
                color: isJun ? "#fff" : theme.ink,
                lineHeight: 1.7,
                textShadow: isJun
                  ? "2px 2px 0 #111,-2px 2px 0 #111,2px -2px 0 #111,-2px -2px 0 #111"
                  : (theme.titleShadow !== "none" ? theme.titleShadow : undefined),
              }}
            >
              {s.title}
            </h2>

            {/* 本文 */}
            {s.body && (
              <p
                style={{
                  margin: 0,
                  font: `${isJun ? 400 : 700} 0.86rem ${theme.fontFamily}`,
                  color: isJun ? "#102A54" : theme.ink,
                  lineHeight: 1.95,
                  background: isJun ? "#fff" : "rgba(255,255,255,.55)",
                  border: isJun ? "2px solid #111" : "none",
                  borderRadius: 14,
                  padding: "0.7rem 0.9rem",
                }}
              >
                {s.body(maturityDays, rate)}
              </p>
            )}

            {/* 最終スライドのやくそくCTA */}
            {s.isLast && (
              <button
                type="button"
                onClick={() => router.push("/rules")}
                style={rulesCtaStyle}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-4-4L8.3 10.8l2.5 2.5 4.9-4.9 1.5 1.5z" />
                </svg>
                「やくそく」を みる
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 下ナビ */}
      <div style={{ padding: "0.75rem 1.25rem 1.25rem", flexShrink: 0 }}>
        {!isLast && (
          <button type="button" onClick={handleNext} style={nextBtnStyle}>
            つぎ
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="4,10 14,10 14,6 21,12 14,18 14,14 4,14" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
