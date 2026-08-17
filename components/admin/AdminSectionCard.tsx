import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
  buttonLabel?: string;
};

export default function AdminSectionCard({
  title,
  description,
  href,
  buttonLabel = "Entrar",
}: Props) {
  return (
    <article className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_10px_30px_var(--shadow)]">
      <h3 className="text-[1.1rem] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {title}
      </h3>

      <p className="mt-6 min-h-[72px] text-[15px] leading-8 text-[var(--text-soft)]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]"
      >
        {buttonLabel}
      </Link>
    </article>
  );
}