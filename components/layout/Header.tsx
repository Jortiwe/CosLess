"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiHeart,
  FiLogOut,
  FiMenu,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import { FaFacebookMessenger, FaWhatsapp } from "react-icons/fa";
import SearchTrigger from "../search/SearchTrigger";
import { getCartItems, getFavoriteItems } from "../../lib/storage";

type SessionUser = {
  userId?: string;
  email?: string;
  role?: string;
  nickname?: string;
  fullName?: string;
};

type SessionResponse = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user?: SessionUser | null;
};

type CartItem = {
  quantity?: number;
};

const WHATSAPP_URL =
  "https://wa.me/59160769356?text=" +
  encodeURIComponent("Hola, quiero consultar sobre la tienda CosLess.");

const FACEBOOK_URL =
  "https://m.me/jorge.alvarez.742658?ref=" +
  encodeURIComponent("Hola, quiero consultar sobre la tienda CosLess.");

const menuCategories = [
  { label: "Ver todo", href: "/buscar?q=" },
  { label: "Cosplays", href: "/buscar?q=cosplays" },
  { label: "Pelucas", href: "/buscar?q=pelucas" },
  { label: "Lentes", href: "/buscar?q=lentes" },
  { label: "Mallas", href: "/buscar?q=mallas" },
  { label: "Accesorios", href: "/buscar?q=accesorios" },
  { label: "Preventa", href: "/buscar?q=preventa" },
  { label: "Novedades", href: "/buscar?q=novedades" },
  { label: "Ofertas", href: "/buscar?q=ofertas" },
];

