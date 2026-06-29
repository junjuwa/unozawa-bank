"use client";

import { useEffect, useState } from "react";

export type ChildLayoutMode = "bottom" | "side";

const QUERY = "(min-width: 1024px) and (orientation: landscape)";

// HANDOFF.md: 横(iPadランドスケープ)=サイドナビ、縦/スマホ=ボトムナビ。
// SSR時は'bottom'を初期値にし、クライアントでmatchMediaの変化を購読する。
export function useChildLayoutMode(): ChildLayoutMode {
  const [mode, setMode] = useState<ChildLayoutMode>("bottom");

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setMode(mql.matches ? "side" : "bottom");
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return mode;
}
