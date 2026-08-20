"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiFilter,
  FiSearch,
} from "react-icons/fi";

export type CatalogProduct = {
  _id: string;

  title?: string;
  slug?: string;

  category?: string;
  categories?: string[];

  status?: string;

  price?: number;
  oldPrice?: number;

  stock?: number;

  // =========================
  // ALQUILER
  // =========================

  isRentable?: boolean;
  rentalPrice?: number;
  rentalDeposit?: number;
  rentalDays?: number;
  rentalAvailable?: boolean;

  mainImage?: string;
  images?: string[];

  createdAt?: string | Date;
};

type Props = {
  products: CatalogProduct[];
  showCategoryFilter?: boolean;
};

function formatBs(value?: number) {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return "Bs0";
  }

  return `Bs${value}`;
}

function getImage(
  product: CatalogProduct
) {
  return (
    product.mainImage ||
    product.images?.[0] ||
    "/placeholder-product.png"
  );
}

function normalize(value?: string) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function getStatusInfo(
  product: CatalogProduct
) {
  const status =
    product.status || "stock";

  const stock =
    typeof product.stock === "number"
      ? product.stock
      : 0;

  const isOutOfStock =
    status !== "preventa" &&
    stock <= 0;

  if (isOutOfStock) {
    return {
      label: "Sin stock",
      className:
        "bg-[var(--danger-bg)] text-[var(--danger)]",
    };
  }

  if (status === "preventa") {
    return {
      label: "Preventa",
      className:
        "bg-[var(--warning-bg)] text-[var(--warning)]",
    };
  }

  return {
    label: "Stock",
    className:
      "bg-[var(--success-bg)] text-[var(--success)]",
  };
}

function getRentalInfo(
  product: CatalogProduct
) {
  const hasRentalCategory =
    Array.isArray(product.categories) &&
    product.categories
      .map(normalize)
      .includes("alquiler");

  const isRentable =
    Boolean(product.isRentable) ||
    hasRentalCategory ||
    normalize(product.category) ===
      "alquiler";

  const rentalPrice =
    typeof product.rentalPrice ===
    "number"
      ? product.rentalPrice
      : 0;

  const rentalDays =
    typeof product.rentalDays ===
      "number" &&
    product.rentalDays > 0
      ? product.rentalDays
      : 1;

  const available =
    product.rentalAvailable !== false;

  return {
    isRentable,
    available,
    rentalPrice,
    rentalDays,
  };
}