export default function Header() {
  const pathname = usePathname();
  const hideSocialLinksBar = pathname === "/account";

  const [showSocialBar, setShowSocialBar] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [cartPulse, setCartPulse] = useState(false);
  const [favoritesPulse, setFavoritesPulse] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const lastDirection = useRef<"up" | "down" | null>(null);

  const prevCartCount = useRef(0);
  const prevFavoritesCount = useRef(0);

  const refreshHeaderCounts = useCallback(() => {
    const cartItems = getCartItems() as CartItem[];
    const favoriteItems = getFavoriteItems();

    const totalCart = cartItems.reduce((acc: number, item: CartItem) => {
      return acc + (item.quantity || 0);
    }, 0);

    setCartCount(totalCart);
    setFavoritesCount(favoriteItems.length);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        const data: SessionResponse = await res.json();

        if (!cancelled) {
          setIsAdmin(Boolean(data.isAdmin));
          setIsLoggedIn(Boolean(data.isLoggedIn));
          setSessionUser(data.user || null);
          setSessionReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setIsLoggedIn(false);
          setSessionUser(null);
          setSessionReady(true);
        }
      }
    }

    loadSession();
    refreshHeaderCounts();

    return () => {
      cancelled = true;
    };
  }, [pathname, refreshHeaderCounts]);

  useEffect(() => {
    const handleCartUpdate = () => refreshHeaderCounts();
    const handleFavoritesUpdate = () => refreshHeaderCounts();
    const handleStorage = () => refreshHeaderCounts();

    window.addEventListener("cosless-cart-updated", handleCartUpdate);
    window.addEventListener("cosless-favorites-updated", handleFavoritesUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cosless-cart-updated", handleCartUpdate);
      window.removeEventListener(
        "cosless-favorites-updated",
        handleFavoritesUpdate
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshHeaderCounts]);

  useEffect(() => {
    if (cartCount !== prevCartCount.current) {
      if (prevCartCount.current !== 0 || cartCount !== 0) {
        setCartPulse(false);
        requestAnimationFrame(() => setCartPulse(true));
        setTimeout(() => setCartPulse(false), 350);
      }
      prevCartCount.current = cartCount;
    }
  }, [cartCount]);

  useEffect(() => {
    if (favoritesCount !== prevFavoritesCount.current) {
      if (prevFavoritesCount.current !== 0 || favoritesCount !== 0) {
        setFavoritesPulse(false);
        requestAnimationFrame(() => setFavoritesPulse(true));
        setTimeout(() => setFavoritesPulse(false), 350);
      }
      prevFavoritesCount.current = favoritesCount;
    }
  }, [favoritesCount]);

  useEffect(() => {
    if (hideSocialLinksBar) return;

    const HIDE_OFFSET = 18;
    const SHOW_OFFSET = 12;
    const TOP_LIMIT = 8;

    const updateScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (currentY <= TOP_LIMIT) {
        if (!showSocialBar) setShowSocialBar(true);
        lastDirection.current = null;
        lastScrollY.current = currentY;
        ticking.current = false;
        return;
      }

      if (Math.abs(diff) < 2) {
        ticking.current = false;
        return;
      }

      if (diff > 0) {
        if (Math.abs(diff) >= HIDE_OFFSET || lastDirection.current === "down") {
          if (showSocialBar) setShowSocialBar(false);
          lastDirection.current = "down";
        }
      }

      if (diff < 0) {
        if (Math.abs(diff) >= SHOW_OFFSET || lastDirection.current === "up") {
          if (!showSocialBar) setShowSocialBar(true);
          lastDirection.current = "up";
        }
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScroll);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideSocialLinksBar, showSocialBar]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const cartBadge = useMemo(
    () => (cartCount > 99 ? "99+" : String(cartCount)),
    [cartCount]
  );

  const favoritesBadge = useMemo(
    () => (favoritesCount > 99 ? "99+" : String(favoritesCount)),
    [favoritesCount]
  );

  return (
    <>
      <header className="sticky top-0 z-50 select-none border-b border-[#cfeaf6] bg-[#f7fdff]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1700px] px-3 sm:px-5 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
          <div className="grid min-h-[72px] grid-cols-[54px_1fr_auto] items-center gap-1 sm:min-h-[84px] sm:grid-cols-[72px_1fr_auto] sm:gap-2 md:grid-cols-[120px_1fr_120px] md:min-h-[92px] lg:grid-cols-[220px_1fr_220px] lg:min-h-[100px]">
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Abrir menú"
                onClick={() => setIsMenuOpen(true)}
                className="group flex h-10 w-10 items-center justify-center rounded-2xl text-[#16324a] transition duration-200 hover:scale-110 sm:h-11 sm:w-11 md:h-12 md:w-12"
              >
                <FiMenu className="text-[1.7rem] transition duration-200 group-hover:text-[#19b7c9] sm:text-[1.85rem] md:text-[2rem]" />
              </button>
            </div>

            <Link
              href="/"
              className="flex min-w-0 flex-col items-center justify-center text-center transition duration-200 hover:scale-[1.02]"
              aria-label="Ir a la página principal"
            >
              <div className="truncate text-[1.55rem] font-extrabold leading-none tracking-wide text-[#19b7c9] sm:text-[1.9rem] md:text-[2.25rem] lg:text-[2.7rem]">
                CosLess
              </div>
              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.26em] text-[#4b6b80] sm:mt-1.5 sm:text-[9px] md:mt-2 md:text-[11px] lg:text-[12px]">
                Cosplay Store
              </p>
            </Link>

            <div className="relative flex items-center justify-end">
              {sessionReady && isAdmin && (
                <Link
                  href="/admin"
                  className="absolute right-[210px] hidden rounded-2xl border border-[#bfefff] bg-[#eaf8ff] px-4 py-2 text-sm font-bold text-[#19b7c9] transition hover:border-[#19b7c9] hover:bg-white xl:inline-flex"
                >
                  Panel admin
                </Link>
              )}

              <div className="flex items-center justify-end gap-0 sm:gap-0.5 md:gap-1.5">
                <SearchTrigger className="group flex h-8 w-8 items-center justify-center rounded-2xl text-[#16324a] transition duration-200 hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11" />

                <Link
                  href="/account"
                  aria-label="Mi cuenta"
                  className="group flex h-8 w-8 items-center justify-center rounded-2xl text-[#16324a] transition duration-200 hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
                >
                  <FiUser className="text-[1.12rem] transition duration-200 group-hover:text-[#19b7c9] sm:text-[1.18rem] md:text-[1.28rem] lg:text-[1.38rem]" />
                </Link>

                <Link
                  href="/favoritos"
                  aria-label="Favoritos"
                  className="group relative flex h-8 w-8 items-center justify-center rounded-2xl text-[#16324a] transition duration-200 hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
                >
                  <FiHeart
                    className={`text-[1.12rem] transition duration-200 group-hover:text-[#19b7c9] sm:text-[1.18rem] md:text-[1.28rem] lg:text-[1.38rem] ${
                      favoritesPulse ? "scale-125 text-[#19b7c9]" : ""
                    }`}
                  />
                  {favoritesCount > 0 && (
                    <span
                      className={`absolute right-[-1px] top-[-2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#19b7c9] px-1 text-[9px] font-bold text-white sm:h-[17px] sm:min-w-[17px] md:h-[18px] md:min-w-[18px] md:text-[10px] lg:h-5 lg:min-w-5 ${
                        favoritesPulse ? "scale-125" : ""
                      }`}
                    >
                      {favoritesBadge}
                    </span>
                  )}
                </Link>

                <Link
                  href="/carrito"
                  aria-label="Carrito"
                  className="group relative flex h-8 w-8 items-center justify-center rounded-2xl text-[#16324a] transition duration-200 hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
                >
                  <FiShoppingBag
                    className={`text-[1.12rem] transition duration-200 group-hover:text-[#19b7c9] sm:text-[1.18rem] md:text-[1.28rem] lg:text-[1.38rem] ${
                      cartPulse ? "scale-125 text-[#19b7c9]" : ""
                    }`}
                  />
                  {cartCount > 0 && (
                    <span
                      className={`absolute right-[-1px] top-[-2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#19b7c9] px-1 text-[9px] font-bold text-white sm:h-[17px] sm:min-w-[17px] md:h-[18px] md:min-w-[18px] md:text-[10px] lg:h-5 lg:min-w-5 ${
                        cartPulse ? "scale-125" : ""
                      }`}
                    >
                      {cartBadge}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {!hideSocialLinksBar && (
            <div
              className={`overflow-hidden border-t transition-[max-height,opacity] duration-200 ease-out ${
                showSocialBar
                  ? "max-h-12 border-[#d9eef7] opacity-100"
                  : "max-h-0 border-transparent opacity-0"
              }`}
            >
              <div className="flex items-center justify-center py-[6px] sm:py-[7px]">
                <div className="flex flex-wrap items-center justify-center gap-2 text-center text-[0.74rem] font-semibold text-[#19b7c9] sm:text-[0.82rem] md:text-[0.86rem]">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="group flex items-center gap-1.5 rounded-lg px-2 py-[2px] transition duration-200 hover:scale-110"
                  >
                    <FaWhatsapp className="text-[0.78rem] transition duration-200 group-hover:text-[#0ea5b7] sm:text-[0.82rem]" />
                    <span className="underline underline-offset-4">WhatsApp</span>
                  </a>

                  <span className="px-1 text-[#7fb8c8]">|</span>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Messenger"
                    className="group flex items-center gap-1.5 rounded-lg px-2 py-[2px] transition duration-200 hover:scale-110"
                  >
                    <FaFacebookMessenger className="text-[0.76rem] transition duration-200 group-hover:text-[#0ea5b7] sm:text-[0.8rem]" />
                    <span className="underline underline-offset-4">Messenger</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {isLoggedIn && (
        <a
          href="/api/auth/logout"
          className="fixed right-0 top-[42%] z-[70] hidden -translate-y-1/2 rounded-l-2xl bg-[#e63946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(230,57,70,0.28)] transition hover:bg-[#d62839] lg:flex lg:items-center lg:gap-2"
        >
          <FiLogOut />
          Cerrar sesión
        </a>
      )}

      <div
        className={`fixed inset-0 z-[80] transition duration-300 ${
          isMenuOpen
            ? "pointer-events-auto bg-black/35 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`fixed left-2 top-2 z-[90] h-[calc(100dvh-16px)] w-[92%] max-w-[420px] overflow-hidden rounded-[32px] border border-[#d7eef7] bg-[#f8fcff] shadow-[0_24px_70px_rgba(20,50,80,0.18)] transition duration-300 select-none sm:left-3 sm:top-3 sm:h-[calc(100dvh-24px)] sm:w-[88%] sm:rounded-[34px] ${
          isMenuOpen ? "translate-x-0" : "-translate-x-[110%]"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-[#e2f1f7] px-5 py-4 sm:px-6 sm:py-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#8aa5b4]">
                Menú
              </p>
              <h2 className="mt-1 text-[1.9rem] font-extrabold leading-none text-[#16324a] sm:text-[2rem]">
                CosLess
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#16324a] shadow-[0_6px_18px_rgba(22,50,74,0.08)] transition hover:scale-110 hover:bg-[#eaf8ff] hover:text-[#19b7c9]"
            >
              <FiX className="text-[1.9rem]" />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
            <div className="grid gap-1">
              {menuCategories.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex min-h-[38px] items-center justify-between rounded-[16px] px-4 py-1 text-[1rem] font-extrabold text-[#16324a] transition duration-200 hover:bg-[#dff6ff] hover:text-[#149db0] active:scale-[0.99] sm:min-h-[40px] sm:py-1.5 sm:text-[1.05rem]"
                  style={{ WebkitUserSelect: "none", userSelect: "none" }}
                >
                  <span className="leading-none">{item.label}</span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eefaff] text-[#19b7c9] transition duration-200 group-hover:bg-white group-hover:translate-x-1 group-hover:shadow-[0_6px_16px_rgba(25,183,201,0.18)]">
                    <span className="text-[0.92rem] font-extrabold">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="shrink-0 border-t border-[#e2f1f7] bg-[#f2fbff] px-5 py-3 sm:px-6">
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="rounded-[22px] bg-white p-3.5 shadow-[0_6px_18px_rgba(22,50,74,0.05)] sm:rounded-[24px] sm:p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8aa5b4]">
                    Tu cuenta
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#16324a] sm:text-lg">
                    {sessionUser?.nickname || sessionUser?.fullName || "Mi cuenta"}
                  </p>
                  <p className="mt-1 break-all text-sm text-[#4b6b80]">
                    {sessionUser?.email || "Cuenta activa"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Link
                    href="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#16324a] transition hover:bg-[#eaf8ff] hover:text-[#19b7c9]"
                  >
                    Mi perfil
                  </Link>

                  <Link
                    href="/account/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#16324a] transition hover:bg-[#eaf8ff] hover:text-[#19b7c9]"
                  >
                    Historial de pedidos
                  </Link>

                  <Link
                    href="/account/password"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#16324a] transition hover:bg-[#eaf8ff] hover:text-[#19b7c9]"
                  >
                    Cambiar contraseña
                  </Link>

                  <a
                    href="/api/auth/logout"
                    className="rounded-2xl bg-[#ffe9eb] px-4 py-2.5 text-sm font-bold text-[#d62839] transition hover:bg-[#ffd9dd]"
                  >
                    Cerrar sesión
                  </a>
                </div>

                <div className="flex items-center gap-3 pt-1 text-[#16324a]">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[1.2rem] shadow-[0_6px_18px_rgba(22,50,74,0.08)] transition hover:scale-110 hover:text-[#19b7c9]"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[1.2rem] shadow-[0_6px_18px_rgba(22,50,74,0.08)] transition hover:scale-110 hover:text-[#19b7c9]"
                    aria-label="Messenger"
                  >
                    <FaFacebookMessenger />
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center gap-3 rounded-2xl px-2 py-1 text-[1rem] font-bold text-[#16324a] transition hover:text-[#19b7c9]"
                >
                  <FiUser className="text-[1.2rem]" />
                  Acceso
                </Link>

                <div className="mt-3 flex items-center gap-3 text-[#16324a]">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[1.2rem] shadow-[0_6px_18px_rgba(22,50,74,0.08)] transition hover:scale-110 hover:text-[#19b7c9]"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[1.2rem] shadow-[0_6px_18px_rgba(22,50,74,0.08)] transition hover:scale-110 hover:text-[#19b7c9]"
                    aria-label="Messenger"
                  >
                    <FaFacebookMessenger />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}