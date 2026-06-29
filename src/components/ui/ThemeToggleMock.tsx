// MOCK ONLY: ログイン実装後は不要になるテーマ切り替えUI。
// 本実装ではプロフィールのtheme_keyで自動的に決まるため、このコンポーネント自体を削除する。

import { ThemeKey } from "@/lib/theme/themes";

const OPTIONS: { key: ThemeKey; label: string }[] = [
  { key: "rei_blue", label: "れい" },
  { key: "jun_red", label: "じゅん" },
];

export function ThemeToggleMock({
  value,
  onChange,
}: {
  value: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className="rounded-full border-2 px-3 py-1 text-sm font-bold"
          style={
            value === option.key
              ? {
                  borderColor: "var(--color-primary)",
                  background: "var(--color-primary)",
                  color: "var(--color-bg)",
                }
              : { borderColor: "var(--color-accent)" }
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
