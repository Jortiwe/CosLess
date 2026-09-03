"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  getCartItems,
  getFavoriteItems,
  saveCartItems,
  saveFavoriteItems,
  type CartItem,
  type FavoriteItem,
} from "../../lib/storage";
import { FiHeart, FiTrash2, FiEye } from "react-icons/fi";

function formatBs(value: number) {
  return `Bs${value}`;
}

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";
  const value = src.trim();
  return value || "/placeholder-product.png";
}

function categoryLabel(value?: string) {
  if (!value) return "Producto";

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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(getFavoriteItems());
  }, []);

  const totalFavorites = favorites.length;

  const stockCount = useMemo(() => {
    return favorites.filter((item) => (item.status || "stock") === "stock")
      .length;
  }, [favorites]);

  const preventaCount = useMemo(() => {
    return favorites.filter((item) => item.status === "preventa").length;
  }, [favorites]);

  function removeFavorite(productId: string) {
    const updated = favorites.filter((item) => item.productId !== productId);
    setFavorites(updated);
    saveFavoriteItems(updated);
    window.dispatchEvent(new Event("cosless-favorites-updated"));
  }

  function addAllToCart() {
    if (favorites.length === 0) return;

    const currentCart = getCartItems();
    const cartMap = new Map<string, CartItem>();

    currentCart.forEach((item) => {
      cartMap.set(item.productId, { ...item });
    });

    favorites.forEach((fav) => {
      const existing = cartMap.get(fav.productId);

      if (existing) {
        existing.quantity += 1;
        cartMap.set(fav.productId, existing);
      } else {
        cartMap.set(fav.productId, {
          productId: fav.productId,
          title: fav.title,
          price: fav.price,
          quantity: 1,
          mainImage: fav.mainImage,
          slug: fav.slug,
        });
      }
    });

    saveCartItems(Array.from(cartMap.values()));
    window.dispatchEvent(new Event("cosless-cart-updated"));
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
            <FiHeart className="mr-2 text-[1.05rem]" />
            Favoritos
          </span>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 sm:flex sm:justify-end sm:gap-3">
          <div className="min-w-[110px] rounded-[22px] bg-[var(--surface-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Guardados
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--text)]">
              {totalFavorites}
            </p>
          </div>

          <div className="min-w-[110px] rounded-[22px] bg-[var(--surface-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Stock
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--text)]">
              {stockCount}
            </p>
          </div>

          <div className="min-w-[110px] rounded-[22px] bg-[var(--surface-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Preventa
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--text)]">
              {preventaCount}
            </p>
          </div>
        </div>

        {mounted && favorites.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center shadow-[0_10px_30px_var(--shadow)] sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]">
              <FiHeart className="text-[2rem]" />
            </div>

            <h2 className="mt-5 text-[2rem] font-extrabold leading-tight text-[var(--text)] sm:text-[2.5rem]">
              Aún no tienes favoritos
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--text-soft)]">
              Guarda aquí los productos que más te gusten para revisarlos
              después o añadirlos al carrito.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((item) => {
                const status = item.status || "stock";
                const category = categoryLabel(item.category);
                const productHref = item.slug ? `/producto/${item.slug}` : "/";

                return (
                  <article
                    key={item.productId}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_24px_var(--shadow)] transition hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_16px_34px_var(--shadow-strong)]"
                  >
                    <Link
                      href={productHref}
                      aria-label={`Ver producto ${item.title}`}
                      className="absolute inset-0 z-0"
                    />

                    <div className="relative z-10 pointer-events-none">
                      <div className="relative aspect-square overflow-hidden bg-[var(--surface-soft)]">
                        <img
                          src={getSafeImage(item.mainImage)}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src =
                              "/placeholder-product.png";
                          }}
                        />

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--text)] shadow-sm">
                            {category}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] shadow-sm ${
                              status === "preventa"
                                ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                                : "bg-[var(--success-bg)] text-[var(--success)]"
                            }`}
                          >
                            {status === "preventa" ? "Preventa" : "Stock"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-2 text-[0.98rem] font-extrabold leading-6 text-[var(--text)] transition group-hover:text-[var(--primary)] sm:text-[1.08rem]">
                          {item.title}
                        </h3>

                        <p className="mt-3 text-[1.08rem] font-extrabold text-[var(--primary)]">
                          {formatBs(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-20 mt-auto grid grid-cols-2 gap-2 px-4 pb-4">
                      <Link
                        href={productHref}
                        aria-label="Ver producto"
                        title="Ver producto"
                        className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-3 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)] sm:h-12"
                      >
                        <span className="hidden sm:inline">Ver producto</span>
                        <FiEye className="text-[1.15rem] sm:hidden" />
                      </Link>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          removeFavorite(item.productId);
                        }}
                        aria-label="Quitar de favoritos"
                        title="Quitar de favoritos"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text)] transition hover:border-[var(--danger-bg-hover)] hover:text-[var(--danger)] sm:h-12"
                      >
                        <FiTrash2 className="text-[1.05rem]" />
                        <span className="hidden sm:inline">Quitar</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-[56px] min-w-[190px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:min-w-[240px] sm:text-base"
                >
                  Seguir comprando
                </Link>

                <button
                  type="button"
                  onClick={addAllToCart}
                  className="inline-flex h-[56px] min-w-[190px] items-center justify-center rounded-2xl bg-[var(--primary)] px-6 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)] sm:min-w-[240px] sm:text-base"
                >
                  Añadir todo
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}