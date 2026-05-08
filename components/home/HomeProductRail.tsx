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
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[2rem] font-extrabold leading-tight tracking-tight text-[#16324a] sm:text-[2.3rem] lg:text-[2.6rem]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#4b6b80]">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={viewAllHref}
          className="hidden shrink-0 rounded-2xl border border-[#cfeaf6] bg-white px-6 py-3 text-sm font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:inline-flex"
        >
          Ver todo
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5">
        {products.map((product) => (
          <Link
            key={`${product.title}-${product.href}`}
            href={product.href}
            className="group relative w-[230px] shrink-0 overflow-hidden rounded-[24px] border border-[#d9eef7] bg-white shadow-[0_10px_28px_rgba(22,50,74,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,50,74,0.1)] sm:w-[270px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#eaf8ff]">
              {product.badge && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ff5f7a] px-4 py-2 text-xs font-extrabold text-white shadow-sm">
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
              <h3 className="line-clamp-2 min-h-[52px] text-[1rem] font-extrabold leading-6 text-[#16324a]">
                {product.title}
              </h3>

              <div className="mt-4">
                {product.oldPrice && (
                  <p className="text-sm font-bold text-[#8ba4b3] line-through">
                    {product.oldPrice}
                  </p>
                )}

                <p className="mt-1 text-[1.25rem] font-black text-[#16324a]">
                  {product.price}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 sm:hidden">
        <Link
          href={viewAllHref}
          className="inline-flex rounded-2xl border border-[#cfeaf6] bg-white px-6 py-3 text-sm font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
        >
          Ver todo
        </Link>
      </div>
    </section>
  );
}