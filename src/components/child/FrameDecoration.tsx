import { ThemeKey } from "@/lib/theme/themes";

// Okozukai-Home.html の watercolor blobs (rei_blue) と halftone+burst (jun_red) を再現。
// child/layout.tsx の外枠div内に absolute 配置し、z-index:0でコンテンツ(z-index:1)の背後に置く。
export function FrameDecoration({ themeKey }: { themeKey: ThemeKey }) {
  if (themeKey === "rei_blue") {
    return (
      <>
        {/* 右上の大きなブロブ */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -50,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "54% 60% 52% 48%",
            background: "rgba(255,255,255,0.34)",
            filter: "blur(1px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* 左上の中ブロブ */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 60,
            left: -60,
            width: 160,
            height: 160,
            borderRadius: "62% 44% 58% 50%",
            background: "rgba(255,255,255,0.22)",
            filter: "blur(2px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* 右中段の小ブロブ */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 260,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: "48% 58% 62% 44%",
            background: "rgba(255,255,255,0.18)",
            filter: "blur(1px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* 左下の小ブロブ */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 120,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: "55% 45% 50% 60%",
            background: "rgba(255,255,255,0.16)",
            filter: "blur(2px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </>
    );
  }

  if (themeKey === "jun_red") {
    return (
      <>
        {/* ハーフトーン dot pattern（SVG背景） */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "13px 13px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* バースト円 */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -80,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,80,60,0.55) 0%, rgba(220,30,30,0.0) 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </>
    );
  }

  return null;
}
