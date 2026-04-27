"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { FiHeart, FiArrowRight, FiTrash2 } from "react-icons/fi";
import {
  getCartItems,
  getFavoriteItems,
  saveCartItems,
  saveFavoriteItems,
  type FavoriteItem,
  type CartItem,
} from "../../lib/storage";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(getFavoriteItems());
  }, []);

  function refreshFavorites() {
    setFavorites(getFavoriteItems());
  }

  function removeFavorite(productId: string) {
    const updated = favorites.filter((item) => item.productId !== productId);
    saveFavoriteItems(updated);
    refreshFavorites();
  }

  function addAllToCart() {
    const currentCart = getCartItems();
    let updatedCart = [...currentCart];

    favorites.forEach((fav) => {
      const existing = updatedCart.find((item) => item.productId === fav.productId);

      if (existing) {
        updatedCart = updatedCart.map((item) =>
          item.productId === fav.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart.push({
          productId: fav.productId,
          title: fav.title,
          price: fav.price,
          quantity: 1,
          mainImage: fav.mainImage,
          slug: fav.slug,
        });
      }
    });

    saveCartItems(updatedCart);
  }

  const stockCount = useMemo(
    () => favorites.filter((item) => item.status === "stock").length,
    [favorites]
  );

  const preventaCount = useMemo(
    () => favorites.filter((item) => item.status === "preventa").length,
    [favorites]
  );

  const hasFavorites = mounted && favorites.length > 0;

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        <div className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.06)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf8ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
                <FiHeart />
                Favoritos
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-[#16324a] sm:text-5xl">
                Tu lista de favoritos
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-[#4b6b80]">
                Guarda los productos que más te gusten para verlos después,
                compararlos mejor y añadirlos al carrito cuando quieras.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-center text-sm font-bold text-[#16324a] transition duration-200 hover:border-[#19b7c9] hover:text-[#19b7c9]"
              >
                Seguir comprando
              </Link>

              <button
                type="button"
                onClick={addAllToCart}
                className="rounded-2xl bg-[#19b7c9] px-5 py-3 text-sm font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0ea5b7]"
              >
                Añadir todo al carrito
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[26px] bg-[#eaf8ff] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f8798]">
                Guardados
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#16324a]">
                {favorites.length}
              </p>
            </div>

            <div className="rounded-[26px] bg-[#eaf8ff] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f8798]">
                En stock
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#16324a]">
                {stockCount}
              </p>
            </div>

            <div className="rounded-[26px] bg-[#eaf8ff] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f8798]">
                Preventa
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#16324a]">
                {preventaCount}
              </p>
            </div>
          </div>
        </div>

        {hasFavorites ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <article
                key={item.productId}
                className="overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white shadow-[0_8px_24px_rgba(22,50,74,0.06)]"
              >
                <div className="overflow-hidden bg-[#eaf8ff]">
                  <Image
                    src={item.mainImage}
                    alt={item.title}
                    width={500}
                    height={650}
                    className="h-[320px] w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#19b7c9]">
                      {item.category || "Producto"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        item.status === "stock"
                          ? "bg-[#dff7ea] text-[#16784a]"
                          : "bg-[#fff3d9] text-[#9a6a00]"
                      }`}
                    >
                      {item.status === "stock" ? "En stock" : "Preventa"}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold leading-8 text-[#16324a]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-lg font-bold text-[#19b7c9]">
                    Bs{item.price}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={item.slug ? `/producto/${item.slug}` : "/favoritos"}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#19b7c9] px-4 py-3 text-sm font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0ea5b7]"
                    >
                      Ver producto
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeFavorite(item.productId)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-bold text-[#16324a] transition duration-200 hover:border-[#19b7c9] hover:text-[#19b7c9]"
                    >
                      <FiTrash2 />
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-10 text-center shadow-[0_10px_30px_rgba(22,50,74,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf8ff] text-[#19b7c9]">
              <FiHeart className="text-[2rem]" />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold text-[#16324a]">
              Aún no tienes favoritos
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#4b6b80]">
              Cuando veas un producto que te guste, toca el corazón para
              guardarlo aquí y revisarlo después con calma.
            </p>

            <Link
              href="/"
              className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#19b7c9] px-6 py-4 text-sm font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0ea5b7]"
            >
              <FiArrowRight />
              Explorar productos
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}