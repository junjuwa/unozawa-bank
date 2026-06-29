import { Zen_Maru_Gothic, RocknRoll_One } from "next/font/google";

// れい(水彩トロピカル)用の丸ゴシック
export const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-rei",
});

// じゅん(アメコミヒーロー)用の極太フォント
export const rocknroll = RocknRoll_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jun",
});
