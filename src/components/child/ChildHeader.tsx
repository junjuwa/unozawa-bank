type ChildHeaderProps = {
  name: string;
  children?: React.ReactNode;
};

export function ChildHeader({ name, children }: ChildHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4">
      <span
        className="text-2xl font-extrabold"
        style={{ color: "var(--color-primary)" }}
      >
        {name}
      </span>
      {children}
    </header>
  );
}
