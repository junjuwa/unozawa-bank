export default function ChildLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // TODO: ThemeProvider で profile.theme_key を data-theme に反映 + ヘッダー/ボトムナビ
  return <div>{children}</div>;
}
