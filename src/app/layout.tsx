import type { Metadata } from "next";
import "./globals.css";
import { zenMaru, rocknroll } from "./fonts";
import { MockProviders } from "@/lib/mock/MockProviders";

export const metadata: Metadata = {
  title: "おこづかいアプリ",
  description: "れい・じゅん きょうだいの おこづかい かんりアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${zenMaru.variable} ${rocknroll.variable}`}>
        <MockProviders>{children}</MockProviders>
      </body>
    </html>
  );
}
