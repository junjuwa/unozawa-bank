import { ChildTheme, ThemeKey } from "@/lib/theme/childTheme";

type ChildHeaderProps = {
  theme: ChildTheme;
  themeKey: ThemeKey;
  name: string;
  total: number;
  avatarUrl?: string | null;
  onSwitchUser?: () => void;
};

function BalanceBadge({ total, themeKey }: { total: number; themeKey: ThemeKey }) {
  const fmt = "¥" + total.toLocaleString("ja-JP");
  if (themeKey === "jun_red") {
    return (
      <div style={{ background: "#FFD23F", border: "3px solid #111", borderRadius: 10, boxShadow: "3px 3px 0 #111", transform: "rotate(3deg)", padding: "8px 14px", textAlign: "center", flexShrink: 0 }}>
        <div style={{ font: "400 9px 'RocknRoll One'", color: "#111" }}>もってる</div>
        <div style={{ font: "400 22px 'RocknRoll One'", color: "#E2231A", lineHeight: 1.05, textShadow: "1px 1px 0 #111" }}>{fmt}</div>
      </div>
    );
  }
  return (
    <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 14, boxShadow: "0 3px 10px rgba(0,0,0,.18)", padding: "8px 14px", textAlign: "right", flexShrink: 0 }}>
      <div style={{ font: "700 9px 'Zen Maru Gothic'", color: "#2c6f96" }}>もってる</div>
      <div style={{ font: "900 22px 'Zen Maru Gothic'", color: "#1B3A6B", lineHeight: 1.05 }}>{fmt}</div>
    </div>
  );
}

export function ChildHeader({ theme, themeKey, name, total, avatarUrl, onSwitchUser }: ChildHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px 6px",
        fontFamily: theme.fontFamily,
        gap: 8,
      }}
    >
      {/* 左：アバター（タップでユーザ切り替え）＋名前 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: theme.cardRadius >= 20 ? "50%" : 10,
              background: theme.cardBg,
              border: theme.cardBorder !== "none" ? theme.cardBorder : "2.5px solid rgba(255,255,255,.7)",
              boxShadow: theme.cardShadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 17,
              color: theme.accentInk,
              overflow: "hidden",
              cursor: onSwitchUser ? "pointer" : "default",
            }}
            onClick={onSwitchUser}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or remote URL
              <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              name.slice(0, 1)
            )}
          </div>
          {/* きりかえバッジ */}
          {onSwitchUser && (
            <div
              onClick={onSwitchUser}
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(255,255,255,.92)",
                border: "1.5px solid rgba(255,255,255,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,.2)",
              }}
            >
              🔄
            </div>
          )}
        </div>
        <div
          style={{
            fontWeight: theme.headingWeight,
            fontSize: 18,
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      </div>

      {/* 右：もってる金額パネル */}
      <BalanceBadge total={total} themeKey={themeKey} />
    </header>
  );
}
