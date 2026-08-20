"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import ProductAdminActions from "./ProductAdminActions";

type ProductItem = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  isActive?: boolean;
  isOffer?: boolean;
  isWeeklyNew?: boolean;
  isFeatured?: boolean;
  mainImage?: string;
  images?: string[];
};

type AdminProductsClientProps = {
  products: ProductItem[];
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

export default function AdminProductsClient({
  products,
}: AdminProductsClientProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return products;

    return products.filter((product) => {
      const searchableText = [
        product.title,
        product.slug,
        categoryLabel(product.category),
        statusLabel(product.status),
        formatBs(product.price),
        typeof product.stock === "number" ? `stock ${product.stock}` : "stock 0",
        product.isActive ? "activo" : "inactivo",
        product.isOffer ? "oferta" : "",
        product.isWeeklyNew ? "nuevo semanal" : "",
        product.isFeatured ? "destacado" : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [products, search]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
            Gestión de productos
          </h1>

          <p className="mt-2 hidden text-[var(--text-soft)] sm:block">
            Crea, edita y organiza productos por categoría y secciones.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/admin/productos/reporte"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Reporte</span>
              <span className="hidden sm:inline">Reporte PDF</span>
            </Link>

            <Link
              href="/admin/productos/nuevo"
              className="col-span-2 inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-3 text-xs font-extrabold text-white transition hover:bg-[var(--primary-dark)] sm:col-span-1 sm:h-12 sm:px-5 sm:text-sm"
            >
              Crear producto
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_26px_var(--shadow)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="h-12 w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)] sm:h-14 sm:placeholder:text-sm"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[var(--text-muted)]">
            <span>
              {filteredProducts.length} de {products.length} productos
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
          <div className="space-y-3 sm:space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="rounded-[24px] bg-[var(--surface)] px-4 py-6 text-sm font-semibold text-[var(--text-soft)]">
                No hay productos que coincidan con la búsqueda.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <article
                  key={product._id}
                  className="rounded-[24px] border border-transparent bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_26px_var(--shadow-strong)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <img
                      src={product.mainImage || product.images?.[0] || "/placeholder-product.png"}
                      alt={product.title || "Producto"}
                      className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder-product.png";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 text-[1rem] font-extrabold leading-5 text-[var(--text)] sm:text-xl sm:leading-7">
                        {product.title || "Sin título"}
                      </h2>

                      <p className="mt-2 text-sm text-[var(--text-soft)]">
                        {categoryLabel(product.category)} ·{" "}
                        {statusLabel(product.status)}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--text-muted)] sm:mt-2 sm:text-sm">
                        Slug: {product.slug || "Sin slug"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {typeof product.oldPrice === "number" &&
                        product.oldPrice > 0 && (
                          <p className="text-xs font-bold text-[var(--text-muted)] line-through sm:text-sm">
                            {formatBs(product.oldPrice)}
                          </p>
                        )}

                      <p className="text-[1.05rem] font-black leading-none text-[var(--primary)] sm:text-2xl">
                        {formatBs(product.price)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[var(--text-soft)] sm:text-sm">
                        Stock:{" "}
                        {typeof product.stock === "number" ? product.stock : 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[0.68rem] font-extrabold sm:text-xs ${
                        product.isActive
                          ? "bg-[var(--success-bg)] text-[var(--success)]"
                          : "bg-[var(--danger-bg)] text-[var(--danger)]"
                      }`}
                    >
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>

                    {product.isOffer && (
                      <span className="rounded-full bg-[var(--warning-bg)] px-3 py-1 text-[0.68rem] font-extrabold text-[var(--warning)] sm:text-xs">
                        Oferta
                      </span>
                    )}

                    {product.isWeeklyNew && (
                      <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-[0.68rem] font-extrabold text-[var(--primary)] sm:text-xs">
                        Nuevo semanal
                      </span>
                    )}

                    {product.isFeatured && (
                      <span className="rounded-full bg-[var(--featured-bg)] px-3 py-1 text-[0.68rem] font-extrabold text-[var(--featured)] sm:text-xs">
                        Destacado
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <Link
                      href={`/admin/productos/${product._id}`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-xs font-extrabold text-white transition hover:bg-[var(--primary-dark)] sm:w-auto sm:text-sm"
                    >
                      Editar
                    </Link>

                    <Link
                      href={`/producto/${product.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:w-auto sm:text-sm"
                    >
                      Ver tienda
                    </Link>

                    <div className="col-span-2 sm:col-span-1 [&_button]:!h-11 [&_button]:!w-full [&_button]:!rounded-2xl [&_button]:!text-xs [&_button]:!font-extrabold sm:[&_button]:!w-auto sm:[&_button]:!text-sm">
                      <ProductAdminActions
                        productId={product._id}
                        productTitle={product.title || "Sin título"}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
