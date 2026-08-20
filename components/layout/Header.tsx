"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  clearLocalShopState,
  getCartItems,
  getFavoriteItems,
  loadAccountStoreToLocal,
  setGuestShopMode,
} from "../../lib/storage";
import { COSLESS_IMAGES } from "../../lib/coslessImages";

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

const HEADER_IMAGES = {
  logo: COSLESS_IMAGES.header.logo,
  cart: COSLESS_IMAGES.header.cart,
};

const menuCategories = [
  { label: "Ver todo", href: "/productos" },
  { label: "Cosplays", href: "/categoria/cosplays" },
  { label: "Pelucas", href: "/categoria/pelucas" },
  { label: "Lentes", href: "/categoria/lentes" },
  { label: "Accesorios", href: "/categoria/accesorios" },
  { label: "Preventa", href: "/categoria/preventa" },
  { label: "Novedades", href: "/novedades" },
  { label: "Ofertas", href: "/productos?section=ofertas" },
];

function HeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hideSocialLinksBar = pathname === "/account";

  const [showSocialBar, setShowSocialBar] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionToast, setSessionToast] = useState("");

  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [cartPulse, setCartPulse] = useState(false);
  const [favoritesPulse, setFavoritesPulse] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const accumulatedScroll = useRef(0);
  const socialBarVisibleRef = useRef(true);

  const prevCartCount = useRef(0);
  const prevFavoritesCount = useRef(0);
  const countsInitialized = useRef(false);

  const isSearchPage = pathname.startsWith("/buscar");
  const isAccountPage =
    pathname.startsWith("/account") || pathname.startsWith("/perfil");
  const isFavoritesPage = pathname.startsWith("/favoritos");
  const isCartPage = pathname.startsWith("/carrito");

  const profileHref = isLoggedIn ? "/perfil" : "/account";
  const displayName =
    sessionUser?.nickname || sessionUser?.fullName || "Mi cuenta";

  const refreshHeaderCounts = useCallback((skipPulse = false) => {
    const cartItems = getCartItems() as CartItem[];
    const favoriteItems = getFavoriteItems();

    const totalCart = cartItems.reduce((acc: number, item: CartItem) => {
      return acc + (item.quantity || 0);
    }, 0);

    const totalFavorites = favoriteItems.length;

    if (!countsInitialized.current) {
      prevCartCount.current = totalCart;
      prevFavoritesCount.current = totalFavorites;
      countsInitialized.current = true;
    } else if (!skipPulse) {
      if (totalCart !== prevCartCount.current) {
        setCartPulse(false);
        requestAnimationFrame(() => setCartPulse(true));
        window.setTimeout(() => setCartPulse(false), 350);
      }

      if (totalFavorites !== prevFavoritesCount.current) {
        setFavoritesPulse(false);
        requestAnimationFrame(() => setFavoritesPulse(true));
        window.setTimeout(() => setFavoritesPulse(false), 350);
      }

      prevCartCount.current = totalCart;
      prevFavoritesCount.current = totalFavorites;
    } else {
      prevCartCount.current = totalCart;
      prevFavoritesCount.current = totalFavorites;
    }

    setCartCount(totalCart);
    setFavoritesCount(totalFavorites);
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

          if (data.isLoggedIn) {
            await loadAccountStoreToLocal();
            refreshHeaderCounts(true);
          } else {
            setGuestShopMode();
          }
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setIsLoggedIn(false);
          setSessionUser(null);
          setSessionReady(true);
          setGuestShopMode();
        }
      }
    }

    loadSession();
    refreshHeaderCounts(true);

    return () => {
      cancelled = true;
    };
  }, [pathname, refreshHeaderCounts]);

  useEffect(() => {
    const sessionStatus = searchParams.get("session");
    const logoutStatus = searchParams.get("logout");

    if (logoutStatus === "1") {
      clearLocalShopState();

      const timer = window.setTimeout(() => {
        window.history.replaceState({}, "", "/");
      }, 300);

      return () => window.clearTimeout(timer);
    }

    if (sessionStatus === "login") {
      setSessionToast("Sesión iniciada correctamente.");
    }

    if (sessionStatus === "register") {
      setSessionToast("Cuenta creada correctamente. Sesión abierta.");
    }

    if (sessionStatus === "login" || sessionStatus === "register") {
      const timer = window.setTimeout(() => {
        setSessionToast("");
        window.history.replaceState({}, "", "/");
      }, 3500);

      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleCartUpdate = () => refreshHeaderCounts(false);
    const handleFavoritesUpdate = () => refreshHeaderCounts(false);
    const handleStorage = () => refreshHeaderCounts(false);

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
    if (hideSocialLinksBar) {
      setShowSocialBar(false);
      socialBarVisibleRef.current = false;
      return;
    }

    const TOP_LIMIT = 12;
    const DEAD_ZONE = 5;
    const HIDE_AFTER = 95;
    const SHOW_AFTER = 70;

    lastScrollY.current = window.scrollY;
    accumulatedScroll.current = 0;
    lastDirection.current = null;

    const setVisible = (visible: boolean) => {
      if (socialBarVisibleRef.current === visible) return;

      socialBarVisibleRef.current = visible;
      setShowSocialBar(visible);
    };

    if (window.scrollY <= TOP_LIMIT) {
      setVisible(true);
    }

    const updateScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (currentY <= TOP_LIMIT) {
        accumulatedScroll.current = 0;
        lastDirection.current = null;
        lastScrollY.current = currentY;
        setVisible(true);
        ticking.current = false;
        return;
      }

      if (Math.abs(diff) < DEAD_ZONE) {
        ticking.current = false;
        return;
      }

      const direction: "up" | "down" = diff > 0 ? "down" : "up";

      if (lastDirection.current !== direction) {
        accumulatedScroll.current = 0;
        lastDirection.current = direction;
      }

      accumulatedScroll.current += Math.abs(diff);

      if (direction === "down" && accumulatedScroll.current >= HIDE_AFTER) {
        setVisible(false);
        accumulatedScroll.current = 0;
      }

      if (direction === "up" && accumulatedScroll.current >= SHOW_AFTER) {
        setVisible(true);
        accumulatedScroll.current = 0;
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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hideSocialLinksBar]);

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
      {sessionToast && (
        <div className="fixed left-1/2 top-[92px] z-[120] w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 rounded-[22px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-4 text-center shadow-[0_14px_40px_var(--shadow-strong)]">
          <p className="text-sm font-extrabold text-[color:var(--primary)]">
            {sessionToast}
          </p>
          <p className="mt-1 text-xs font-medium text-[color:var(--text-soft)]">
            Bienvenido a CosLess.
          </p>
        </div>
      )}

      <header className="sticky top-0 z-[110] select-none border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1700px] px-3 sm:px-5 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
          <div className="grid min-h-[78px] grid-cols-[54px_1fr_auto] items-center gap-1 sm:min-h-[86px] sm:grid-cols-[72px_1fr_auto] sm:gap-2 md:grid-cols-[120px_1fr_120px] md:min-h-[94px] lg:grid-cols-[220px_1fr_220px] lg:min-h-[104px]">
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Abrir menú"
                onClick={() => setIsMenuOpen(true)}
                className="group flex h-10 w-10 items-center justify-center rounded-2xl text-[color:var(--text)] transition duration-200 hover:scale-110 hover:text-[color:var(--primary)] sm:h-11 sm:w-11 md:h-12 md:w-12"
              >
                <FiMenu className="text-[1.7rem] transition duration-200 sm:text-[1.85rem] md:text-[2rem]" />
              </button>
            </div>

            <div className="flex min-w-0 items-center justify-center">
              <Link
                href="/"
                className="inline-flex w-fit items-center justify-center text-center transition duration-200 hover:scale-[1.02]"
                aria-label="Ir a la página principal"
              >
                <img
                  src={HEADER_IMAGES.logo}
                  alt="CosLess Cosplay Store"
                  draggable={false}
                  className="pointer-events-auto h-[58px] w-auto max-w-[230px] object-contain sm:h-[66px] sm:max-w-[280px] md:h-[74px] md:max-w-[340px] lg:h-[82px] lg:max-w-[390px]"
                />
              </Link>
            </div>

            <div className="relative flex items-center justify-end">
              {sessionReady && isAdmin && (
                <Link
                  href="/admin"
                  className="absolute right-[210px] hidden rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-2 text-sm font-bold text-[color:var(--primary)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--surface)] xl:inline-flex"
                >
                  Panel admin
                </Link>
              )}

              <div className="flex items-center justify-end gap-0 sm:gap-0.5 md:gap-1.5">
                <div className="relative">
                  {isSearchPage && (
                    <span className="absolute -top-2 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--primary)]" />
                  )}

                  <SearchTrigger className="group flex h-8 w-8 items-center justify-center rounded-2xl text-[color:var(--text)] transition duration-200 hover:scale-110 hover:text-[color:var(--primary)] sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 [&_svg]:text-[1.12rem] sm:[&_svg]:text-[1.18rem] md:[&_svg]:text-[1.28rem] lg:[&_svg]:text-[1.38rem]" />
                </div>

                <div className="relative">
                  {isAccountPage && (
                    <span className="absolute -top-2 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--primary)]" />
                  )}

                  <Link
                    href={profileHref}
                    aria-label={isLoggedIn ? "Mi perfil" : "Mi cuenta"}
                    className="group flex h-8 w-8 items-center justify-center rounded-2xl text-[color:var(--text)] transition duration-200 hover:scale-110 hover:text-[color:var(--primary)] sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
                  >
                    <FiUser className="text-[1.12rem] transition duration-200 sm:text-[1.18rem] md:text-[1.28rem] lg:text-[1.38rem]" />
                  </Link>
                </div>

                <div className="relative">
                  {isFavoritesPage && (
                    <span className="absolute -top-2 left-1/2 z-10 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--primary)]" />
                  )}

                  <Link
                    href="/favoritos"
                    aria-label="Favoritos"
                    className="group relative flex h-8 w-8 items-center justify-center rounded-2xl text-[color:var(--text)] transition duration-200 hover:scale-110 hover:text-[color:var(--primary)] sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
                  >
                    <FiHeart
                      className={`text-[1.12rem] transition duration-200 sm:text-[1.18rem] md:text-[1.28rem] lg:text-[1.38rem] ${
                        favoritesPulse
                          ? "scale-125 text-[color:var(--primary)]"
                          : ""
                      }`}
                    />

                    {favoritesCount > 0 && (
                      <span
                        className={`absolute right-[-1px] top-[-2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[color:var(--primary)] px-1 text-[9px] font-bold text-[color:var(--cos-white)] transition sm:h-[17px] sm:min-w-[17px] md:h-[18px] md:min-w-[18px] md:text-[10px] lg:h-5 lg:min-w-5 ${
                          favoritesPulse ? "scale-125" : ""
                        }`}
                      >
                        {favoritesBadge}
                      </span>
                    )}
                  </Link>
                </div>

                <div className="relative">
                  {isCartPage && (
                    <span className="absolute -top-2 left-1/2 z-10 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--primary)]" />
                  )}

                  <Link
                    href="/carrito"
                    aria-label="Carrito"
                    className="group relative flex h-8 w-8 items-center justify-center rounded-2xl transition duration-200 hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
                  >
                    <img
                      src={HEADER_IMAGES.cart}
                      alt="Carrito"
                      draggable={false}
                      className={`h-[1.52rem] w-[1.52rem] object-contain transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 sm:h-[1.62rem] sm:w-[1.62rem] md:h-[1.78rem] md:w-[1.78rem] lg:h-[1.95rem] lg:w-[1.95rem] ${
                        cartPulse ? "scale-125" : ""
                      }`}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <FiShoppingBag className="absolute text-[1.12rem] text-[color:var(--text)] opacity-0 transition duration-200 sm:text-[1.18rem] md:text-[1.28rem] lg:text-[1.38rem]" />

                    {cartCount > 0 && (
                      <span
                        className={`absolute right-[-1px] top-[-2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[color:var(--primary)] px-1 text-[9px] font-bold text-[color:var(--cos-white)] transition sm:h-[17px] sm:min-w-[17px] md:h-[18px] md:min-w-[18px] md:text-[10px] lg:h-5 lg:min-w-5 ${
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
          </div>

          {!hideSocialLinksBar && (
            <div
              className={`overflow-hidden border-t transition-[max-height,opacity,border-color] duration-300 ease-out ${
                showSocialBar
                  ? "max-h-12 border-[color:var(--border-soft)] opacity-100"
                  : "max-h-0 border-transparent opacity-0"
              }`}
            >
              <div className="flex items-center justify-center py-[6px] sm:py-[7px]">
                <div className="flex flex-wrap items-center justify-center gap-2 text-center text-[0.74rem] font-semibold text-[color:var(--primary)] sm:text-[0.82rem] md:text-[0.86rem]">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="group flex items-center gap-1.5 rounded-lg px-2 py-[2px] transition duration-200 hover:scale-110"
                  >
                    <FaWhatsapp className="text-[0.78rem] transition duration-200 group-hover:text-[color:var(--primary-dark)] sm:text-[0.82rem]" />
                    <span className="underline underline-offset-4">
                      WhatsApp
                    </span>
                  </a>

                  <span className="px-1 text-[color:var(--primary-light)]">
                    |
                  </span>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Messenger"
                    className="group flex items-center gap-1.5 rounded-lg px-2 py-[2px] transition duration-200 hover:scale-110"
                  >
                    <FaFacebookMessenger className="text-[0.76rem] transition duration-200 group-hover:text-[color:var(--primary-dark)] sm:text-[0.8rem]" />
                    <span className="underline underline-offset-4">
                      Messenger
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[120] transition duration-300 ${
          isMenuOpen
            ? "pointer-events-auto bg-black/35 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`fixed left-2 top-2 z-[130] h-[calc(100dvh-16px)] w-[92%] max-w-[420px] overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_24px_70px_var(--shadow-strong)] transition duration-300 select-none sm:left-3 sm:top-3 sm:h-[calc(100dvh-24px)] sm:w-[88%] sm:rounded-[34px] ${
          isMenuOpen ? "translate-x-0" : "-translate-x-[110%]"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--border-soft)] px-5 py-4 sm:px-6 sm:py-4">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex min-w-0 items-center"
            >
              <img
                src={HEADER_IMAGES.logo}
                alt="CosLess Cosplay Store"
                draggable={false}
                className="h-14 w-auto max-w-[230px] object-contain sm:h-16"
              />
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--text)] shadow-[0_6px_18px_var(--shadow)] transition hover:scale-110 hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--primary)]"
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
                  className="group flex min-h-[38px] items-center justify-between rounded-[16px] px-4 py-1 text-[1rem] font-extrabold text-[color:var(--text)] transition duration-200 hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--primary-dark)] active:scale-[0.99] sm:min-h-[40px] sm:py-1.5 sm:text-[1.05rem]"
                  style={{ WebkitUserSelect: "none", userSelect: "none" }}
                >
                  <span className="leading-none">{item.label}</span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--primary)] transition duration-200 group-hover:translate-x-1 group-hover:bg-[color:var(--surface)] group-hover:shadow-[0_6px_16px_var(--shadow-strong)]">
                    <span className="text-[0.92rem] font-extrabold">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="shrink-0 border-t border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-5 py-3 sm:px-6">
            {isLoggedIn ? (
              <div className="space-y-3">
                <Link
                  href="/perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex max-w-full items-center gap-3 rounded-2xl px-2 py-1 text-[1rem] font-bold text-[color:var(--text)] transition hover:text-[color:var(--primary)]"
                >
                  <FiUser className="shrink-0 text-[1.2rem]" />
                  <span className="truncate">{displayName}</span>
                </Link>

                <a
                  href="/api/auth/logout"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--danger-bg)] px-4 py-3 text-sm font-bold text-[color:var(--danger)] transition hover:bg-[color:var(--danger-bg-hover)]"
                >
                  <FiLogOut />
                  Cerrar sesión
                </a>

                <div className="flex items-center gap-3 pt-1 text-[color:var(--text)]">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface)] text-[1.2rem] shadow-[0_6px_18px_var(--shadow)] transition hover:scale-110 hover:text-[color:var(--primary)]"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface)] text-[1.2rem] shadow-[0_6px_18px_var(--shadow)] transition hover:scale-110 hover:text-[color:var(--primary)]"
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
                  className="inline-flex items-center gap-3 rounded-2xl px-2 py-1 text-[1rem] font-bold text-[color:var(--text)] transition hover:text-[color:var(--primary)]"
                >
                  <FiUser className="text-[1.2rem]" />
                  Acceso
                </Link>

                <div className="mt-3 flex items-center gap-3 text-[color:var(--text)]">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface)] text-[1.2rem] shadow-[0_6px_18px_var(--shadow)] transition hover:scale-110 hover:text-[color:var(--primary)]"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface)] text-[1.2rem] shadow-[0_6px_18px_var(--shadow)] transition hover:scale-110 hover:text-[color:var(--primary)]"
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

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}
