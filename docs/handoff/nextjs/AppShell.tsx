// components/AppShell.tsx — 共通骨格（全ユーザー・全画面で同一）。表層は theme から注入。
// 子供= ボトムナビ5本（横向きはサイドナビ）/ 親= ボトムナビ3本。
'use client';
import React from 'react';
import { Theme } from '@/lib/theme';

export type NavKey = string; // child: home|invest|transfer|jobs|rules / parent: dash|approve|settings

export interface NavItem { key: NavKey; label: string; icon: React.ReactNode; }

export function AppShell({
  theme, nav, active, header, mascot, children, layout = 'bottom',
}: {
  theme: Theme;
  nav: NavItem[];
  active: NavKey;
  header?: React.ReactNode;     // アバター＋名前＋所持金（親はタイトル＋期間）
  mascot?: React.ReactNode;     // 子供のみ：案内・応援の吹き出し
  children: React.ReactNode;
  layout?: 'bottom' | 'side';   // side = iPad 横
}) {
  const isSide = layout === 'side';
  return (
    <div
      style={{
        position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
        background: theme.frameBg, color: theme.ink, fontFamily: theme.fontFamily,
        display: isSide ? 'flex' : 'block',
      }}
    >
      {/* デコレーション層（rei=水彩ブロブ / jun=ハーフトーン・集中線）はここに theme 別で重ねる */}
      {isSide && <SideNav theme={theme} nav={nav} active={active} />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {header}
        {mascot}
        <main style={{ flex: 1, overflow: 'auto', padding: '0 18px 100px' }}>{children}</main>
      </div>
      {!isSide && <BottomNav theme={theme} nav={nav} active={active} />}
    </div>
  );
}

function BottomNav({ theme, nav, active }: { theme: Theme; nav: NavItem[]; active: NavKey }) {
  return (
    <nav style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 84,
      background: theme.key === 'parent' ? '#16191D' : '#fff',
      borderRadius: theme.key === 'rei' ? '28px 28px 0 0' : 0,
      borderTop: theme.key === 'jun' ? '3px solid #111' : '1px solid rgba(0,0,0,.06)',
      boxShadow: theme.key === 'rei' ? '0 -8px 22px rgba(27,58,107,.12)' : 'none',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', padding: '12px 6px 0',
    }}>
      {nav.map((n) => {
        const on = n.key === active;
        const color = on ? theme.navActive : theme.navIdle;
        return (
          <div key={n.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color, fontWeight: 700, fontSize: 10 }}>
            <span style={on && theme.navActiveBg ? { background: theme.navActiveBg, borderRadius: 15, padding: '4px 12px' } : undefined}>{n.icon}</span>
            {n.label}
          </div>
        );
      })}
    </nav>
  );
}

function SideNav({ theme, nav, active }: { theme: Theme; nav: NavItem[]; active: NavKey }) {
  return (
    <aside style={{ width: 212, flexShrink: 0, background: '#fff', borderRight: theme.key === 'jun' ? '3px solid #111' : '1px solid rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', padding: '26px 18px', gap: 12 }}>
      {nav.map((n) => {
        const on = n.key === active;
        return (
          <div key={n.key} style={{
            display: 'flex', alignItems: 'center', gap: 12, borderRadius: 10, padding: '13px 14px',
            background: on ? theme.accent : 'transparent', color: on ? '#fff' : theme.ink,
            border: on && theme.key === 'jun' ? '2.5px solid #111' : '2.5px solid transparent',
            boxShadow: on && theme.key === 'jun' ? '3px 3px 0 #111' : 'none', fontWeight: 700,
          }}>
            {n.icon}<span>{n.label}</span>
          </div>
        );
      })}
    </aside>
  );
}

/*
  使い方の骨子：
  <AppShell theme={themes[user.theme]} nav={CHILD_NAV} active="home"
            header={<ChildHeader user={user} />} mascot={<Mascot text={...} />}>
    <BalanceCards .../>   // ためる大カード＋つかう/ふやす（grid auto-fill）
  </AppShell>

  カード/コイン/プログレス/状態バッジは theme と statusColors/boxColors を参照して描画。
  ピクセルの最終確認は Okozukai-Home.html を参照。
*/
