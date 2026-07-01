"use client";

import { useState } from "react";
import "@/styles/onboarding.css";

// ─── 各スライドのイラスト + テキスト部を JSX で忠実再現 ──────────────────
// 元: onboarding/ ディレクトリの step-N-*.html をそのまま JSX に変換

type SlideProps = {
  onNext: () => void;
  onBack: () => void;
  step: number; // 0-indexed
};

/* ---- ドットインジケーター ---- */
function Dots({ active }: { active: number }) {
  return (
    <div className="ob-dots">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className={i === active ? "is-on" : ""} />
      ))}
    </div>
  );
}

/* ---- 次へ矢印 SVG ---- */
const ArrowSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="4,10 14,10 14,6 21,12 14,18 14,14 4,14" />
  </svg>
);

/* ---- スター SVG ---- */
const StarSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
  </svg>
);

/* ---- マスコット（ロゴバッジ） ---- */
const LogoBadge = () => (
  <div className="ob-logo">
    <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
      <rect x="19" y="13" width="26" height="16" rx="2.5" fill="#FFD86F" />
      <circle cx="26" cy="21" r="4.3" fill="none" stroke="#1B3A6B" strokeWidth="1.6" />
      <text x="26" y="23.4" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="6" fill="#1B3A6B">¥</text>
      <path d="M33 18 H41 M33 21 H41 M33 24 H38" stroke="#1B3A6B" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 20 a4 4 0 0 1 8 0 v13 q11 4.5 22 0 v-13 a4 4 0 0 1 8 0 v13 a15 15 0 0 1 -38 0 Z" fill="#F5B62E" />
    </svg>
  </div>
);

/* ---- 「もどる」ボタン ---- */
const BackBtn = ({ onBack }: { onBack: () => void }) => (
  <button className="ob-back" type="button" onClick={onBack}>‹ もどる</button>
);

