// HANDOFF.md §3/§8: マスコット帯。案内・応援・祝福をひらがな短文で。
// 本物のキャラ画像は将来差し替え（image-slot相当）。今は簡易な顔つき円で表現。
import { ChildTheme } from "@/lib/theme/childTheme";

export function Mascot({ theme, message }: { theme: ChildTheme; message: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 18px 10px",
      }}
    >
      <svg viewBox="0 0 48 48" width={48} height={48} style={{ flexShrink: 0 }}>
        <circle cx="24" cy="24" r="22" fill={theme.accent} stroke="#fff" strokeWidth={2} />
        <circle cx="17" cy="20" r="3" fill="#fff" />
        <circle cx="31" cy="20" r="3" fill="#fff" />
        <path d="M15 29q9 8 18 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
      </svg>
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
