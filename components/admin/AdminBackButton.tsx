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
      className="inline-flex items-center rounded-2xl border border-[#cfeaf6] bg-white px-4 py-2 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
    >
      ← {label}
    </Link>
  );
}