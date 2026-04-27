"use client";

import { useState } from "react";
import { getCartItems, saveCartItems, type CartItem } from "../../lib/storage";

type Props = {
  product: {
    productId: string;
    title: string;
    price: number;
    mainImage: string;
    slug?: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleAddToCart() {
    try {
      setLoading(true);

      const currentCart = getCartItems();

      const existingItem = currentCart.find(
        (item) => item.productId === product.productId
      );

      let updatedCart: CartItem[];

      if (existingItem) {
        updatedCart = currentCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [
          ...currentCart,
          {
            productId: product.productId,
            title: product.title,
            price: product.price,
            quantity: 1,
            mainImage: product.mainImage,
            slug: product.slug,
          },
        ];
      }

      saveCartItems(updatedCart);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={loading}
      className={`inline-flex min-w-[220px] items-center justify-center rounded-2xl px-6 py-4 text-sm font-bold text-white transition duration-200 ${
        success
          ? "bg-emerald-500"
          : "bg-[#19b7c9] hover:bg-[#0ea5b7]"
      } disabled:opacity-70`}
    >
      {loading ? "Añadiendo..." : success ? "Añadido al carrito" : "Añadir al carrito"}
    </button>
  );
}