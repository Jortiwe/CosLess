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
      className="block rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-8 shadow-[0_10px_30px_rgba(22,50,74,0.05)] transition hover:-translate-y-1 hover:border-[#19b7c9]"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f8798]">
        {title}
      </p>

      <h3 className="mt-5 text-5xl font-extrabold text-[#16324a]">{value}</h3>

      <p className="mt-4 text-[15px] text-[#4b6b80]">{subtitle}</p>
    </Link>
  );
}