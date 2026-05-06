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
  };
};

const DIRECT_CHECKOUT_KEY = "cosless_direct_checkout";

export default function BuyNowButton({ product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleBuyNow() {
    try {
      setLoading(true);

      const directItem = {
        ...product,
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
      className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#16324a] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(22,50,74,0.16)] transition hover:bg-[#0f2538] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <FiZap />
      {loading ? "Abriendo..." : "Comprar ahora"}
    </button>
  );
}