// 汎用の確認ポップアップ（はい/いいえの2択）。
import { ChildTheme } from "@/lib/theme/childTheme";

export function ConfirmPopup({
  theme,
  title,
  message,
  confirmLabel = "うん",
  cancelLabel = "やめる",
  onConfirm,
  onCancel,
}: {
  theme: ChildTheme;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      onClick={onCancel}
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
        <h3 style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              border: `1px solid ${theme.sub}`,
              color: theme.sub,
              borderRadius: 20,
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: theme.accent,
              color: "#fff",
              borderRadius: 20,
              padding: "10px 0",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
