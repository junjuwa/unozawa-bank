// lib/types.ts — データモデル（HANDOFF.md の §7 と一致）
export type Role = 'child' | 'parent';
export type ThemeKey = 'rei' | 'jun' | 'parent';
export type BoxKind = 'use' | 'save' | 'invest';            // つかう / ためる / ふやす
export type TextLevel = 'kanji-ruby' | 'hiragana';

export interface User {
  id: string;
  role: Role;
  displayName: string;        // 'れい' | 'じゅん' | 保護者名
  theme: ThemeKey;            // 子供= rei|jun, 親= parent
  avatarUrl?: string;         // <image-slot> の置き換え
}

export interface Box { userId: string; kind: BoxKind; balance: number; } // 円(整数)・1ユーザー3箱

export interface Goal {
  id: string; userId: string;
  name: string; imageUrl?: string;
  targetAmount: number; savedAmount: number;
  active: boolean;            // ホームに出す「いま ためてる」目標
  order: number;
}

export interface Lot {       // ふやす（投資）
  id: string; userId: string;
  principal: number;
  startDate: string; termDays: number; rate: number; // 例: 30日 / 0.05
  maturesAt: string;
  status: 'active' | 'matured';
}

export interface Job { id: string; name: string; unitPrice: number; } // 単価マスタ

export interface JobRequest {
  id: string; childId: string; jobId: string; amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; decidedAt?: string;            // 承認画面に「承認日時」を表示
}

export interface Transfer {  // 子供は from/to とも自分の箱のみ
  id: string; userId: string; fromKind: BoxKind; toKind: BoxKind;
  amount: number; createdAt: string;
}

export interface Settings {
  childId: string;
  basePay: number; payFrequency: 'weekly' | 'monthly';  // 基本給
  investRate: number; investTermDays: number;           // ふやす 利率・満期日数
  textLevel: TextLevel;                                  // 表記モード
}

// 満期処理の目安：利息 = round(principal * rate) を save 箱へ移し、Lot を matured に。
export const maturityInterest = (principal: number, rate: number) => Math.round(principal * rate);
