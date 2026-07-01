"use client";

import { useEffect, useRef, useState } from "react";

const THRESHOLD = 70; // px引っ張ったら発動

export function PullToRefresh() {
  const [pullY, setPullY] = useState(0); // 0〜THRESHOLD
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      // スクロール最上部でのみ有効
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || startY.current === null) return;
      if (window.scrollY > 0) { pulling.current = false; return; }
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) { setPullY(0); return; }
      // 引っ張り抵抗感（ルート圧縮）
      setPullY(Math.min(THRESHOLD, Math.sqrt(delta) * 4.5));
    }

    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      startY.current = null;
      if (pullY >= THRESHOLD - 2) {
        setRefreshing(true);
        window.location.reload();
      } else {
        setPullY(0);
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullY]);

  const progress = pullY / THRESHOLD; // 0〜1
  const ready = progress >= 0.98;

  if (pullY === 0 && !refreshing) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        transform: `translateY(${refreshing ? THRESHOLD : pullY - THRESHOLD}px)`,
        transition: refreshing ? "transform .2s" : "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transform: `rotate(${refreshing ? 0 : progress * 360}deg)`,
          transition: refreshing ? "transform .6s linear" : "none",
          animation: refreshing ? "ptr-spin .6s linear infinite" : "none",
        }}
      >
        {refreshing ? "⟳" : ready ? "↑" : "↓"}
      </div>
      <style>{`
        @keyframes ptr-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
