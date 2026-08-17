"use client";

import Link from "next/link";

type ProductItem = {
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  href: string;
  badge?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  products: ProductItem[];
  viewAllHref: string;
};

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";

  const value = src.trim();

  if (!value) return "/placeholder-product.png";

  return value;
}

export default function HomeProductRail({
  title,
  subtitle,
  products,
  viewAllHref,
}: Props) {
  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-5 flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--text)] sm:text-[2.3rem] lg:text-[2.6rem]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-6 text-[var(--text-soft)] sm:text-base sm:leading-7">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={viewAllHref}
          className="mt-1 inline-flex shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-extrabold text-[var(--text)] shadow-[0_8px_20px_var(--shadow)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:mt-0 sm:px-6 sm:py-3 sm:text-sm"
        >
          Ver todo
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5">
        {products.map((product) => (
          <Link
            key={`${product.title}-${product.href}`}
            href={product.href}
            className="group relative w-[230px] shrink-0 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_28px_var(--shadow)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_var(--shadow-strong)] sm:w-[270px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-soft)]">
              {product.badge && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--primary-dark)] px-4 py-2 text-xs font-extrabold text-white shadow-sm">
                  {product.badge}
                </span>
              )}

              <img
                src={getSafeImage(product.image)}
                alt={product.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder-product.png";
                }}
              />
            </div>

            <div className="p-5">
              <h3 className="line-clamp-2 min-h-[52px] text-[1rem] font-extrabold leading-6 text-[var(--text)]">
                {product.title}
              </h3>

              <div className="mt-4">
                {product.oldPrice && (
                  <p className="text-sm font-bold text-[var(--text-muted)] line-through">
                    {product.oldPrice}
                  </p>
                )}

                <p className="mt-1 text-[1.25rem] font-black text-[var(--text)]">
                  {product.price}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}