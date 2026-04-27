"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import { getCartItems, getFavoriteItems } from "../../lib/storage";

export default function HeaderIcons({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
}) {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  function refreshCounts() {
    const cartItems = getCartItems();
    const favoriteItems = getFavoriteItems();

    const totalCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    setCartCount(totalCart);
    setFavoritesCount(favoriteItems.length);
  }

  useEffect(() => {
    refreshCounts();

    window.addEventListener("cosless-cart-updated", refreshCounts);
    window.addEventListener("cosless-favorites-updated", refreshCounts);
    window.addEventListener("storage", refreshCounts);

    return () => {
      window.removeEventListener("cosless-cart-updated", refreshCounts);
      window.removeEventListener("cosless-favorites-updated", refreshCounts);
      window.removeEventListener("storage", refreshCounts);
    };
  }, []);

  const cartBadge = useMemo(() => (cartCount > 99 ? "99+" : cartCount), [cartCount]);
  const favoritesBadge = useMemo(
    () => (favoritesCount > 99 ? "99+" : favoritesCount),
    [favoritesCount]
  );

  return (
    <div className="flex items-center gap-5 text-[#16324a]">
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Abrir búsqueda"
        className="transition hover:scale-110"
      >
        <FiSearch className="text-[1.75rem]" />
      </button>

      <Link
        href="/account"
        aria-label="Cuenta"
        className="transition hover:scale-110"
      >
        <FiUser className="text-[1.75rem]" />
      </Link>

      <Link
        href="/favoritos"
        aria-label="Favoritos"
        className="relative transition hover:scale-110"
      >
        <FiHeart className="text-[1.75rem]" />
        {favoritesCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#19b7c9] px-1 text-[11px] font-extrabold text-white">
            {favoritesBadge}
          </span>
        )}
      </Link>

      <Link
        href="/carrito"
        aria-label="Carrito"
        className="relative transition hover:scale-110"
      >
        <FiShoppingBag className="text-[1.75rem]" />
        {cartCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full bg-[#19b7c9] px-1 text-[11px] font-extrabold text-white">
            {cartBadge}
          </span>
        )}
      </Link>
    </div>
  );
}