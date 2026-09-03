import Link from "next/link";

type Props = {
  href?: string;
  label?: string;
};

export default function AdminBackButton({
  href = "/admin",
  label = "Volver al panel admin",
}: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      ← {label}
    </Link>
  );
}