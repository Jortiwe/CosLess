"use client";

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import {
  getFavoriteItems,
  saveFavoriteItems,
  type FavoriteItem,
} from "../../lib/storage";

type Props = {
  product: {
    productId: string;
    title: string;
    price: number;
    mainImage: string;
    slug?: string;
    category?: string;
    status?: "stock" | "preventa";
  };
};

export default function AddToFavoritesButton({ product }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [animate, setAnimate] = useState(false);

  function syncFavoriteState() {
    const currentFavorites = getFavoriteItems();

    const exists = currentFavorites.some(
      (item) => item.productId === product.productId
    );

    setIsFavorite(exists);
  }

  useEffect(() => {
    syncFavoriteState();

    const handleFavoritesUpdate = () => syncFavoriteState();
    const handleStorage = () => syncFavoriteState();

    window.addEventListener("cosless-favorites-updated", handleFavoritesUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "cosless-favorites-updated",
        handleFavoritesUpdate
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [product.productId]);

  function handleToggleFavorite() {
    const currentFavorites = getFavoriteItems();

    const alreadyExists = currentFavorites.some(
      (item) => item.productId === product.productId
    );

    let updatedFavorites: FavoriteItem[];

    if (alreadyExists) {
      updatedFavorites = currentFavorites.filter(
        (item) => item.productId !== product.productId
      );
    } else {
      updatedFavorites = [
        ...currentFavorites,
        {
          productId: product.productId,
          title: product.title,
          price: product.price,
          mainImage: product.mainImage,
          slug: product.slug,
          category: product.category,
          status: product.status || "stock",
        },
      ];
    }

    saveFavoriteItems(updatedFavorites);

    setIsFavorite(!alreadyExists);
    setAnimate(false);

    requestAnimationFrame(() => {
      setAnimate(true);
    });

    window.setTimeout(() => setAnimate(false), 500);
    window.dispatchEvent(new Event("cosless-favorites-updated"));
  }

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-sm font-bold transition duration-200 ${
        isFavorite
          ? "border-[var(--primary)] bg-[var(--surface-soft)] text-[var(--primary)] hover:bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
      }`}
    >
      <FiHeart
        className={`text-[1.05rem] transition-all duration-300 ${
          isFavorite ? "fill-[var(--primary)] text-[var(--primary)]" : ""
        } ${animate ? "scale-125" : ""}`}
      />

      {isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    </button>
  );
}