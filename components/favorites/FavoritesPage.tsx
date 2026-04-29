"use client";

import Link from "next/link";
import Image from "next/image";
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
  }

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-center sm:justify-start">
            <div className="inline-flex items-center rounded-full bg-[#dff4ff] px-5 py-3 text-base font-semibold text-[#19b7c9]">
              <FiHeart className="mr-2 text-[1.05rem]" />
              Favoritos
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 self-center sm:flex sm:gap-3 sm:self-auto">
            <div className="min-w-[110px] rounded-[22px] bg-[#dff1fb] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#68839a]">
                Guardados
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#16324a]">
                {totalFavorites}
              </p>
            </div>

            <div className="min-w-[110px] rounded-[22px] bg-[#dff1fb] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#68839a]">
                Stock
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#16324a]">
                {stockCount}
              </p>
            </div>

            <div className="min-w-[110px] rounded-[22px] bg-[#dff1fb] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#68839a]">
                Preventa
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#16324a]">
                {preventaCount}
              </p>
            </div>
          </div>
        </div>

        {mounted && favorites.length === 0 ? (
          <div className="rounded-[28px] border border-[#cfeaf6] bg-white px-5 py-10 text-center shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf8ff] text-[#19b7c9]">
              <FiHeart className="text-[2rem]" />
            </div>

            <h2 className="mt-5 text-[2rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.5rem]">
              Aún no tienes favoritos
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#4b6b80]">
              Guarda aquí los productos que más te gusten para revisarlos
              después o añadirlos al carrito.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {favorites.map((item) => {
                const status = item.status || "stock";
                const category = item.category || "Sin categoría";

                return (
                  <article
                    key={item.productId}
                    className="overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white shadow-[0_8px_24px_rgba(22,50,74,0.04)]"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#eaf8ff]">
                      <Image
                        src={item.mainImage || "/placeholder-product.png"}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />

                      <div className="absolute left-3 top-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <span className="rounded-full bg-[#dff4ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#19b7c9] shadow-sm sm:text-[11px]">
                          {category}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm sm:text-[11px] ${
                            status === "stock"
                              ? "bg-[#e6f6ed] text-[#16824c]"
                              : "bg-[#fff3dc] text-[#b87d00]"
                          }`}
                        >
                          {status === "stock" ? "En stock" : "Preventa"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 sm:p-5">
                      <h3 className="line-clamp-2 min-h-[52px] text-[1.1rem] font-extrabold leading-6 text-[#16324a] sm:text-[1.25rem]">
                        {item.title}
                      </h3>

                      <p className="text-[1.15rem] font-extrabold text-[#19b7c9] sm:text-[1.3rem]">
                        {formatBs(item.price)}
                      </p>

                      {/* móvil: solo iconos */}
                      <div className="flex items-center gap-2 pt-1 sm:hidden">
                        <Link
                          href={item.slug ? `/producto/${item.slug}` : "/"}
                          aria-label="Ver producto"
                          title="Ver producto"
                          className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#19b7c9] text-white transition hover:bg-[#0ea5b7]"
                        >
                          <FiEye className="text-[1.2rem]" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => removeFavorite(item.productId)}
                          aria-label="Quitar de favoritos"
                          title="Quitar de favoritos"
                          className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-[#d7e8f2] bg-white text-[#16324a] transition hover:border-[#f0c9c9] hover:text-[#c94b4b]"
                        >
                          <FiTrash2 className="text-[1.1rem]" />
                        </button>
                      </div>

                      {/* pc: texto normal */}
                      <div className="hidden grid-cols-2 gap-3 pt-1 sm:grid">
                        <Link
                          href={item.slug ? `/producto/${item.slug}` : "/"}
                          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#19b7c9] px-4 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
                        >
                          Ver producto
                        </Link>

                        <button
                          type="button"
                          onClick={() => removeFavorite(item.productId)}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#d7e8f2] bg-white px-4 text-sm font-bold text-[#16324a] transition hover:border-[#f0c9c9] hover:text-[#c94b4b]"
                        >
                          <FiTrash2 />
                          Quitar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-[56px] min-w-[190px] items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-6 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:min-w-[240px] sm:text-base"
                >
                  Seguir comprando
                </Link>

                <button
                  type="button"
                  onClick={addAllToCart}
                  className="inline-flex h-[56px] min-w-[190px] items-center justify-center rounded-2xl bg-[#19b7c9] px-6 text-sm font-bold text-white transition hover:bg-[#0ea5b7] sm:min-w-[240px] sm:text-base"
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