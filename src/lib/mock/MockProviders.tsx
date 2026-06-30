"use client";

// MOCK ONLY: (child)/(parent) 両ルートグループで同じモック状態を共有するため、
// ルートlayoutに引き上げて1か所でラップする。本実装では全て削除し、
// 各画面がSupabaseから直接データ取得する形に置き換える。

import { MockChildThemeProvider } from "@/lib/theme/MockChildThemeContext";
import { MockBalancesProvider } from "@/lib/mock/MockBalancesContext";
import { MockJobsProvider } from "@/lib/mock/MockJobsContext";
import { MockSettingsProvider } from "@/lib/mock/MockSettingsContext";
import { MockAvatarsProvider } from "@/lib/mock/MockAvatarsContext";

export function MockProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockChildThemeProvider>
      <MockBalancesProvider>
        <MockJobsProvider>
          <MockSettingsProvider>
            <MockAvatarsProvider>{children}</MockAvatarsProvider>
          </MockSettingsProvider>
        </MockJobsProvider>
      </MockBalancesProvider>
    </MockChildThemeProvider>
  );
}
