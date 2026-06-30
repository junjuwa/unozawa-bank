// HANDOFF.md §3/§8: マスコット帯。案内・応援・祝福をひらがな短文で。
// れい/じゅんはClaude designで作成したイラスト(mascotArt.ts)を使用。
import { ChildTheme } from "@/lib/theme/childTheme";
import { ThemeKey } from "@/lib/theme/themes";
import { MASCOT_SVG } from "@/components/child/mascotArt";

export function Mascot({
  theme,
  themeKey,
  message,
  imageUrl,
}: {
  theme: ChildTheme;
  themeKey: ThemeKey;
  message: string;
  imageUrl?: string | null;
}) {
  const svg = themeKey === "rei_blue" || themeKey === "jun_red" ? MASCOT_SVG[themeKey] : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 18px 10px",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL / Storage URL表示のため
        <img
          src={imageUrl}
          alt=""
          style={{ flexShrink: 0, width: 80, height: 80, objectFit: "contain" }}
        />
      ) : svg ? (
        <div
          style={{ flexShrink: 0, width: 48, height: 56 }}
          // 静的な信頼済みアセット(mascotArt.ts)のみを描画する。ユーザー入力は含まれない。
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <svg viewBox="0 0 48 48" width={48} height={48} style={{ flexShrink: 0 }}>
          <circle cx="24" cy="24" r="22" fill={theme.accent} stroke="#fff" strokeWidth={2} />
          <circle cx="17" cy="20" r="3" fill="#fff" />
          <circle cx="31" cy="20" r="3" fill="#fff" />
          <path d="M15 29q9 8 18 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
        </svg>
      )}
      <div
        style={{
          background: theme.cardBg,
          color: theme.ink,
          borderRadius: theme.cardRadius / 2,
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: "8px 14px",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {message}
      </div>
    </div>
  );
}