// ────────────────────────────────────────────────
// ステップ 1 — ようこそ
// ────────────────────────────────────────────────
function Step1({ onNext, step }: SlideProps) {
  return (
    <div className="ob-modal" data-step="1">
      <div className="ob-illo ob-illo--welcome">
        <span className="ob-coin" style={{ position: "absolute", top: 16, left: 26, width: 20, height: 20, fontSize: 8 }}>¥</span>
        <span className="ob-coin" style={{ position: "absolute", top: 40, right: 34, width: 16, height: 16, fontSize: 7 }}>¥</span>
        <span className="ob-coin" style={{ position: "absolute", bottom: 26, left: 44, width: 14, height: 14, fontSize: 6 }}>¥</span>
        <svg style={{ position: "absolute", top: 22, right: 70 }} width="18" height="18" viewBox="0 0 24 24" fill="#FFD23F">
          <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
        </svg>
        <svg style={{ position: "absolute", bottom: 30, right: 40 }} width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
        </svg>
        <LogoBadge />
      </div>
      <div className="ob-body">
        <Dots active={step} />
        <h2 className="ob-title">ようこそ！</h2>
        <p className="ob-desc">
          UNOZAWA BANK は <ruby>自分<rt>じぶん</rt></ruby>の おかねを <ruby>上手<rt>じょうず</rt></ruby>に つかう れんしゅうを する アプリだよ。
        </p>
        <button className="ob-btn" type="button" onClick={onNext}>はじめる <ArrowSvg /></button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// ステップ 2 — 3つのはこ
// ────────────────────────────────────────────────
function Step2({ onNext, onBack, step }: SlideProps) {
  return (
    <div className="ob-modal" data-step="2">
      <div className="ob-illo ob-illo--boxes">
        <BackBtn onBack={onBack} />
        <div className="ob-box">
          <span className="ob-coin" style={{ width: 15, height: 15, fontSize: 6 }}>¥</span>
          <div className="ob-box-ic" style={{ background: "#E4F5FF", color: "#2C7BB0" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="6" width="18" height="13" rx="3" />
              <circle cx="16" cy="12.5" r="2.3" fill="#E4F5FF" />
            </svg>
          </div>
          <div className="ob-box-name">つかう</div>
        </div>
        <div className="ob-box">
          <span className="ob-coin" style={{ width: 15, height: 15, fontSize: 6 }}>¥</span>
          <div className="ob-box-ic" style={{ background: "#FFEDE9", color: "#FF7E6B" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="9" width="14" height="11" rx="3" />
              <rect x="8" y="5" width="8" height="3" rx="1.5" />
              <rect x="10.5" y="12" width="3" height="4.2" rx="1.5" fill="#FFEDE9" />
            </svg>
          </div>
          <div className="ob-box-name">ためる</div>
        </div>
        <div className="ob-box">
          <span className="ob-coin" style={{ width: 15, height: 15, fontSize: 6 }}>¥</span>
          <div className="ob-box-ic" style={{ background: "#FFF6DA", color: "#E0A810" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,3 20,12 15,12 15,21 9,21 9,12 4,12" />
            </svg>
          </div>
          <div className="ob-box-name">ふやす</div>
        </div>
      </div>
      <div className="ob-body">
        <Dots active={step} />
        <h2 className="ob-title">3つの はこが あるよ</h2>
        <p className="ob-desc">
          「つかう」「ためる」「ふやす」。もらった おかねを 3つの はこで <ruby>分<rt>わ</rt></ruby>けて <ruby>考<rt>かんが</rt></ruby>えよう。
        </p>
        <button className="ob-btn" type="button" onClick={onNext}>つぎへ <ArrowSvg /></button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// ステップ 3 — ためると ゆめが かなう
// ────────────────────────────────────────────────
function Step3({ onNext, onBack, step }: SlideProps) {
  return (
    <div className="ob-modal" data-step="3">
      <div className="ob-illo ob-illo--save">
        <BackBtn onBack={onBack} />
        <div className="ob-goal-row">
          <div className="ob-goal-pic">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FF6B55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 8h8a5 5 0 0 1 4.9 4l.7 4a2.4 2.4 0 0 1-4.5 1.3L16 15H8l-1.1 2.3A2.4 2.4 0 0 1 2.4 16l.7-4A5 5 0 0 1 8 8Z" />
              <path d="M6.5 11.5v2M5.5 12.5h2" />
              <circle cx="16" cy="11.5" r=".6" fill="#FF6B55" />
              <circle cx="17.5" cy="13.5" r=".6" fill="#FF6B55" />
            </svg>
          </div>
          <div className="ob-goal-label">
            <div className="ob-goal-cap"><ruby>目標<rt>もくひょう</rt></ruby></div>
            <div className="ob-goal-name"><ruby>新<rt>あたら</rt></ruby>しいゲーム</div>
          </div>
        </div>
        <div className="ob-bar"><i style={{ width: "57%" }} /></div>
        <div className="ob-remain">
          あと <b>650</b> えん{" "}
          <span className="ob-coin" style={{ width: 20, height: 20, fontSize: 8 }}>¥</span>
        </div>
      </div>
      <div className="ob-body">
        <Dots active={step} />
        <h2 className="ob-title">ためると ゆめが かなう</h2>
        <p className="ob-desc">
          ほしい ものを <ruby>決<rt>き</rt></ruby>めて、おかねを <ruby>集<rt>あつ</rt></ruby>めよう。バーが いっぱいに なったら もくひょうたっせい！
        </p>
        <button className="ob-btn" type="button" onClick={onNext}>つぎへ <ArrowSvg /></button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// ステップ 4 — ふやすと おかねが ふえる
// ────────────────────────────────────────────────
function Step4({ onNext, onBack, step }: SlideProps) {
  return (
    <div className="ob-modal" data-step="4">
      <div className="ob-illo ob-illo--grow">
        <BackBtn onBack={onBack} />
        <div className="ob-grow-row">
          <span className="ob-coin" style={{ width: 30, height: 30, fontSize: 12 }}>¥</span>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#3DB66E">
            <polygon points="12,4 20,14 4,14" />
          </svg>
          <span className="ob-coin" style={{ width: 22, height: 22, fontSize: 9 }}>¥</span>
          <span className="ob-coin" style={{ width: 22, height: 22, fontSize: 9 }}>¥</span>
        </div>
        <div className="ob-moons">
          <span className="ob-moon" />
          <span className="ob-moon" />
          <span className="ob-moon" />
        </div>
        <div className="ob-chip">
          あと <span style={{ color: "#FF6B55", fontSize: 17, fontWeight: 900 }}>3</span> かい ねたら{" "}
          <span style={{ color: "#2E9C5B", fontWeight: 900 }}>315えん</span>
        </div>
      </div>
      <div className="ob-body">
        <Dots active={step} />
        <h2 className="ob-title">ふやすと おかねが ふえる</h2>
        <p className="ob-desc">
          はこに おかねを あずけると、<ruby>何回<rt>なんかい</rt></ruby> か ねると すこし ふえて <ruby>返<rt>かえ</rt></ruby>って くるよ。<ruby>待<rt>ま</rt></ruby>って みよう！
        </p>
        <button className="ob-btn" type="button" onClick={onNext}>つぎへ <ArrowSvg /></button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// ステップ 5 — おしごとで おかねを もらう
// ────────────────────────────────────────────────
function Step5({ onNext, onBack, step }: SlideProps) {
  return (
    <div className="ob-modal" data-step="5">
      <div className="ob-illo ob-illo--jobs">
        <BackBtn onBack={onBack} />
        <div className="ob-jobcard">
          <div className="ob-jobthumb" />
          <div className="ob-jobname">おてつだい</div>
          <div className="ob-jobpay">
            <span className="ob-coin" style={{ width: 14, height: 14, fontSize: 6 }}>¥</span>50
          </div>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#B9A24A">
          <polygon points="4,10 14,10 14,6 21,12 14,18 14,14 4,14" />
        </svg>
        <div className="ob-status">
          <span className="ob-badge ob-badge--pending">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3h12v3l-4 6 4 6v3H6v-3l4-6-4-6z" />
            </svg>
            しんせい
          </span>
          <span className="ob-badge ob-badge--ok">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="9.4,16.6 4.6,11.8 6.5,9.9 9.4,12.8 17.5,4.7 19.4,6.6" />
            </svg>
            しょうにん
          </span>
        </div>
      </div>
      <div className="ob-body">
        <Dots active={step} />
        <h2 className="ob-title">おしごとで おかねを もらう</h2>
        <p className="ob-desc">
          おてつだいを ボタンで しんせいして、おうちの <ruby>人<rt>ひと</rt></ruby>が OK すると おかねが もらえるよ。
        </p>
        <button className="ob-btn" type="button" onClick={onNext}>つぎへ <ArrowSvg /></button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// ステップ 6 — さあ、はじめよう！
// ────────────────────────────────────────────────
function Step6({ onNext, onBack, step }: SlideProps) {
  return (
    <div className="ob-modal" data-step="6">
      <div className="ob-illo ob-illo--start">
        <BackBtn onBack={onBack} />
        <span className="ob-confetti" style={{ top: 14, left: 20, background: "#FF7E6B", transform: "rotate(0deg)" }} />
        <span className="ob-confetti" style={{ top: 44, left: 82, background: "#4FB477", transform: "rotate(40deg)" }} />
        <span className="ob-confetti" style={{ top: 74, left: 144, background: "#5B8DEF", transform: "rotate(80deg)" }} />
        <span className="ob-confetti" style={{ top: 104, left: 206, background: "#fff", transform: "rotate(120deg)" }} />
        <span className="ob-confetti" style={{ top: 134, left: 268, background: "#E2231A", transform: "rotate(160deg)" }} />
        <LogoBadge />
      </div>
      <div className="ob-body">
        <Dots active={step} />
        <h2 className="ob-title">さあ、はじめよう！</h2>
        <p className="ob-desc">
          まずは ホームで いまの おかねを <ruby>見<rt>み</rt></ruby>て みよう。たのしく ためて いこう！
        </p>
        <button className="ob-btn ob-btn--last" type="button" onClick={onNext}>
          はじめよう！ <StarSvg />
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// モーダル本体
// ────────────────────────────────────────────────
const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6];

type Props = {
  onClose: () => void;
};

export function AboutModal({ onClose }: Props) {
  const [step, setStep] = useState(0);

  function goNext() {
    if (step >= STEPS.length - 1) {
      onClose();
      setStep(0);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const SlideComponent = STEPS[step];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,45,90,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        backdropFilter: "blur(3px)",
        padding: "0 20px",
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <SlideComponent onNext={goNext} onBack={goBack} step={step} />
      </div>
    </div>
  );
}
