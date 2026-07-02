// HANDOFF.md §3-2: ためる(もくひょう いちらん)のカード単位。
// ホームの「ためる大カード」にも内包して使う。
import { ChildTheme, ThemeKey } from "@/lib/theme/childTheme";
import { RubyText } from "@/components/child/RubyText";
import { CoinRow } from "@/components/child/Coin";
import { GiftIcon } from "@/components/child/placeholderIcons";

export function GoalCard({
  theme,
  themeKey,
  name,
  current,
  target,
  imageUrl,
  onImageClick,
  onAchieve,
}: {
  theme: ChildTheme;
  themeKey: ThemeKey;
  name: string;
  current: number;
  target: number;
  imageUrl?: string | null;
  onImageClick?: () => void;
  onAchieve?: () => void;
}) {
  const remaining = Math.max(target - current, 0);
  const progress = Math.min(100, Math.round((current / target) * 100));

  return (
    <div style={{ color: theme.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {/* 画像プレースホルダ（image-slot代替）。onImageClickがあればタップでアップロード可能 */}
        <button
          type="button"
          onClick={onImageClick}
          disabled={!onImageClick}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            border: `2px dashed ${theme.sub}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: theme.sub,
            flexShrink: 0,
            textAlign: "center",
            overflow: "hidden",
            cursor: onImageClick ? "pointer" : "default",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- モックのdata URL表示のため
            <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <GiftIcon size={24} />
          )}
        </button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.sub }}>
            <RubyText segs={[["目標", "もくひょう"]]} />
          </div>
          <div style={{ fontSize: 18, fontWeight: theme.headingWeight >= 700 ? 900 : 700 }}>
            {name}
          </div>
        </div>
      </div>

      <div
        style={{
          height: 14,
          borderRadius: 7,
          background: theme.progressTrack,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: theme.progressFill,
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <CoinRow themeKey={themeKey} count={Math.max(1, Math.round(progress / 20))} />
        {remaining === 0 && onAchieve ? (
          <button
            type="button"
            onClick={onAchieve}
            style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: 10, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            🎉 たっせい！
          </button>
        ) : (
          <span style={{ fontSize: 14 }}>
            あと <strong style={{ fontSize: 20, color: theme.accentInk }}>{remaining}</strong>
            <RubyText segs={[["円", "えん"]]} />
          </span>
        )}
      </div>
    </div>
  );
}
