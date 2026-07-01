import type { Metadata } from "next";
import "./globals.css";
import { zenMaru, rocknroll } from "./fonts";
import { MockProviders } from "@/lib/mock/MockProviders";

export const metadata: Metadata = {
  title: "UNOZAWA BANK",
  description: "れい・じゅん きょうだいの おこづかい かんりアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UNOZAWA BANK",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
        <meta name="apple-mobile-web-app-title" content="UNOZAWA BANK" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D1117" />
      </head>
      <body className={`${zenMaru.variable} ${rocknroll.variable}`}>
        <MockProviders>{children}</MockProviders>
      </body>
    </html>
  );
}
