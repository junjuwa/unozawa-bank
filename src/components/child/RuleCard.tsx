// HANDOFF.md §3-5: やくそく。アイコン＋漢字＋ルビのカード
import { ChildTheme } from "@/lib/theme/childTheme";
import { RubyText, Seg } from "@/components/child/RubyText";

export function RuleCard({ theme, icon, segs }: { theme: ChildTheme; icon: string; segs: Seg[] }) {
  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.cardRadius,
        border: theme.cardBorder,
        boxShadow: theme.cardShadow,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: theme.ink,
        fontFamily: theme.fontFamily,
      }}
    >
      <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
      <RubyText segs={segs} className="font-bold" />
    </div>
  );
}
