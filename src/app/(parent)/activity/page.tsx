"use client";

import { childThemes } from "@/lib/theme/childTheme";
import { useFamilyActivity, TYPE_LABEL } from "@/hooks/useFamilyActivity";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const KIND_LABEL: Record<string, string> = { spend: "つかう", save: "ためる", grow: "ふやす" };
const TYPE_COLOR: Record<string, string> = {
  salary:     "#3DB66E",
  job_reward: "#5B8DEF",
  transfer:   "#9AA3B0",
  interest:   "#F0A800",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ActivityPage() {
  const theme = childThemes.parent_dark;
  const { entries, loading, refetch } = useFamilyActivity();

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontWeight: 800, fontSize: 18 }}>活動ログ</h1>
        <button
          type="button"
          onClick={refetch}
          style={{ fontSize: 12, fontWeight: 700, color: theme.sub, background: "none", border: "1px solid #3A424C", borderRadius: 10, padding: "4px 10px", cursor: "pointer" }}
        >
          更新
        </button>
      </div>

      {!entries || entries.length === 0 ? (
        <p style={{ color: theme.sub, fontSize: 14, marginTop: 20, textAlign: "center" }}>
          まだ記録がありません
        </p>
      ) : (
        entries.map((e) => {
          const typeColor = TYPE_COLOR[e.type] ?? "#9AA3B0";
          const directionText = e.type === "transfer" && e.fromKind && e.toKind
            ? `${KIND_LABEL[e.fromKind] ?? e.fromKind} → ${KIND_LABEL[e.toKind] ?? e.toKind}`
            : e.toKind ? KIND_LABEL[e.toKind] ?? e.toKind : "";

          return (
            <div
              key={e.id}
              style={{
                background: theme.cardBg,
                border: "1px solid #2A3340",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {/* 種別バッジ */}
              <div
                style={{
                  background: typeColor + "22",
                  color: typeColor,
                  border: `1.5px solid ${typeColor}55`,
                  borderRadius: 8,
                  padding: "3px 8px",
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {TYPE_LABEL[e.type] ?? e.type}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: typeColor }}>
                    +{new Intl.NumberFormat("ja-JP").format(e.amount)}円
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: theme.ink }}>{e.displayName}</span>
                  {directionText && (
                    <span style={{ fontSize: 11, color: theme.sub }}>{directionText}</span>
                  )}
                </div>
                {e.memo && (
                  <div style={{ fontSize: 12, color: theme.sub, marginTop: 2 }}>{e.memo}</div>
                )}
                <div style={{ fontSize: 11, color: "#4A5568", marginTop: 3 }}>{formatDate(e.createdAt)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
