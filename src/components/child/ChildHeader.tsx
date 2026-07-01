// HANDOFF.md §3-1: ヘッダー(アバター＋名前 | 所持金合計（右上・大きく）)
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
        padding: "18px 18px 6px",
        fontFamily: theme.fontFamily,
        color: "#fff",
      }}
    >
      {/* 左：アバター＋名前 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: theme.cardRadius >= 20 ? "50%" : 12,
            background: theme.cardBg,
            border: theme.cardBorder !== "none" ? theme.cardBorder : "2.5px solid #fff",
            boxShadow: theme.cardShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
            color: theme.accentInk,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- モックのdata URL表示のため
            <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            name.slice(0, 1)
          )}
        </div>
        <div style={{ fontWeight: theme.headingWeight, fontSize: 17 }}>{name}</div>
      </div>

      {/* 右：もってる金額（大きく・強調） */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, marginBottom: 1 }}>もってる</div>
        <div style={{ fontWeight: 900, fontSize: 26, lineHeight: 1, color: "#fff", letterSpacing: "-0.5px" }}>
          {new Intl.NumberFormat("ja-JP").format(total)}
          <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 2 }}>えん</span>
        </div>
      </div>

      {/* 右端スロット（きりかえボタン等） */}
      {children}
    </header>
  );
}
