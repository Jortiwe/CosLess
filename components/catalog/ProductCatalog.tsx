"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiChevronDown, FiFilter, FiSearch } from "react-icons/fi";

export type CatalogProduct = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  stock?: number;
  mainImage?: string;
  images?: string[];
  createdAt?: string | Date;
};

type Props = {
  products: CatalogProduct[];
  showCategoryFilter?: boolean;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

function getImage(product: CatalogProduct) {
  return product.mainImage || product.images?.[0] || "/placeholder-product.png";
}

function normalize(value?: string) {
  return String(value || "").toLowerCase().trim();
}

export default function ProductCatalog({
  products,
  showCategoryFilter = true,
}: Props) {
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState("");

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean) as string[];

    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (showCategoryFilter && category !== "all") {
      result = result.filter(
        (product) => normalize(product.category) === normalize(category)
      );
    }

    if (localSearch.trim()) {
      const q = normalize(localSearch);

      result = result.filter((product) => {
        return (
          normalize(product.title).includes(q) ||
          normalize(product.category).includes(q) ||
          normalize(product.status).includes(q)
        );
      });
    }

    result.sort((a, b) => {
      if (sort === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }

      if (sort === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      if (sort === "az") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }

      if (sort === "za") {
        return String(b.title || "").localeCompare(String(a.title || ""));
      }

      if (sort === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sort === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      return 0;
    });

    return result;
  }, [products, sort, category, localSearch, showCategoryFilter]);

  return (
    <div>
      <div
        className={`mb-5 grid gap-2 rounded-[24px] border border-[#cfeaf6] bg-white p-3 shadow-[0_10px_25px_rgba(22,50,74,0.04)] sm:mb-6 sm:gap-3 sm:rounded-[28px] sm:p-4 ${
          showCategoryFilter
            ? "grid-cols-2 md:grid-cols-[1fr_auto_auto]"
            : "grid-cols-[1fr_135px] md:grid-cols-[1fr_auto]"
        }`}
      >
        <label
          className={`relative block ${
            showCategoryFilter ? "col-span-2 md:col-span-1" : ""
          }`}
        >
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8798]" />

          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar..."
            className="h-11 w-full rounded-[18px] border border-[#d7edf7] bg-[#f7fdff] pl-11 pr-4 text-sm font-semibold text-[#16324a] outline-none transition placeholder:text-[#7d94a5] focus:border-[#19b7c9] focus:bg-white sm:h-12 sm:rounded-2xl"
          />
        </label>

        {showCategoryFilter && (
          <label className="relative block">
            <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f8798] sm:left-4" />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full appearance-none rounded-[18px] border border-[#d7edf7] bg-[#f7fdff] pl-9 pr-9 text-xs font-bold text-[#16324a] outline-none transition focus:border-[#19b7c9] focus:bg-white sm:h-12 sm:min-w-[190px] sm:rounded-2xl sm:pl-11 sm:pr-10 sm:text-sm"
            >
              <option value="all">Categorías</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[17px] text-[#16324a] sm:right-4" />
          </label>
        )}

        <label className="relative block">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 w-full appearance-none rounded-[18px] border border-[#d7edf7] bg-[#f7fdff] px-3 pr-9 text-xs font-bold text-[#16324a] outline-none transition focus:border-[#19b7c9] focus:bg-white sm:h-12 sm:min-w-[190px] sm:rounded-2xl sm:px-4 sm:pr-10 sm:text-sm"
          >
            <option value="newest">Recientes</option>
            <option value="oldest">Antiguos</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="price-low">Precio menor</option>
            <option value="price-high">Precio mayor</option>
          </select>

          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[17px] text-[#16324a] sm:right-4" />
        </label>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-[28px] border border-[#cfeaf6] bg-white p-6 text-center shadow-[0_10px_25px_rgba(22,50,74,0.04)] sm:rounded-[32px] sm:p-8">
          <h2 className="text-xl font-extrabold text-[#16324a] sm:text-2xl">
            No hay productos disponibles
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#4b6b80]">
            Prueba con otra categoría, cambia el orden o revisa más tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const href = product.slug ? `/producto/${product.slug}` : "#";
            const image = getImage(product);
            const status = product.status || "stock";

            return (
              <Link
                key={product._id}
                href={href}
                className="group overflow-hidden rounded-[26px] border border-[#cfeaf6] bg-white shadow-[0_8px_24px_rgba(22,50,74,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(22,50,74,0.10)]"
              >
                <div className="relative aspect-square overflow-hidden bg-[#eaf8ff]">
                  <img
                    src={image}
                    alt={product.title || "Producto"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#16324a] shadow-sm">
                      {product.category || "Producto"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] shadow-sm ${
                        status === "preventa"
                          ? "bg-[#fff3dc] text-[#b87d00]"
                          : "bg-[#e6f6ed] text-[#16824c]"
                      }`}
                    >
                      {status === "preventa" ? "Preventa" : "Stock"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 min-h-[48px] text-[0.98rem] font-extrabold leading-6 text-[#16324a] sm:text-[1.08rem]">
                    {product.title || "Producto sin título"}
                  </h3>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-[1.08rem] font-extrabold text-[#19b7c9]">
                      {formatBs(product.price)}
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf8ff] text-sm font-extrabold text-[#19b7c9] transition group-hover:bg-[#19b7c9] group-hover:text-white">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}