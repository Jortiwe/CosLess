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
    <article className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-7 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
      <h3 className="text-[1.1rem] font-extrabold uppercase tracking-[0.12em] text-[#6f8798]">
        {title}
      </h3>

      <p className="mt-6 min-h-[72px] text-[15px] leading-8 text-[#4b6b80]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
      >
        {buttonLabel}
      </Link>
    </article>
  );
}