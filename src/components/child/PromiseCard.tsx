import type { ChildTheme } from "@/lib/theme/childTheme";
import type { PromiseItem } from "@/lib/content/promises";

const CARD_COLORS: Record<string, { rei: string; jun: string; text?: string }> = {
  money: { rei: "linear-gradient(135deg,#FFE07A,#FFC53F)", jun: "#FFD23F", text: "#8A5A00" },
  think: { rei: "linear-gradient(135deg,#8FD3F4,#5CB3E6)", jun: "#1B6CD9" },
  work:  { rei: "linear-gradient(135deg,#FF9E8C,#FF7E6B)", jun: "#E2231A" },
  grow:  { rei: "linear-gradient(135deg,#7FE0A8,#3DB66E)", jun: "#1B9E5A" },
  self:  { rei: "linear-gradient(135deg,#B7A6F0,#8C74E0)", jun: "#7A5CD0" },
};

// Seal SVG (circle-check outline)
const SealSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

interface Props {
  theme: ChildTheme;
  isJun: boolean;
  item: PromiseItem;
  index: number;
}

export function PromiseCard({ theme, isJun, item, index }: Props) {
  const colors = CARD_COLORS[item.cardClass] ?? CARD_COLORS.money;
  const iconBg = isJun ? colors.jun : colors.rei;
  const iconColor = isJun
    ? (item.cardClass === "money" ? "#111" : "#fff")
    : (colors.text ?? "#fff");

  const isJunBorder = isJun;

  return (
    <section
      style={{
        position: "relative",
        background: theme.cardBg,
        border: theme.cardBorder !== "none" ? theme.cardBorder : "none",
        borderRadius: theme.cardRadius,
        boxShadow: theme.cardShadow,
        padding: "1.6rem 1.4rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "0.9rem",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* その N ラベル */}
      <span
        style={{
          position: "absolute",
          top: "1rem",
          left: "1.15rem",
          font: `${theme.headingWeight} 0.78rem ${theme.fontFamily}`,
          letterSpacing: "0.1em",
          color: theme.sub,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        その{" "}
        <b style={{ fontSize: "1.15rem", color: theme.accentInk, lineHeight: 1 }}>
          {index + 1}
        </b>
      </span>

      {/* チェックシール */}
      <span
        style={{
          position: "absolute",
          top: "0.85rem",
          right: "1.1rem",
          color: theme.numColor,
          opacity: 0.85,
        }}
      >
        <SealSvg />
      </span>

      {/* アイコン */}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: isJunBorder ? 16 : 24,
          marginTop: "0.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
          background: iconBg,
          boxShadow: isJunBorder ? "3px 3px 0 #111" : "0 8px 16px rgba(27,58,107,.16)",
          border: isJunBorder ? "3px solid #111" : "none",
          flexShrink: 0,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          dangerouslySetInnerHTML={{ __html: item.iconSvg }}
        />
      </div>

      {/* タイトル */}
      <h3
        style={{
          margin: 0,
          font: `${theme.headingWeight} 1.28rem ${theme.fontFamily}`,
          color: theme.ink,
          lineHeight: 1.7,
          // カード内タイトルは白地なので影なし（titleShadowはヘッダー用）
        }}
        dangerouslySetInnerHTML={{ __html: item.title }}
      />

      {/* 補足ノート */}
      {item.note && (
        <p
          style={{
            margin: 0,
            font: `700 0.82rem ${theme.fontFamily}`,
            color: theme.sub,
            lineHeight: 1.9,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: isJunBorder ? "#fff" : theme.hair,
            border: isJunBorder ? "2px solid #111" : "none",
            borderRadius: isJunBorder ? 8 : 999,
            padding: "0.4rem 0.9rem",
            fontWeight: isJunBorder ? 400 : 700,
          }}
        >
          {item.noteSvgPath && (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
              dangerouslySetInnerHTML={{ __html: item.noteSvgPath }}
            />
          )}
          <span dangerouslySetInnerHTML={{ __html: item.note }} />
        </p>
      )}
    </section>
  );
}
