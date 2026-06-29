# Next.js 実装メモ（App Router）

`HANDOFF.md`（仕様の正）＋ `Okozukai-Home.html`（ピクセルの正）に加え、Next.js 固有の補足です。
このフォルダの `theme.ts` / `ruby.tsx` / `types.ts` / `AppShell.tsx` は **そのまま使える雛形** です（依存は Next.js + React のみ、Tailwind 任意）。

## 推奨ディレクトリ（App Router）
```
app/
  (child)/
    layout.tsx          # ChildShell（テーマ＝ログインユーザーで rei|jun を注入）
    home/page.tsx
    goals/page.tsx       # ためる もくひょう いちらん
    invest/page.tsx      # ふやす
    transfer/page.tsx    # ふりかえ
    jobs/page.tsx        # おしごと
    rules/page.tsx       # やくそく
  (parent)/
    layout.tsx          # ParentShell（ダーク管理UI・ボトムナビ3本）
    dashboard/page.tsx
    approvals/page.tsx
    settings/page.tsx
  layout.tsx            # html/body・next/font・ThemeProvider
components/             # AppShell, BalanceCard, GoalCard, LotCard, JobCard, RuleCard, Coin, ProgressBar, RubyText, Mascot, ImageSlot
lib/theme.ts  lib/types.ts  lib/i18n.ts
```

## フォント（next/font）
```ts
// app/fonts.ts
import { Zen_Maru_Gothic, RocknRoll_One } from 'next/font/google';
export const zenMaru = Zen_Maru_Gothic({ subsets:['latin'], weight:['500','700','900'], variable:'--font-rei' });
export const rocknroll = RocknRoll_One({ subsets:['latin'], weight:['400'], variable:'--font-jun' });
// 親UIは system-ui（数値は font-variant-numeric: tabular-nums）
```
`<body className={`${zenMaru.variable} ${rocknroll.variable}`}>` で CSS 変数化し、テーマ側で `font-family: var(--font-rei|--font-jun)` を選択。

## テーマ注入
- ログインユーザーの `theme: 'rei'|'jun'`（親は `'parent'`）で `<ThemeProvider theme={...}>` を切替。
- **骨格は共通コンポーネント、表層は theme トークンのみ**（`lib/theme.ts` 参照）。画面ごとにテイストを変えない。

## 画像（HTML の `<image-slot>` の置き換え）
- アバター／マスコット／目標の絵は **アップロード可能な画像フィールド**に。`next/image` で表示、未設定時はプレースホルダ。
- 保存先は任意（S3/UploadThing 等）。`User.avatarUrl` / `Goal.imageUrl` に URL を持つ。
- **実在キャラクター画像をアプリ同梱・配布しないこと。** ユーザーが個人的に差し込むのは可。

## サーバー/クライアント分割
- 一覧・ダッシュボード等の表示は **RSC**（DBから直接）。
- 振替の数ステッパー、承認ボタン、紙吹雪/効果音などインタラクションは **Client Component**（`'use client'`）＋ Server Actions。
- お祝い演出・コイン移動はクライアントの一時アニメーション（状態は楽観更新→Server Action 確定）。

## i18n / 表記レベル（ひらがなモードの布石）
- 文言は `lib/i18n.ts` の `t(key, level)` で取得（`level: 'kanji-ruby' | 'hiragana'`）。
- 現状は `kanji-ruby` の1モード。親・設定の表記トグルで `Settings.textLevel` を切替できる前提で配線。
- ルビは `RubyText`（`ruby.tsx`）で描画。rt は本文の約50%、行高はルビ込み。

## 状態色（必ず色＋アイコン）
しんせいちゅう=黄+砂時計 / 申請する=テーマ差し色+紙飛行機 / 承認=緑+チェック / 却下=赤+×。

## レスポンシブ
- カードは `grid-template-columns: repeat(auto-fill, minmax(...))` で端末追従。
- 横（iPad landscape）= サイドナビ、縦/スマホ = ボトムナビ。分岐はこの2点のみ。

## データ/権限（再掲・要徹底）
- 子供の操作は **自分の箱間の振替のみ**。子供画面に支出/購入ボタンを置かない。
- お仕事：子供申請 → 親承認 → 単価を `save` 箱へ加算（`JobRequest.status`）。
- ふやす：満期(既定30日)で `round(principal*rate)` の利息を `save` 箱へ移し、Lot を `matured` に。
