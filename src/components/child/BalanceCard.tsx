type BalanceCardProps = {
  label: string;
  emoji: string;
  amount: number;
};

export function BalanceCard({ label, emoji, amount }: BalanceCardProps) {
  return (
    <div
      className="rounded-[var(--radius-card)] border-2 p-5 flex items-center gap-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <span className="text-4xl">{emoji}</span>
      <div>
        <p className="text-sm font-bold opacity-80">{label}</p>
        <p className="text-3xl font-extrabold">
          {new Intl.NumberFormat("ja-JP").format(amount)}円
        </p>
      </div>
    </div>
  );
}
