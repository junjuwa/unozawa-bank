// ③ GoalCelebration — 目標達成・紙吹雪演出（overlay）
// 新規 src/components/child/GoalCelebration.tsx
// props: { goalName; themeKey; onDismiss }。3秒で自動フェードアウト＋クリックで閉じる。Tailwind不使用。
import React, { useEffect, useState } from 'react';
import type { ThemeKey } from '@/lib/theme/childTheme';

const CONFETTI: Record<ThemeKey, string[]> = {
  rei_blue: ['#FF7E6B', '#FFD23F', '#7FCDF4'],
  jun_red: ['#E2231A', '#111', '#FFD23F'],
  parent_dark: ['#5B8DEF', '#4FB477', '#E0A042'],
};

export function GoalCelebration({ goalName, themeKey, onDismiss }: { goalName: string; themeKey: ThemeKey; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const isJun = themeKey === 'jun_red';
  const colors = CONFETTI[themeKey] ?? CONFETTI.rei_blue;

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 3000);
    const t2 = setTimeout(onDismiss, 3500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [onDismiss]);

  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: Math.random() * 100, bg: colors[i % colors.length],
    delay: Math.random() * 2.4, dur: 1.8 + Math.random() * 1.2, rot: Math.random() * 360,
  }));

  return (
    <div
      onClick={() => { setLeaving(true); setTimeout(onDismiss, 400); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,45,90,.28)', opacity: leaving ? 0 : 1, transition: 'opacity .4s ease',
      }}
    >
      <style>{`@keyframes gc-fall{0%{transform:translateY(-24px) rotate(0);opacity:1}100%{transform:translateY(102vh) rotate(360deg);opacity:.6}}`}</style>
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', top: -24, left: `${p.left}%`, width: 9, height: 14, borderRadius: 2,
          background: p.bg, transform: `rotate(${p.rot}deg)`,
          animation: `gc-fall ${p.dur}s linear ${p.delay}s infinite`,
        }} />
      ))}
      <div style={{
        position: 'relative', zIndex: 2, textAlign: 'center', padding: '20px 26px',
        background: '#fff', borderRadius: 20,
        border: isJun ? '3px solid #111' : 'none',
        boxShadow: isJun ? '6px 6px 0 #111' : '0 14px 30px rgba(20,45,90,.3)',
      }}>
        <div style={{
          font: isJun ? "400 22px 'RocknRoll One'" : "900 22px 'Zen Maru Gothic'",
          color: isJun ? '#E2231A' : '#FF6B55', textShadow: isJun ? '1.5px 1.5px 0 #111' : 'none',
        }}>やったー！ ゴールたっせい！</div>
        <div style={{
          marginTop: 8, color: isJun ? '#102A54' : '#1B3A6B',
          font: isJun ? "400 14px 'RocknRoll One'" : "700 14px 'Zen Maru Gothic'",
        }}>「{goalName}」</div>
      </div>
    </div>
  );
}
