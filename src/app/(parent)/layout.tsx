export default function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div data-theme="parent_dark">{children}</div>;
}
