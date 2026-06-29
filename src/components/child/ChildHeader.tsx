// HANDOFF.md §3-1: ヘッダー(アバター＋名前＋所持金)
import { ChildTheme } from "@/lib/theme/childTheme";

type ChildHeaderProps = {
  theme: ChildTheme;
  name: string;
  total: number;
  children?: React.ReactNode;
};

export function ChildHeader({ theme, name, total, children }: ChildHeaderProps) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* アバター画像プレースホルダ(image-slot代替) */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: theme.cardRadius >= 20 ? "50%" : 12,
            background: theme.cardBg,
            border: theme.cardBorder !== "none" ? theme.cardBorder : "3px solid #fff",
            boxShadow: theme.cardShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 20,
            color: theme.accentInk,
            flexShrink: 0,
          }}
        >
          {name.slice(0, 1)}
        </div>
        <div>
          <div style={{ fontWeight: theme.headingWeight, fontSize: 18 }}>{name}</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            もってる ¥{new Intl.NumberFormat("ja-JP").format(total)}
          </div>
        </div>
      </div>
      {children}
    </header>
  );
}
