"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiZap } from "react-icons/fi";

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

const DIRECT_CHECKOUT_KEY = "cosless_direct_checkout";

export default function BuyNowButton({ product }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [stockWarning, setStockWarning] = useState(false);

  const stock = Number(product.stock || 0);
  const hasStock = stock > 0;

  function triggerNoStockWarning() {
    setStockWarning(true);

    window.setTimeout(() => {
      setStockWarning(false);
    }, 650);
  }

  function handleBuyNow() {
    if (!hasStock) {
      triggerNoStockWarning();
      return;
    }

    try {
      setLoading(true);

      const directItem = {
        productId: product.productId,
        title: product.title,
        price: product.price,
        mainImage: product.mainImage,
        slug: product.slug,
        stock,
        status: product.status,
        quantity: 1,
      };

      sessionStorage.setItem(DIRECT_CHECKOUT_KEY, JSON.stringify([directItem]));

      router.push("/checkout?direct=1");
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={loading}
      className={`inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_26px_var(--shadow-strong)] transition disabled:cursor-not-allowed disabled:opacity-70 ${
        stockWarning
          ? "animate-pulse bg-[var(--danger)] shadow-[0_0_0_5px_rgba(220,38,38,0.18),0_12px_26px_rgba(220,38,38,0.20)]"
          : "bg-[var(--text)] hover:bg-[var(--cos-navy)]"
      }`}
    >
      <FiZap />
      {loading ? "Abriendo..." : "Comprar ahora"}
    </button>
  );
}