export default function ProductCatalog({
  products,
  showCategoryFilter = true,
}: Props) {
  const [sort, setSort] =
    useState("newest");

  const [category, setCategory] =
    useState("all");

  const [
    localSearch,
    setLocalSearch,
  ] = useState("");

  const categories = useMemo(() => {
    const values = products
      .map(
        (product) =>
          product.category
      )
      .filter(Boolean) as string[];

    return Array.from(
      new Set(values)
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      let result = [...products];

      if (
        showCategoryFilter &&
        category !== "all"
      ) {
        result = result.filter(
          (product) =>
            normalize(
              product.category
            ) ===
            normalize(category)
        );
      }

      if (localSearch.trim()) {
        const q =
          normalize(localSearch);

        result = result.filter(
          (product) => {
            const rentalInfo =
              getRentalInfo(
                product
              );

            return (
              normalize(
                product.title
              ).includes(q) ||
              normalize(
                product.category
              ).includes(q) ||
              normalize(
                product.status
              ).includes(q) ||
              (rentalInfo.isRentable &&
                "alquiler".includes(
                  q
                ))
            );
          }
        );
      }

      result.sort((a, b) => {
        if (sort === "newest") {
          return (
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
          );
        }

        if (sort === "oldest") {
          return (
            new Date(
              a.createdAt || 0
            ).getTime() -
            new Date(
              b.createdAt || 0
            ).getTime()
          );
        }

        if (sort === "az") {
          return String(
            a.title || ""
          ).localeCompare(
            String(
              b.title || ""
            )
          );
        }

        if (sort === "za") {
          return String(
            b.title || ""
          ).localeCompare(
            String(
              a.title || ""
            )
          );
        }

        if (
          sort === "price-low"
        ) {
          return (
            Number(
              a.price || 0
            ) -
            Number(
              b.price || 0
            )
          );
        }

        if (
          sort === "price-high"
        ) {
          return (
            Number(
              b.price || 0
            ) -
            Number(
              a.price || 0
            )
          );
        }

        return 0;
      });

      return result;
    }, [
      products,
      sort,
      category,
      localSearch,
      showCategoryFilter,
    ]);

  return (
    <div>
      {/* ========================= */}
      {/* FILTROS */}
      {/* ========================= */}

      <div
        className={`mb-5 grid gap-2 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_25px_var(--shadow)] sm:mb-6 sm:gap-3 sm:rounded-[28px] sm:p-4 ${
          showCategoryFilter
            ? "grid-cols-2 md:grid-cols-[1fr_auto_auto]"
            : "grid-cols-[1fr_135px] md:grid-cols-[1fr_auto]"
        }`}
      >
        {/* BUSCAR */}

        <label
          className={`relative block ${
            showCategoryFilter
              ? "col-span-2 md:col-span-1"
              : ""
          }`}
        >
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

          <input
            value={localSearch}
            onChange={(e) =>
              setLocalSearch(
                e.target.value
              )
            }
            placeholder="Buscar..."
            className="h-11 w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] sm:h-12 sm:rounded-2xl"
          />
        </label>

        {/* CATEGORÍA */}

        {showCategoryFilter && (
          <label className="relative block">
            <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] sm:left-4" />

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-soft)] pl-9 pr-9 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--surface)] sm:h-12 sm:min-w-[190px] sm:rounded-2xl sm:pl-11 sm:pr-10 sm:text-sm"
            >
              <option value="all">
                Categorías
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[17px] text-[var(--text)] sm:right-4" />
          </label>
        )}

        {/* ORDEN */}

        <label className="relative block">
          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value
              )
            }
            className="h-11 w-full appearance-none rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 pr-9 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--surface)] sm:h-12 sm:min-w-[190px] sm:rounded-2xl sm:px-4 sm:pr-10 sm:text-sm"
          >
            <option value="newest">
              Recientes
            </option>

            <option value="oldest">
              Antiguos
            </option>

            <option value="az">
              A-Z
            </option>

            <option value="za">
              Z-A
            </option>

            <option value="price-low">
              Precio menor
            </option>

            <option value="price-high">
              Precio mayor
            </option>
          </select>

          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[17px] text-[var(--text)] sm:right-4" />
        </label>
      </div>

      {/* ========================= */}
      {/* SIN PRODUCTOS */}
      {/* ========================= */}

      {filteredProducts.length ===
      0 ? (
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_10px_25px_var(--shadow)] sm:rounded-[32px] sm:p-8">
          <h2 className="text-xl font-extrabold text-[var(--text)] sm:text-2xl">
            No hay productos disponibles
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
            Prueba con otra categoría,
            cambia el orden o revisa
            más tarde.
          </p>
        </div>
      ) : (
        /* ========================= */
        /* PRODUCTOS */
        /* ========================= */

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(
            (product) => {
              const href =
                product.slug
                  ? `/producto/${product.slug}`
                  : "#";

              const image =
                getImage(product);

              const statusInfo =
                getStatusInfo(
                  product
                );

              const rentalInfo =
                getRentalInfo(
                  product
                );

              const hasOldPrice =
                typeof product.oldPrice ===
                  "number" &&
                typeof product.price ===
                  "number" &&
                product.oldPrice >
                  product.price;

              return (
                <Link
                  key={product._id}
                  href={href}
                  className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_24px_var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_var(--shadow-strong)]"
                >
                  {/* ========================= */}
                  {/* IMAGEN */}
                  {/* ========================= */}

                  <div className="relative aspect-square overflow-hidden bg-[var(--surface-soft)]">
                    <img
                      src={image}
                      alt={
                        product.title ||
                        "Producto"
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* ETIQUETAS */}

                    <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--text)] shadow-sm backdrop-blur sm:text-[10px] sm:tracking-[0.14em]">
                        {product.category ||
                          "Producto"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] shadow-sm sm:text-[10px] sm:tracking-[0.14em] ${statusInfo.className}`}
                      >
                        {
                          statusInfo.label
                        }
                      </span>

                      {rentalInfo.isRentable && (
                        <span
                          className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] shadow-sm sm:text-[10px] sm:tracking-[0.14em] ${
                            rentalInfo.available
                              ? "bg-[#eef0ff] text-[#5661c9]"
                              : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                          }`}
                        >
                          {rentalInfo.available
                            ? "Alquiler"
                            : "Alquiler no disponible"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ========================= */}
                  {/* INFORMACIÓN */}
                  {/* ========================= */}

                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <h3 className="line-clamp-2 text-[0.92rem] font-extrabold leading-5 text-[var(--text)] sm:text-[1.08rem] sm:leading-6">
                      {product.title ||
                        "Producto sin título"}
                    </h3>

                    <div className="mt-auto pt-4">
                      {/* PRECIOS */}

                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          {/* COMPRA */}

                          <div>
                            {rentalInfo.isRentable && (
                              <p className="mb-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:text-[0.68rem]">
                                Compra
                              </p>
                            )}

                            {hasOldPrice && (
                              <p className="text-[0.7rem] font-bold text-[var(--text-muted)] line-through sm:text-xs">
                                {formatBs(
                                  product.oldPrice
                                )}
                              </p>
                            )}

                            <p className="text-[1rem] font-extrabold text-[var(--primary)] sm:text-[1.08rem]">
                              {formatBs(
                                product.price
                              )}
                            </p>
                          </div>

                          {/* ALQUILER */}

                          {rentalInfo.isRentable && (
                            <div className="mt-2">
                              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#6c72b8] sm:text-[0.68rem]">
                                Alquiler
                              </p>

                              {rentalInfo.available ? (
                                <p className="mt-0.5 text-[0.92rem] font-extrabold text-[#5661c9] sm:text-[1rem]">
                                  {formatBs(
                                    rentalInfo.rentalPrice
                                  )}
                                  <span className="ml-1 text-[0.68rem] font-bold text-[var(--text-muted)] sm:text-xs">
                                    /{" "}
                                    {rentalInfo.rentalDays ===
                                    1
                                      ? "día"
                                      : `${rentalInfo.rentalDays} días`}
                                  </span>
                                </p>
                              ) : (
                                <p className="mt-0.5 text-xs font-bold text-[var(--text-muted)]">
                                  No disponible
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* FLECHA */}

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}