import Link from "next/link";

type Props = {
  title: string;
  value: number;
  subtitle: string;
  href: string;
};

export default function AdminQuickStat({
  title,
  value,
  subtitle,
  href,
}: Props) {
  return (
    <Link
      href={href}
      className="block rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_10px_30px_var(--shadow)] transition hover:-translate-y-1 hover:border-[var(--primary)]"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {title}
      </p>

      <h3 className="mt-5 text-5xl font-extrabold text-[var(--text)]">
        {value}
      </h3>

      <p className="mt-4 text-[15px] text-[var(--text-soft)]">{subtitle}</p>
    </Link>
  );
}