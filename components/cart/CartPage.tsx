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
    <div className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] px-5 py-16 text-center shadow-[0_10px_30px_rgba(22,50,74,0.06)] sm:px-8 sm:py-20">
      <div className="mx-auto flex flex-col items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[7px] border-[#d8eef8]" />
          <div className="absolute inset-0 animate-spin rounded-full border-[7px] border-transparent border-b-[#19b7c9] border-r-[#19b7c9]" />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf8ff] text-[1.5rem] font-extrabold text-[#19b7c9] shadow-sm">
            C
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#19b7c9] [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#19b7c9] [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#19b7c9] [animation-delay:300ms]" />
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
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pt-6">
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
            <FiShoppingBag className="mr-2 text-[1.05rem]" />
            Tu carrito
          </span>
        </div>

        {isLoadingCart ? (
          <CartLoadingBlock />
        ) : (
          <>
            {syncMessage && (
              <div className="mb-4 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-bold text-[#4b6b80]">
                {syncMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {errorMessage}
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] px-5 py-10 text-center shadow-[0_10px_30px_rgba(22,50,74,0.06)] sm:px-8 sm:py-12">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#eaf8ff] text-[#19b7c9] sm:h-20 sm:w-20">
                  <FiShoppingBag className="text-[1.8rem] sm:text-[2rem]" />
                </div>

                <h2 className="mt-5 text-[2.1rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.8rem]">
                  Tu carrito está vacío
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#4b6b80]">
                  Cuando añadas productos al carrito, aparecerán aquí para que
                  puedas revisarlos antes de enviar tu pedido.
                </p>

                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#19b7c9] px-7 py-4 text-base font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0ea5b7]"
                  >
                    Continuar comprando
                  </Link>
                </div>

                <div className="mt-7">
                  <h3 className="text-2xl font-bold text-[#16324a]">
                    ¿Tienes una cuenta?
                  </h3>

                  <p className="mt-2 text-base leading-8 text-[#4b6b80]">
                    <Link
                      href="/account"
                      className="font-semibold text-[#19b7c9] underline underline-offset-4"
                    >
                      Acceso
                    </Link>{" "}
                    para guardar favoritos, carrito y avanzar más rápido.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
                <div className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-4 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-5 lg:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[1.45rem] font-extrabold">
                      Productos añadidos
                    </h2>

                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-2xl border border-[#f2c7c7] bg-white px-4 py-2.5 text-sm font-bold text-[#c94b4b] transition hover:bg-[#fff5f5]"
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
const reachedLimit = Boolean(product && item.quantity >= stock);

                      return (
                        <article
                          key={item.productId}
                          className="rounded-[24px] border border-[#d9eef7] bg-white p-4"
                        >
                          <div className="flex flex-row items-start gap-3 sm:gap-4">
                            <div className="w-[88px] shrink-0 overflow-hidden rounded-[16px] bg-[#eef9ff] sm:w-[105px]">
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

                            <div className="flex min-w-0 flex-1 flex-col">
                              <h3 className="line-clamp-2 text-[1.15rem] font-extrabold leading-6 text-[#16324a] sm:text-[1.35rem] sm:leading-7">
                                {item.title}
                              </h3>

                              <p className="mt-2 text-lg font-bold text-[#19b7c9]">
                                {formatBs(item.price)}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[#6a8798]">
                                {product
  ? isPreventa
    ? `Preventa · Stock disponible: ${stock}`
    : `Stock disponible: ${stock}`
  : "Verificando stock..."}
                              </p>

                              {reachedLimit && (
                                <p className="mt-1 text-sm font-bold text-red-500">
                                  Llegaste al límite de stock disponible.
                                </p>
                              )}

                              <div className="mt-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 rounded-2xl border border-[#cfeaf6] bg-[#f7fdff] px-2 py-2 sm:px-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        decreaseQuantity(item.productId)
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#16324a] transition hover:bg-[#eef9ff]"
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
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#16324a] transition hover:bg-[#eef9ff] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <FiPlus />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                  {item.slug && (
                                    <Link
                                      href={`/producto/${item.slug}`}
                                      className="rounded-2xl border border-[#cfeaf6] bg-white px-4 py-2.5 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
                                    >
                                      Ver producto
                                    </Link>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.productId)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-[#f2c7c7] bg-white px-4 py-2.5 text-sm font-bold text-[#c94b4b] transition hover:bg-[#fff5f5]"
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

                <aside className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-4 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-5 lg:sticky lg:top-24 lg:h-fit">
                  <h2 className="text-[1.45rem] font-extrabold text-[#16324a]">
                    Resumen
                  </h2>

                  <div className="mt-4 space-y-3 rounded-[24px] border border-[#d9eef7] bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                      <span>Productos</span>
                      <span className="font-bold text-[#16324a]">
                        {totalItems}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#16324a]">
                        {formatBs(subtotal)}
                      </span>
                    </div>

                    <div className="h-px bg-[#e4f1f7]" />

                    <div className="flex items-center justify-between text-lg font-extrabold text-[#16324a]">
                      <span>Total</span>
                      <span className="text-[#19b7c9]">
                        {formatBs(subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#eaf8ff] px-4 py-3 text-sm leading-6 text-[#4b6b80]">
                    El costo de envío se calculará en el checkout.
                  </div>

                  <div className="mt-5 space-y-3">
                    <Link
                      href="/checkout"
                      className="inline-flex h-13 w-full items-center justify-center rounded-2xl bg-[#19b7c9] px-8 py-4 text-base font-bold text-white transition hover:scale-[1.01] hover:bg-[#0ea5b7]"
                    >
                      Ir a comprar
                    </Link>

                    <Link
                      href="/"
                      className="inline-flex h-13 w-full items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-8 py-4 text-base font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
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