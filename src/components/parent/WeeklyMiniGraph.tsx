// ⑥ WeeklyMiniGraph — 親ダッシュボード週間グラフ（れい×じゅん グループ棒）
// 新規 src/components/parent/WeeklyMiniGraph.tsx。props: { reiData:number[]; junData:number[] }（各7要素）
import React from 'react';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function WeeklyMiniGraph({ reiData, junData }: { reiData: number[]; junData: number[] }) {
  const max = Math.max(1, ...reiData, ...junData);
  const h = (v: number) => (v > 0 ? Math.max(6, Math.round((v / max) * 70)) : 4);
  const col = (v: number, c: string) => (v > 0 ? c : '#3A424C');
  const bar: React.CSSProperties = { width: 9, borderRadius: '3px 3px 0 0', display: 'block' };

  return (
    <div style={{ background: '#272D35', borderRadius: 12, padding: 16 }}>
      <div style={{ font: '600 11px system-ui', color: '#9AA3AD', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 12 }}>今週の貯金</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 70, width: '100%', justifyContent: 'center' }}>
              <i style={{ ...bar, height: h(reiData[i]), background: col(reiData[i], '#5B8DEF') }} />
              <i style={{ ...bar, height: h(junData[i]), background: col(junData[i], '#E2231A') }} />
            </div>
            <span style={{ font: '600 9px system-ui', color: '#9AA3AD' }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {[['れい', '#5B8DEF'], ['じゅん', '#E2231A']].map(([n, c]) => (
          <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 10px system-ui', color: '#c3ccd6' }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'block' }} />{n}
          </span>
        ))}
      </div>
    </div>
  );
}
