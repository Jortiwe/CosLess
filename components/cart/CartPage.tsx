"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  mainImage: string;
  slug?: string;
};

type ProductFromApi = {
  _id: string;
  title?: string;
  price?: number;
  stock?: number;
  mainImage?: string;
  slug?: string;
  status?: "stock" | "preventa";
  isActive?: boolean;
};

type StockInfo = {
  productId: string;
  title: string;
  price: number;
  stock: number;
  mainImage: string;
  slug?: string;
  status: "stock" | "preventa";
  isActive: boolean;
};

const CART_KEY = "cosless_cart";

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    typeof item.mainImage === "string"
  );
}

function readCartFromStorage(): CartItem[] {
  try {
    const savedCart = localStorage.getItem(CART_KEY);

    if (!savedCart) return [];

    const parsed: unknown = JSON.parse(savedCart);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidCartItem);
  } catch (error) {
    console.error("Error leyendo carrito:", error);
    return [];
  }
}

function formatBs(value: number) {
  return `Bs${value}`;
}

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";
  const value = src.trim();
  return value || "/placeholder-product.png";
}

async function saveAccountCart(items: CartItem[]) {
  try {
    await fetch("/api/account/store", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartItems: items,
      }),
    });
  } catch {
    // Si no hay sesión, no pasa nada. El carrito local sigue funcionando.
  }
}

