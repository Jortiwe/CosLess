import Link from "next/link";

type RailProduct = {
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  href: string;
  badge?: string;
};

type HomeProductRailProps = {
  title: string;
  subtitle?: string;
  products: RailProduct[];
  viewAllHref?: string;
};

export default function HomeProductRail({
  title,
  subtitle,
  products,
  viewAllHref = "/productos",
}: HomeProductRailProps) {
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[#16324a] sm:text-[2.6rem]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b6b80] sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={viewAllHref}
          className="hidden rounded-full border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:inline-flex"
        >
          Ver todo
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-4">
          {products.map((product) => (
            <Link
              key={product.title}
              href={product.href}
              className="group w-[230px] shrink-0 overflow-hidden rounded-[24px] bg-white shadow-[0_10px_28px_rgba(22,50,74,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(22,50,74,0.10)] sm:w-[265px] lg:w-[290px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#eaf8ff]">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#ff6b7f] px-4 py-2 text-xs font-extrabold text-white shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 min-h-[48px] text-[0.95rem] font-bold leading-6 text-[#16324a] sm:text-[1rem]">
                  {product.title}
                </h3>

                <div className="mt-3">
                  {product.oldPrice && (
                    <p className="text-sm text-[#8ba4b3] line-through">
                      {product.oldPrice}
                    </p>
                  )}

                  <p className="text-[1.15rem] font-black text-[#16324a]">
                    {product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}