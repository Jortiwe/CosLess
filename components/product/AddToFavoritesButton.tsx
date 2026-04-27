"use client";

import { useState } from "react";
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
  const [animate, setAnimate] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleAddToFavorites() {
    const currentFavorites = getFavoriteItems();

    const alreadyExists = currentFavorites.some(
      (item) => item.productId === product.productId
    );

    let updatedFavorites: FavoriteItem[];

    if (alreadyExists) {
      updatedFavorites = currentFavorites;
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
          status: product.status,
        },
      ];
      saveFavoriteItems(updatedFavorites);
    }

    setSaved(true);
    setAnimate(false);

    requestAnimationFrame(() => {
      setAnimate(true);
    });

    setTimeout(() => setAnimate(false), 700);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAddToFavorites}
      className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl border border-[#cfeaf6] bg-white px-6 py-4 text-sm font-bold text-[#16324a] transition duration-200 hover:border-[#19b7c9] hover:text-[#19b7c9]"
    >
      <FiHeart
        className={`text-[1.05rem] transition-transform duration-300 ${
          animate ? "scale-125 text-[#19b7c9]" : ""
        }`}
      />
      {saved ? "Añadido a favoritos" : "Añadir a favoritos"}
    </button>
  );
}