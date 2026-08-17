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
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
            Gestión de favoritos
          </h1>

          <p className="mt-2 hidden max-w-3xl text-[var(--text-soft)] sm:block">
            Ranking de productos guardados por los usuarios.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/favoritos"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              Ver tienda
            </Link>
          </div>
        </div>

        <section className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] sm:rounded-[28px] sm:p-5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:text-sm sm:normal-case sm:tracking-normal">
              Favoritos
            </p>

            <p className="mt-3 text-2xl font-black text-[var(--primary)] sm:text-3xl">
              {totalFavorites}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] sm:rounded-[28px] sm:p-5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:text-sm sm:normal-case sm:tracking-normal">
              Productos
            </p>

            <p className="mt-3 text-2xl font-black text-[var(--primary)] sm:text-3xl">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] sm:rounded-[28px] sm:p-5">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:text-sm sm:normal-case sm:tracking-normal">
              Top
            </p>

            <p className="mt-3 text-2xl font-black text-[var(--primary)] sm:text-3xl">
              {mostPopular?.count || 0}
            </p>
          </div>
        </section>

        {mostPopular && (
          <section className="mb-5 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_26px_var(--shadow)] sm:p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Producto más popular
            </p>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="line-clamp-1 text-xl font-black text-[var(--text)]">
                  {mostPopular.title}
                </h2>

                <p className="mt-1 text-sm font-bold text-[var(--primary)]">
                  {mostPopular.count} favorito(s)
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-extrabold text-[var(--primary)]">
                #1
              </span>
            </div>
          </section>
        )}

        <div className="mb-5 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_26px_var(--shadow)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="h-12 w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)] sm:h-14"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[var(--text-muted)]">
            <span>
              {filteredProducts.length} de {productStats.length} productos
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[var(--primary)] transition hover:text-[var(--primary-dark)]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
          {filteredProducts.length === 0 ? (
            <div className="rounded-[24px] bg-[var(--surface)] px-4 py-10 text-center shadow-[0_8px_22px_var(--shadow)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--surface-soft)] text-2xl text-[var(--primary)]">
                ♥
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-[var(--text)]">
                No hay favoritos todavía
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-soft)]">
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
                    className="rounded-[24px] border border-transparent bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_26px_var(--shadow-strong)] sm:rounded-[28px] sm:p-5"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[20px] bg-[var(--surface-soft)] sm:h-28 sm:w-24">
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
                          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-[0.65rem] font-black text-[var(--primary)] sm:text-xs">
                            #{index + 1}
                          </span>

                          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:text-xs">
                            {categoryLabel(product.category)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] sm:text-xs ${
                              product.status === "preventa"
                                ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                                : "bg-[var(--success-bg)] text-[var(--success)]"
                            }`}
                          >
                            {statusLabel(product.status)}
                          </span>
                        </div>

                        <h2 className="mt-3 line-clamp-2 text-[1rem] font-extrabold leading-5 text-[var(--text)] sm:text-xl sm:leading-7">
                          {product.title}
                        </h2>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-base font-black text-[var(--primary)] sm:text-lg">
                            {formatBs(product.price)}
                          </p>

                          <p className="shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-extrabold text-[var(--primary)]">
                            ♥ {product.count}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
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