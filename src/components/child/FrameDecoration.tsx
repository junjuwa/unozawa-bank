import React from "react";
import type { ThemeKey } from "@/lib/theme/childTheme";

export function FrameDecoration({ themeKey }: { themeKey: ThemeKey }) {
  const base: React.CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" };

  if (themeKey === "jun_red") {
    return (
      <div style={base} aria-hidden>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.16) 1.6px, transparent 1.7px)", backgroundSize: "13px 13px" }} />
        <div style={{ position: "absolute", top: -90, right: -90, width: 320, height: 320, borderRadius: "50%",
          background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,.14) 0deg 3deg, transparent 3deg 9deg)",
          WebkitMaskImage: "radial-gradient(circle,#000 30%,transparent 62%)", maskImage: "radial-gradient(circle,#000 30%,transparent 62%)" }} />
        <div style={{ position: "absolute", bottom: -110, left: -110, width: 300, height: 300, borderRadius: "50%",
          background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,210,63,.16) 0deg 3deg, transparent 3deg 9deg)",
          WebkitMaskImage: "radial-gradient(circle,#000 30%,transparent 62%)", maskImage: "radial-gradient(circle,#000 30%,transparent 62%)" }} />
      </div>
    );
  }
  if (themeKey === "rei_blue") {
    const blob = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", borderRadius: "50%", filter: "blur(28px)", ...s });
    return (
      <div style={base} aria-hidden>
        <span style={blob({ width: 200, height: 200, background: "rgba(255,255,255,.55)", top: -40, left: -30 })} />
        <span style={blob({ width: 180, height: 180, background: "rgba(255,126,107,.10)", bottom: -40, right: -20 })} />
        <span style={blob({ width: 150, height: 150, background: "rgba(255,210,63,.15)", top: 120, right: 40 })} />
        <span style={blob({ width: 120, height: 120, background: "rgba(255,255,255,.4)", bottom: 120, left: 40 })} />
      </div>
    );
  }
  return <div style={base} aria-hidden />;
}