function CartLoadingBlock() {
  return (
    <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center shadow-[0_10px_30px_var(--shadow)] sm:px-8 sm:py-20">
      <div className="mx-auto flex flex-col items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[7px] border-[var(--border-soft)]" />
          <div className="absolute inset-0 animate-spin rounded-full border-[7px] border-transparent border-b-[var(--primary)] border-r-[var(--primary)]" />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[1.5rem] font-extrabold text-[var(--primary)] shadow-sm">
            C
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, StockInfo>>({});
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [syncMessage, setSyncMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCartAndSyncStock() {
      setIsLoadingCart(true);

      const localCart = readCartFromStorage();

      try {
        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        const products = Array.isArray(data.products)
          ? (data.products as ProductFromApi[])
          : [];

        const nextStockMap: Record<string, StockInfo> = {};

        for (const product of products) {
          nextStockMap[String(product._id)] = {
            productId: String(product._id),
            title: product.title || "Producto",
            price: Number(product.price || 0),
            stock: Number(product.stock || 0),
            mainImage: getSafeImage(product.mainImage),
            slug: product.slug || "",
            status: product.status === "preventa" ? "preventa" : "stock",
            isActive: product.isActive !== false,
          };
        }

        setStockMap(nextStockMap);

        let changed = false;

        const syncedCart = localCart
          .map((item) => {
            const product = nextStockMap[item.productId];

            if (!product || !product.isActive) {
              changed = true;
              return null;
            }

            if (product.stock <= 0) {
              changed = true;
              return null;
            }

            const nextQuantity = Math.min(item.quantity, product.stock);

            if (
              nextQuantity !== item.quantity ||
              item.price !== product.price ||
              item.title !== product.title ||
              item.mainImage !== product.mainImage ||
              item.slug !== product.slug
            ) {
              changed = true;
            }

            return {
              productId: item.productId,
              title: product.title,
              price: product.price,
              quantity: nextQuantity,
              mainImage: product.mainImage,
              slug: product.slug,
            };
          })
          .filter(Boolean) as CartItem[];

        setCartItems(syncedCart);

        if (changed) {
          setSyncMessage(
            "Carrito actualizado: algunos productos cambiaron de stock o ya no están disponibles."
          );

          localStorage.setItem(CART_KEY, JSON.stringify(syncedCart));
          window.dispatchEvent(new Event("cosless-cart-updated"));
          await saveAccountCart(syncedCart);
        }
      } catch (error) {
        console.error("Error sincronizando stock del carrito:", error);
        setCartItems(localCart);
      } finally {
        setIsLoadingCart(false);
      }
    }

    loadCartAndSyncStock();
  }, []);

  async function persistCart(nextCart: CartItem[]) {
    setCartItems(nextCart);

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
      window.dispatchEvent(new Event("cosless-cart-updated"));
      await saveAccountCart(nextCart);
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc: number, item: CartItem) => {
      return acc + item.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc: number, item: CartItem) => {
      return acc + item.quantity;
    }, 0);
  }, [cartItems]);

  function increaseQuantity(productId: string) {
    setErrorMessage("");

    const product = stockMap[productId];

    if (!product) {
      setErrorMessage("No se pudo verificar el stock de este producto.");
      return;
    }

    const currentItem = cartItems.find((item) => item.productId === productId);

    if (!currentItem) return;

    if (product.stock <= 0) {
      setErrorMessage("Este producto ya no tiene stock disponible.");
      return;
    }

    if (currentItem.quantity + 1 > product.stock) {
      setErrorMessage(`Solo hay ${product.stock} unidad(es) disponibles.`);
      return;
    }

    const nextCart = cartItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    persistCart(nextCart);
  }

  function decreaseQuantity(productId: string) {
    setErrorMessage("");

    const nextCart = cartItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity - 1) }
        : item
    );

    persistCart(nextCart);
  }

  function removeItem(productId: string) {
    setErrorMessage("");

    const nextCart = cartItems.filter((item) => item.productId !== productId);
    persistCart(nextCart);
  }

  function clearCart() {
    setErrorMessage("");
    setSyncMessage("");
    persistCart([]);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pt-6">
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
            <FiShoppingBag className="mr-2 text-[1.05rem]" />
            Tu carrito
          </span>
        </div>

        {isLoadingCart ? (
          <CartLoadingBlock />
        ) : (
          <>
            {syncMessage && (
              <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text-soft)]">
                {syncMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 rounded-2xl border border-[var(--danger-bg-hover)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-bold text-[var(--danger)]">
                {errorMessage}
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center shadow-[0_10px_30px_var(--shadow)] sm:px-8 sm:py-12">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)] sm:h-20 sm:w-20">
                  <FiShoppingBag className="text-[1.8rem] sm:text-[2rem]" />
                </div>

                <h2 className="mt-5 text-[2.1rem] font-extrabold leading-tight text-[var(--text)] sm:text-[2.8rem]">
                  Tu carrito está vacío
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-soft)]">
                  Cuando añadas productos al carrito, aparecerán aquí para que
                  puedas revisarlos antes de enviar tu pedido.
                </p>

                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-7 py-4 text-base font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[var(--primary-dark)]"
                  >
                    Continuar comprando
                  </Link>
                </div>

                <div className="mt-7">
                  <h3 className="text-2xl font-bold text-[var(--text)]">
                    ¿Tienes una cuenta?
                  </h3>

                  <p className="mt-2 text-base leading-8 text-[var(--text-soft)]">
                    <Link
                      href="/account"
                      className="font-semibold text-[var(--primary)] underline underline-offset-4"
                    >
                      Acceso
                    </Link>{" "}
                    para guardar favoritos, carrito y avanzar más rápido.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
                <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-5 lg:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[1.45rem] font-extrabold">
                      Productos añadidos
                    </h2>

                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-2xl border border-[var(--danger-bg-hover)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--danger)] transition hover:bg-[var(--danger-bg)]"
                      >
                        Vaciar carrito
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item: CartItem) => {
                      const product = stockMap[item.productId];
                      const isPreventa = product?.status === "preventa";
                      const stock = product?.stock ?? 0;
                      const reachedLimit = Boolean(
                        product && item.quantity >= stock
                      );
                      const productHref = item.slug
                        ? `/producto/${item.slug}`
                        : "";

                      return (
                        <article
                          key={item.productId}
                          className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4"
                        >
                          <div className="flex flex-row items-start gap-3 sm:gap-4">
                            {productHref ? (
                              <Link
                                href={productHref}
                                className="block w-[88px] shrink-0 overflow-hidden rounded-[16px] bg-[var(--bg)] transition hover:scale-[1.02] hover:ring-2 hover:ring-[var(--primary)]/40 sm:w-[105px]"
                              >
                                <img
                                  src={getSafeImage(item.mainImage)}
                                  alt={item.title}
                                  className="aspect-[4/5] w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.src =
                                      "/placeholder-product.png";
                                  }}
                                />
                              </Link>
                            ) : (
                              <div className="w-[88px] shrink-0 overflow-hidden rounded-[16px] bg-[var(--bg)] sm:w-[105px]">
                                <img
                                  src={getSafeImage(item.mainImage)}
                                  alt={item.title}
                                  className="aspect-[4/5] w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.src =
                                      "/placeholder-product.png";
                                  }}
                                />
                              </div>
                            )}

                            <div className="flex min-w-0 flex-1 flex-col">
                              {productHref ? (
                                <Link
                                  href={productHref}
                                  className="line-clamp-2 text-[1.15rem] font-extrabold leading-6 text-[var(--text)] transition hover:text-[var(--primary)] sm:text-[1.35rem] sm:leading-7"
                                >
                                  {item.title}
                                </Link>
                              ) : (
                                <h3 className="line-clamp-2 text-[1.15rem] font-extrabold leading-6 text-[var(--text)] sm:text-[1.35rem] sm:leading-7">
                                  {item.title}
                                </h3>
                              )}

                              <p className="mt-2 text-lg font-bold text-[var(--primary)]">
                                {formatBs(item.price)}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
                                {product
                                  ? isPreventa
                                    ? `Preventa · Stock disponible: ${stock}`
                                    : `Stock disponible: ${stock}`
                                  : "Verificando stock..."}
                              </p>

                              {reachedLimit && (
                                <p className="mt-1 text-sm font-bold text-[var(--danger)]">
                                  Llegaste al límite de stock disponible.
                                </p>
                              )}

                              <div className="mt-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-2 sm:px-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        decreaseQuantity(item.productId)
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--bg)]"
                                    >
                                      <FiMinus />
                                    </button>

                                    <span className="min-w-[30px] text-center text-base font-bold sm:min-w-[36px]">
                                      {item.quantity}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        increaseQuantity(item.productId)
                                      }
                                      disabled={Boolean(reachedLimit)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <FiPlus />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                  {productHref && (
                                    <Link
                                      href={productHref}
                                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    >
                                      Ver producto
                                    </Link>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.productId)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-[var(--danger-bg-hover)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--danger)] transition hover:bg-[var(--danger-bg)]"
                                  >
                                    <FiTrash2 />
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <aside className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-5 lg:sticky lg:top-24 lg:h-fit">
                  <h2 className="text-[1.45rem] font-extrabold text-[var(--text)]">
                    Resumen
                  </h2>

                  <div className="mt-4 space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between text-sm text-[var(--text-soft)]">
                      <span>Productos</span>
                      <span className="font-bold text-[var(--text)]">
                        {totalItems}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[var(--text-soft)]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[var(--text)]">
                        {formatBs(subtotal)}
                      </span>
                    </div>

                    <div className="h-px bg-[var(--border-soft)]" />

                    <div className="flex items-center justify-between text-lg font-extrabold text-[var(--text)]">
                      <span>Total</span>
                      <span className="text-[var(--primary)]">
                        {formatBs(subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
                    El costo de envío se calculará en el checkout.
                  </div>

                  <div className="mt-5 space-y-3">
                    <Link
                      href="/checkout"
                      className="inline-flex h-13 w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-8 py-4 text-base font-bold text-white transition hover:scale-[1.01] hover:bg-[var(--primary-dark)]"
                    >
                      Ir a comprar
                    </Link>

                    <Link
                      href="/"
                      className="inline-flex h-13 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-4 text-base font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      Seguir comprando
                    </Link>
                  </div>
                </aside>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}