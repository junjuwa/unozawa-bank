import type { Metadata } from "next";
import "./globals.css";
import { zenMaru, rocknroll } from "./fonts";
import { MockProviders } from "@/lib/mock/MockProviders";

export const metadata: Metadata = {
  title: "おこづかいアプリ",
  description: "れい・じゅん きょうだいの おこづかい かんりアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "おこづかい",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        {/* iOS PWA: スタンドアロンモードで開く */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="おこづかい" />
        {/* ホームスクリーンアイコン（public/icon-*.png を別途用意） */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D1117" />
      </head>
      <body className={`${zenMaru.variable} ${rocknroll.variable}`}>
        <MockProviders>{children}</MockProviders>
      </body>
    </html>
  );
}
