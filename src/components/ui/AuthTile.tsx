import { ChildTheme } from "@/lib/theme/childTheme";
import { AvatarIcon } from "@/components/child/placeholderIcons";

export function AuthTile({
  theme,
  avatarUrl,
  label,
  onClick,
}: {
  theme: ChildTheme;
  avatarUrl?: string | null;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        boxShadow: theme.cardShadow,
        padding: "28px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        color: theme.ink,
        fontFamily: theme.fontFamily,
        width: "100%",
      }}
    >
      {avatarUrl ? (
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- モックのdata URL表示のため */}
          <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </span>
      ) : (
        <AvatarIcon size={40} />
      )}
      <span style={{ fontWeight: 900, fontSize: 18 }}>{label}</span>
    </button>
  );
}
