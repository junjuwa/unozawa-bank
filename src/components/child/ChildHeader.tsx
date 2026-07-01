import { ChildTheme } from "@/lib/theme/childTheme";

type ChildHeaderProps = {
  theme: ChildTheme;
  name: string;
  total: number;
  avatarUrl?: string | null;
  children?: React.ReactNode;
};

export function ChildHeader({ theme, name, total, avatarUrl, children }: ChildHeaderProps) {
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
      {/* 左：アバター＋名前 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
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
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL or remote URL
            <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            name.slice(0, 1)
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

      {/* 右：もってる金額パネル（コントラスト確保） */}
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          borderRadius: 14,
          padding: "6px 12px 8px",
          boxShadow: "0 3px 10px rgba(0,0,0,.18)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, color: theme.sub, lineHeight: 1 }}>もってる</span>
        <span style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.2, color: theme.ink, letterSpacing: "-0.5px" }}>
          ¥{new Intl.NumberFormat("ja-JP").format(total)}
        </span>
      </div>

      {/* きりかえボタン等のスロット */}
      {children}
    </header>
  );
}
