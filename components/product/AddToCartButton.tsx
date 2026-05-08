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
    stock?: number;
    status?: "stock" | "preventa";
  };
};

export default function AddToCartButton({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 1600);
  }

  function handleAddToCart() {
    try {
      setLoading(true);

      const currentCart = getCartItems();

      const existingItem = currentCart.find(
        (item) => item.productId === product.productId
      );

      const isPreventa = product.status === "preventa";
      const stock = Number(product.stock || 0);
      const existingQuantity = existingItem?.quantity || 0;

      if (!isPreventa && stock <= 0) {
        showMessage("Producto sin stock disponible.", "error");
        return;
      }

      if (!isPreventa && existingQuantity + 1 > stock) {
        showMessage(`Solo hay ${stock} unidad(es) disponibles.`, "error");
        return;
      }

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

      showMessage("Añadido al carrito.", "success");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading}
        className={`inline-flex min-w-[220px] items-center justify-center rounded-2xl px-6 py-4 text-sm font-bold text-white transition duration-200 ${
          message && messageType === "success"
            ? "bg-emerald-500"
            : message && messageType === "error"
            ? "bg-red-500"
            : "bg-[#19b7c9] hover:bg-[#0ea5b7]"
        } disabled:opacity-70`}
      >
        {loading
          ? "Añadiendo..."
          : message && messageType === "success"
          ? "Añadido al carrito"
          : message && messageType === "error"
          ? "Sin stock"
          : "Añadir al carrito"}
      </button>

      {message && (
        <p
          className={`mt-2 text-sm font-bold ${
            messageType === "success" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}