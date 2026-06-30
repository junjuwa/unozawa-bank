// おしごとの完了条件をポップアップ表示する簡易モーダル。
import { ChildTheme } from "@/lib/theme/childTheme";

export function ConditionPopup({
  theme,
  jobName,
  condition,
  onClose,
}: {
  theme: ChildTheme;
  jobName: string;
  condition: string;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.cardBg,
          color: theme.ink,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: 20,
          maxWidth: 320,
          width: "100%",
          fontFamily: theme.fontFamily,
        }}
      >
        <h3 style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{jobName}</h3>
        <div style={{ fontSize: 11, fontWeight: 700, color: theme.sub, marginBottom: 8 }}>
          かんりょう じょうけん
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{condition}</p>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            background: theme.accent,
            color: "#fff",
            borderRadius: 20,
            padding: "10px 0",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          とじる
        </button>
      </div>
    </div>
  );
}
