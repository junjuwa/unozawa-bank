# 「やくそく」画面 再設計スペック

## 目的
現状 `rules/page.tsx` が「固定ルール + family_settings.promises」を混在させている。
内容を **目的で二分**し、編集(CRUD)は廃止してコード定数化する。

- **おやくそく（価値観・教育）**＝親子で交わす約束（規範的）。画面の主役。
- **つかいかた（しくみ）**＝アプリの動作説明（記述的）。参照情報＋その場ヒントで補う。

---

## 1. コンテンツ定義

### 1.1 おやくそく（`src/lib/content/promises.ts`）

文言はハードコード。1約束＝1カードでリッチに見せる。漢字＋ルビ（3年生まで）。

```ts
export interface Promise {
  id: string;
  icon: string;        // アイコンキー or 絵文字
  title: string;       // 見出し（漢字＋ルビ対象）
  body?: string;       // 補足の一文（任意）
  accent?: string;     // カードのアクセント色（テーマトークンで上書き可）
}

export const PROMISES: Promise[] = [
  { id: 'careful', icon: '🪙', title: 'お金は 大事に つかう' },
  { id: 'think',   icon: '🤔', title: 'ほしいものは よく 考えてから きめる',
    body: '「ほしい」と「いる」は ちがうよ' },
  { id: 'honest',  icon: '💪', title: 'お仕事は ちゃんとやってから もうしこむ',
    body: 'ずるは しない' },
  { id: 'patient', icon: '🌱', title: 'がまんして ためると、いいことが ある' },
  { id: 'own',     icon: '🧭', title: '自分の お金は 自分で きめる',
    body: 'こまったら おうちのひとに 相談してね' },
];
```

> 5つに絞る（多すぎると約束の重みが薄れる）。将来「わが家だけの特別な約束」を1つ足したい場合のみ、
> family_settings に単一テキストカラムを1つ残す案もある（デフォルトは無し）。

### 1.2 つかいかた（`src/lib/content/howItWorks.ts`）

文言はハードコード、**数字は family_settings から動的差し込み**（`{maturityDays}` / `{rate}`）。
親がパラメータを変えても説明が古くならないようにする。

```ts
export interface HowItWorksItem {
  id: string;
  icon: string;
  text: string;        // {maturityDays} {rate} を実行時に置換
}

export const HOW_IT_WORKS: HowItWorksItem[] = [
  { id: 'boxes',    icon: '📦', text: '3つのはこ（つかう・ためる・ふやす）で お金を わける' },
  { id: 'inflow',   icon: '⬇️', text: 'もらった お金は まず「つかう」に 入る' },
  { id: 'move',     icon: '🔁', text: '「つかう」から すきなはこへ 自分で うつせる' },
  { id: 'grow',     icon: '📈', text: '「ふやす」に 入れると {maturityDays}日で +{rate}% ふえて「ためる」に もどる' },
  { id: 'lock',     icon: '🔒', text: '「ふやす」の お金は {maturityDays}日 は 取り出せない' },
  { id: 'job',      icon: '✅', text: 'お仕事は もうしこむ → おうちのひとが OK → お金が もらえる' },
  { id: 'salary',   icon: '🗓️', text: 'きほんきゅうは 家族の一員だから、お仕事は がんばったぶんの ごほうび' },
  { id: 'goal',     icon: '⭐', text: '「ためる」で ほしいもの目標を きめられる' },
];
```

`{rate}` は `family_settings.investment_rate`（0.02→「2」）、`{maturityDays}` は `maturity_days` を差し込む。

---

## 2. 画面構成（`rules/page.tsx` を作り替え）

**ナビ項目は増やさない**（小1の負担軽減）。1画面内で役割を分ける。

```
おやくそく画面（旧 rules）
├─ ヘッダー：「◯◯と おうちのひとの やくそく」（ユーザー名入り／宣言感）
├─ [主役] PromiseCard × 5     ← PROMISES を大きく、マスコットが語りかける演出
│                               1約束1カード・大アイコン・テーマ配色
└─ [参照] 「つかいかた を みる」  ← 折りたたみ or 下段の軽い扱いで HOW_IT_WORKS
                                 数字は family_settings から差し込み
```

- 主役はあくまで **おやくそく**。ここにデザインを投資（PromiseCard を新規、RuleCard を流用/改修）。
- **つかいかた**は控えめ。実地の説明は既存の GrowHintBanner / ConditionPopup / ConfirmPopup で
  「その場で」教えるのが本筋。この欄は後から見返す辞書として機能すればよい。

---

## 3. 削除・整理（クリーンアップ）

| 対象 | 対応 |
|---|---|
| `src/app/(parent)/settings/promises/page.tsx` | **削除**（CRUD廃止） |
| 親ナビ／設定内の「やくそく編集」導線 | **削除** |
| `family_settings.promises`（jsonb） | 参照を全て `PROMISES` 定数に置換。カラムは非推奨化（次回マイグレーションで drop 可、急がない） |
| `rules/page.tsx` の「固定ルール」ハードコード部分 | `HOW_IT_WORKS` 定数へ移動 |
| `src/lib/mock/…/rulesMock.ts` | `PROMISES` / `HOW_IT_WORKS` を参照する形に統一（モックと実データの二重管理をやめる） |

> `family_settings.promises` カラムの drop は任意。まず参照を切ってから、落ち着いたタイミングで
> `alter table family_settings drop column promises;` を単独マイグレーションで。

---

## 4. 親への補足（金融教育メモ・実装外）

- **きほんきゅう と お仕事 の分離**は、金融教育の「基本の手伝いは無償の家族貢献／追加の仕事は有償」
  という考え方に合致している。つかいかた #salary の一文はこの価値観を子に伝える設計。
- **「ふやす」は"必ず+X%"の確定利息**モデル＝「待つと増える（複利・忍耐）」を教えるもの。
  現実の投資が持つ「元本割れリスク」は、この年齢では扱わず、将来の会話に取っておく想定。
- 約束をコード定数にしたことで、成長に合わせて文言・数を親（開発者）が意図的に見直す運用になる。
  「変えにくさ」はここではメリット（約束が軽々しく変わらない）。

---

## 5. Claude Code への指示（そのまま貼れる）

```
rules 画面を「やくそく」再設計スペックに沿って作り替えて。
1. src/lib/content/promises.ts と howItWorks.ts を新規作成（スペックの定数をそのまま）。
2. rules/page.tsx を「おやくそく（PROMISES）を主役 + つかいかた（HOW_IT_WORKS）を参照」の構成に。
   PromiseCard を新規作成（1約束1カード・大アイコン・マスコット語りかけ・テーマ配色）。
3. HOW_IT_WORKS の {maturityDays}/{rate} は useFamilySettings から差し込む（固定文にしない）。
4. 親側の settings/promises/page.tsx とその導線を削除。family_settings.promises への参照を
   全て PROMISES 定数へ置換（カラム drop は今回はしない）。
5. rulesMock.ts は PROMISES/HOW_IT_WORKS を参照する形に統一。
先に変更ファイル一覧とプランを提示してから着手して。
```
