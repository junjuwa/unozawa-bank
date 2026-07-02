// ④ TransferAnimation — 振替コイン移動（from箱→to箱、放物線＋着地弾み）
// 新規 src/components/child/TransferAnimation.tsx
// props: { fromKind; toKind; amount; themeKey; onComplete }。0.8秒で onComplete()。
import React, { useEffect } from 'react';
import type { ThemeKey } from '@/lib/theme/childTheme';

type Box = 'spend' | 'save' | 'grow';
const BOX: Record<Box, { tint: string; ink: string; icon: React.ReactNode }> = {
  spend: { tint: '#E4F5FF', ink: '#2C7BB0', icon: <><rect x="3" y="6" width="18" height="13" rx="3" /><circle cx="16" cy="12.5" r="2.3" fill="#E4F5FF" /></> },
  save:  { tint: '#FFEDE9', ink: '#FF7E6B', icon: <><rect x="5" y="9" width="14" height="11" rx="3" /><rect x="8" y="5" width="8" height="3" rx="1.5" /></> },
  grow:  { tint: '#FFF6DA', ink: '#E0A810', icon: <polygon points="12,3 20,12 15,12 15,21 9,21 9,12 4,12" /> },
};

export function TransferAnimation({ fromKind, toKind, amount, themeKey, onComplete }: {
  fromKind: Box; toKind: Box; amount: number; themeKey: ThemeKey; onComplete: () => void;
}) {
  const isJun = themeKey === 'jun_red';
  useEffect(() => { const t = setTimeout(onComplete, 800); return () => clearTimeout(t); }, [onComplete]);

  const boxStyle = (k: Box): React.CSSProperties => ({
    width: 64, height: 64, borderRadius: isJun ? 10 : 16, background: BOX[k].tint, color: BOX[k].ink,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    border: isJun ? '2.5px solid #111' : 'none', boxShadow: isJun ? '3px 3px 0 #111' : '0 6px 14px rgba(27,58,107,.16)',
  });
  const kf = isJun
    ? `@keyframes tf-move{0%{left:60px;transform:translateY(0) scale(1) rotate(0)}45%{transform:translateY(-40px) scale(1.05) rotate(180deg)}88%{left:calc(100% - 104px);transform:translateY(0) scale(1.35) rotate(360deg)}94%{transform:translateY(2px) scale(1.1) rotate(360deg)}100%{left:calc(100% - 104px);transform:translateY(0) scale(1) rotate(360deg)}}`
    : `@keyframes tf-move{0%{left:60px;transform:translateY(0) scale(1)}45%{transform:translateY(-46px) scale(1.05)}90%{left:calc(100% - 104px);transform:translateY(0) scale(1.3)}100%{left:calc(100% - 104px);transform:translateY(0) scale(1)}}`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80, background: 'rgba(20,45,90,.28)' }}>
      <style>{kf}</style>
      <div style={boxStyle(fromKind)}><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">{BOX[fromKind].icon}</svg></div>
      <div style={boxStyle(toKind)}><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">{BOX[toKind].icon}</svg></div>
      <div style={{
        position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: '50%',
        background: isJun ? '#FFD23F' : 'radial-gradient(circle at 35% 30%, #FFE89A, #FFD23F)',
        border: isJun ? '2.5px solid #111' : '2px solid #fff', boxShadow: isJun ? '2px 2px 0 #111' : '0 4px 8px rgba(27,58,107,.2)',
        color: isJun ? '#111' : '#C98A12', display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: "900 18px 'Zen Maru Gothic'", animation: `tf-move .8s ${isJun ? 'cubic-bezier(.5,-0.5,.4,1.4)' : 'ease-in-out'} forwards`,
      }}>¥</div>
    </div>
  );
}
