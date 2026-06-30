"use client";

import { useEffect, useState } from "react";
import { PinScreen } from "./PinScreen";

type Props = {
  /** auth.uid() — nullなら未ログインのためゲート不要 */
  userId: string | null;
  /** profiles.pin_hash の有無（null = PIN未設定 → ゲートスキップ） */
  hasPinHash: boolean;
  userName: string;
  accentColor: string;
  children: React.ReactNode;
};

const SESSION_KEY = (uid: string) => `pin_verified_${uid}`;

export function PinGate({ userId, hasPinHash, userName, accentColor, children }: Props) {
  const [verified, setVerified] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId || !hasPinHash) {
      // 未ログイン or PIN未設定はゲートスキップ
      setVerified(true);
      setReady(true);
      return;
    }
    // sessionStorage: ブラウザを閉じると消える（タブを閉じるまでは維持）
    const already = sessionStorage.getItem(SESSION_KEY(userId)) === "1";
    setVerified(already);
    setReady(true);
  }, [userId, hasPinHash]);

  function handleVerified() {
    if (userId) sessionStorage.setItem(SESSION_KEY(userId), "1");
    setVerified(true);
  }

  if (!ready) return null;

  if (!verified) {
    return (
      <PinScreen
        userName={userName}
        accentColor={accentColor}
        onVerified={handleVerified}
      />
    );
  }

  return <>{children}</>;
}
