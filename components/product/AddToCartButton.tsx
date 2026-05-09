"use client";

import { useEffect, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
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
  const [cartQuantity, setCartQuantity] = useState(0);

  const stock = Number(product.stock || 0);

  const hasStock = stock > 0;
  const reachedStockLimit = cartQuantity > 0 && cartQuantity >= stock;

  function syncCartQuantity() {
    const currentCart = getCartItems();

    const existingItem = currentCart.find(
      (item) => item.productId === product.productId
    );

    setCartQuantity(existingItem?.quantity || 0);
  }

  function updateCart(updatedCart: CartItem[]) {
    saveCartItems(updatedCart);
    syncCartQuantity();
    window.dispatchEvent(new Event("cosless-cart-updated"));
  }

  useEffect(() => {
    syncCartQuantity();

    const handleCartUpdate = () => syncCartQuantity();
    const handleStorage = () => syncCartQuantity();

    window.addEventListener("cosless-cart-updated", handleCartUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cosless-cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [product.productId]);

  function handleAddFirst() {
    if (!hasStock || loading) return;

    try {
      setLoading(true);

      const currentCart = getCartItems();
      const existingItem = currentCart.find(
        (item) => item.productId === product.productId
      );

      if (existingItem) return;

      const updatedCart: CartItem[] = [
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

      updateCart(updatedCart);
    } finally {
      setLoading(false);
    }
  }

  function handleIncrease() {
    if (loading || !hasStock || reachedStockLimit) return;

    try {
      setLoading(true);

      const currentCart = getCartItems();

      const existingItem = currentCart.find(
        (item) => item.productId === product.productId
      );

      if (!existingItem) {
        const updatedCart: CartItem[] = [
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

        updateCart(updatedCart);
        return;
      }

      const nextQuantity = existingItem.quantity + 1;

      if (nextQuantity > stock) return;

      const updatedCart = currentCart.map((item) =>
        item.productId === product.productId
          ? { ...item, quantity: nextQuantity }
          : item
      );

      updateCart(updatedCart);
    } finally {
      setLoading(false);
    }
  }

  function handleDecrease() {
    if (loading || cartQuantity <= 0) return;

    try {
      setLoading(true);

      const currentCart = getCartItems();

      const existingItem = currentCart.find(
        (item) => item.productId === product.productId
      );

      if (!existingItem) return;

      const nextQuantity = existingItem.quantity - 1;

      let updatedCart: CartItem[];

      if (nextQuantity <= 0) {
        updatedCart = currentCart.filter(
          (item) => item.productId !== product.productId
        );
      } else {
        updatedCart = currentCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      updateCart(updatedCart);
    } finally {
      setLoading(false);
    }
  }

  const baseHeight =
    "h-[56px] sm:h-[60px] rounded-[22px] sm:rounded-[24px]";

  if (!hasStock && cartQuantity === 0) {
    return (
      <button
        type="button"
        disabled
        className={`w-full ${baseHeight} inline-flex items-center justify-center border border-[#e8a8b8] bg-[#d86b88] px-6 text-sm font-extrabold uppercase tracking-[0.08em] text-white/90 shadow-[0_8px_22px_rgba(216,107,136,0.16)]`}
      >
        No stock
      </button>
    );
  }

  if (cartQuantity === 0) {
    return (
      <button
        type="button"
        onClick={handleAddFirst}
        disabled={loading}
        className={`w-full ${baseHeight} inline-flex items-center justify-center bg-[#19b7c9] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(25,183,201,0.18)] transition hover:bg-[#0ea5b7] disabled:opacity-80`}
      >
        {loading ? "Añadiendo..." : "Añadir al carrito"}
      </button>
    );
  }

  if (reachedStockLimit) {
    return (
      <button
        type="button"
        onClick={handleDecrease}
        disabled={loading}
        className={`relative w-full ${baseHeight} overflow-hidden border border-[#e8a8b8] bg-[#d86b88] shadow-[0_8px_22px_rgba(216,107,136,0.16)] transition hover:bg-[#cf5f7e] disabled:opacity-80`}
      >
        <span className="absolute inset-0 flex items-center justify-center text-[0.95rem] font-extrabold uppercase tracking-[0.08em] text-white/78">
          No stock
        </span>

        <span className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-white">
          <FiMinus className="text-[1.35rem] stroke-[3]" />
        </span>
      </button>
    );
  }

  return (
    <div
      className={`relative w-full ${baseHeight} overflow-hidden border border-[#b9ddea] bg-white shadow-[0_8px_22px_rgba(22,50,74,0.08)]`}
    >
      <div
        className="absolute inset-0 bg-[#edbfd0]"
        style={{
          clipPath: "polygon(0 0, 57% 0, 43% 100%, 0 100%)",
        }}
      />

      <div
        className="absolute inset-0 bg-[#addfe8]"
        style={{
          clipPath: "polygon(57% 0, 100% 0, 100% 100%, 43% 100%)",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[170%] w-[3px] -translate-x-1/2 -translate-y-1/2 rotate-[21deg] bg-[#c5dde5]" />

      <button
        type="button"
        onClick={handleDecrease}
        disabled={loading}
        aria-label="Reducir cantidad"
        className="absolute inset-0 z-10 transition hover:brightness-[0.98]"
        style={{
          clipPath: "polygon(0 0, 57% 0, 43% 100%, 0 100%)",
        }}
      >
        <span className="absolute left-[26%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c45576]">
          <FiMinus className="text-[1.5rem] stroke-[3]" />
        </span>
      </button>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={loading}
        aria-label="Aumentar cantidad"
        className="absolute inset-0 z-10 transition hover:brightness-[0.98]"
        style={{
          clipPath: "polygon(57% 0, 100% 0, 100% 100%, 43% 100%)",
        }}
      >
        <span className="absolute left-[74%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#10a9bf]">
          <FiPlus className="text-[1.5rem] stroke-[3]" />
        </span>
      </button>
    </div>
  );
}