import Image from "next/image";

type ProductCardProps = {
  name: string;
  price: number;
  image: string;
  status: "stock" | "preventa";
  category: string;
};

export default function ProductCard({
  name,
  price,
  image,
  status,
  category,
}: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative">
        <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image
            src={image || "/placeholder-product.png"}
            alt={name}
            width={600}
            height={750}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${
            status === "stock" ? "bg-emerald-600" : "bg-amber-500"
          }`}
        >
          {status === "stock" ? "En stock" : "Preventa"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {category}
        </p>

        <h3 className="line-clamp-2 text-base font-semibold text-neutral-900">
          {name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-pink-600">Bs.{price}</span>
          <button className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Añadir
          </button>
        </div>
      </div>
    </article>
  );
}