"use client";

// design.md §5: パスキー登録は「ログイン済み」が前提のため、初回だけ親が橋渡しする。
// TODO(auth): 各ステップを実際のAdmin API呼び出し・registerPasskey()に置き換える。
// 今は流れを見せるだけのモック（「次へ」で進むだけ、実処理なし）。
import { useState } from "react";
import { childThemes } from "@/lib/theme/childTheme";
import { SetupStepCard } from "@/components/parent/SetupStepCard";

const STEPS = [
  { title: "子アカウントを作成", description: "管理画面から子のアカウントを作成します（パスワードなし）" },
  { title: "子の端末で一時サインイン", description: "親が子の端末で一時的にその子としてサインインします" },
  { title: "パスキーを登録", description: "その場でTouch ID / Face IDなどのパスキーを端末に登録します" },
  { title: "以後はパスキーのみでログイン", description: "次回からは子が自分でパスキーだけでログインできます" },
];

export default function SetupPage() {
  const theme = childThemes.parent_dark;
  const [current, setCurrent] = useState(0);
  const isLast = current === STEPS.length - 1;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 style={{ fontWeight: 800, fontSize: 18, color: theme.ink }}>はじめての せってい</h1>
      <p style={{ fontSize: 12, color: theme.sub }}>
        子のパスキー登録は、初回だけ親が橋渡しします（design.md §5）。
      </p>

      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <SetupStepCard
            key={step.title}
            theme={theme}
            step={i + 1}
            title={step.title}
            description={step.description}
            state={i < current ? "done" : i === current ? "current" : "upcoming"}
          />
        ))}
      </div>

      {isLast && (
        <div
          style={{
            background: theme.cardBg,
            borderRadius: theme.cardRadius,
            border: theme.cardBorder,
            padding: 16,
            textAlign: "center",
            color: "#3DB66E",
            fontWeight: 700,
          }}
        >
          かんりょう！子どもはパスキーだけでログインできるようになりました。
        </div>
      )}

      <button
        type="button"
        onClick={() => setCurrent((c) => Math.min(STEPS.length - 1, c + 1))}
        disabled={current >= STEPS.length - 1}
        style={{
          background: current >= STEPS.length - 1 ? theme.progressTrack : theme.accent,
          color: current >= STEPS.length - 1 ? theme.sub : "#fff",
          borderRadius: theme.cardRadius,
          padding: 14,
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        {current >= STEPS.length - 1 ? "完了しました" : "次へ"}
      </button>
    </div>
  );
}
