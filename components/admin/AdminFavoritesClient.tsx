"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";

export type ProductFavoriteStat = {
  productId: string;
  title: string;
  category: string;
  price?: number;
  status?: string;
  mainImage?: string;
  slug?: string;
  count: number;
};

type AdminFavoritesClientProps = {
  productStats: ProductFavoriteStat[];
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

function categoryLabel(value?: string) {
  if (!value) return "Sin categoría";

  const labels: Record<string, string> = {
    cosplays: "Cosplays",
    pelucas: "Pelucas",
    lentes: "Lentes",
    mallas: "Mallas",
    accesorios: "Accesorios",
    preventa: "Preventa",
  };

  return labels[value] || value;
}

function statusLabel(value?: string) {
  if (value === "preventa") return "Preventa";
  if (value === "stock") return "Stock";
  return "Sin estado";
}

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";

  const value = src.trim();

  return value || "/placeholder-product.png";
}

export default function AdminFavoritesClient({
  productStats,
}: AdminFavoritesClientProps) {
  const [search, setSearch] = useState("");

  const totalFavorites = productStats.reduce(
    (acc, product) => acc + product.count,
    0
  );

  const totalProducts = productStats.length;
  const mostPopular = productStats[0];
  const maxFavorites = mostPopular?.count || 1;

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return productStats;

    return productStats.filter((product) => {
      const searchableText = [
        product.title,
        product.slug,
        categoryLabel(product.category),
        statusLabel(product.status),
        formatBs(product.price),
        `${product.count} favoritos`,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [productStats, search]);

  return (
    <main className="min-h-screen bg-[#eef9ff] px-4 py-6 text-[#16324a] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#16324a] sm:text-4xl">
            Gestión de favoritos
          </h1>

          <p className="mt-2 hidden max-w-3xl text-[#4b6b80] sm:block">
            Ranking de productos guardados por los usuarios.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-3 text-xs font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/favoritos"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-3 text-xs font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:h-12 sm:px-5 sm:text-sm"
            >
              Ver tienda
            </Link>
          </div>
        </div>

        <section className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-[24px] border border-[#cfeaf6] bg-white p-4 shadow-[0_8px_22px_rgba(22,50,74,0.04)] sm:rounded-[28px] sm:p-5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#6f8798] sm:text-sm sm:normal-case sm:tracking-normal">
              Favoritos
            </p>

            <p className="mt-3 text-2xl font-black text-[#19b7c9] sm:text-3xl">
              {totalFavorites}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#cfeaf6] bg-white p-4 shadow-[0_8px_22px_rgba(22,50,74,0.04)] sm:rounded-[28px] sm:p-5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#6f8798] sm:text-sm sm:normal-case sm:tracking-normal">
              Productos
            </p>

            <p className="mt-3 text-2xl font-black text-[#19b7c9] sm:text-3xl">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#cfeaf6] bg-white p-4 shadow-[0_8px_22px_rgba(22,50,74,0.04)] sm:rounded-[28px] sm:p-5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#6f8798] sm:text-sm sm:normal-case sm:tracking-normal">
              Top
            </p>

            <p className="mt-3 text-2xl font-black text-[#19b7c9] sm:text-3xl">
              {mostPopular?.count || 0}
            </p>
          </div>
        </section>

        {mostPopular && (
          <section className="mb-5 rounded-[28px] border border-[#cfeaf6] bg-white p-4 shadow-[0_10px_26px_rgba(22,50,74,0.05)] sm:p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#6f8798]">
              Producto más popular
            </p>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="line-clamp-1 text-xl font-black text-[#16324a]">
                  {mostPopular.title}
                </h2>

                <p className="mt-1 text-sm font-bold text-[#19b7c9]">
                  {mostPopular.count} favorito(s)
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#eaf8ff] px-4 py-2 text-sm font-extrabold text-[#19b7c9]">
                #1
              </span>
            </div>
          </section>
        )}

        <div className="mb-5 rounded-[26px] border border-[#cfeaf6] bg-white p-3 shadow-[0_10px_26px_rgba(22,50,74,0.05)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a98aa]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="h-12 w-full rounded-[20px] border border-[#cfeaf6] bg-[#f7fdff] pl-11 pr-4 text-sm font-semibold text-[#16324a] outline-none transition placeholder:text-[#8ba4b3] focus:border-[#19b7c9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)] sm:h-14"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[#7a96a7]">
            <span>
              {filteredProducts.length} de {productStats.length} productos
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[#19b7c9] transition hover:text-[#0ea5b7]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <section className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-4 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:rounded-[32px] sm:p-6">
          {filteredProducts.length === 0 ? (
            <div className="rounded-[24px] bg-white px-4 py-10 text-center shadow-[0_8px_22px_rgba(22,50,74,0.04)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#eaf8ff] text-2xl text-[#19b7c9]">
                ♥
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-[#16324a]">
                No hay favoritos todavía
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#4b6b80]">
                Cuando los usuarios guarden productos como favoritos, aquí
                aparecerá el ranking.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredProducts.map((product, index) => {
                const percentage = Math.max(
                  8,
                  Math.round((product.count / maxFavorites) * 100)
                );

                return (
                  <article
                    key={product.productId}
                    className="rounded-[24px] border border-transparent bg-white p-4 shadow-[0_8px_22px_rgba(22,50,74,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#19b7c9] hover:shadow-[0_12px_26px_rgba(22,50,74,0.08)] sm:rounded-[28px] sm:p-5"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[20px] bg-[#eaf8ff] sm:h-28 sm:w-24">
                        <img
                          src={getSafeImage(product.mainImage)}
                          alt={product.title}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src =
                              "/placeholder-product.png";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-[0.65rem] font-black text-[#19b7c9] sm:text-xs">
                            #{index + 1}
                          </span>

                          <span className="rounded-full bg-[#f2f8fb] px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-[#6f8798] sm:text-xs">
                            {categoryLabel(product.category)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] sm:text-xs ${
                              product.status === "preventa"
                                ? "bg-[#fff3dc] text-[#b87d00]"
                                : "bg-[#e6f6ed] text-[#16824c]"
                            }`}
                          >
                            {statusLabel(product.status)}
                          </span>
                        </div>

                        <h2 className="mt-3 line-clamp-2 text-[1rem] font-extrabold leading-5 text-[#16324a] sm:text-xl sm:leading-7">
                          {product.title}
                        </h2>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-base font-black text-[#19b7c9] sm:text-lg">
                            {formatBs(product.price)}
                          </p>

                          <p className="shrink-0 rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-extrabold text-[#19b7c9]">
                            ♥ {product.count}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="h-3 overflow-hidden rounded-full bg-[#eaf8ff]">
                        <div
                          className="h-full rounded-full bg-[#19b7c9]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}