"use client";

import Link from "next/link";
import Image from "next/image";
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

const CART_KEY = "cosless_cart";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error leyendo carrito:", error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems, mounted]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  function increaseQuantity(productId: string) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(productId: string) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
    );
  }

  function removeItem(productId: string) {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1450px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
            Tu carrito
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Revisa tus productos
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-8 text-[#4b6b80]">
            Aquí podrás ver los productos que añadiste, cambiar cantidades y
            continuar al checkout para generar tu pedido por WhatsApp.
          </p>
        </div>

        {mounted && cartItems.length === 0 ? (
          <div className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] px-6 py-14 text-center shadow-[0_10px_30px_rgba(22,50,74,0.06)] sm:px-10 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf8ff] text-[#19b7c9]">
              <FiShoppingBag className="text-[2rem]" />
            </div>

            <h2 className="mt-8 text-4xl font-extrabold leading-tight text-[#16324a] sm:text-5xl">
              Tu carrito está vacío
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#4b6b80] sm:text-lg">
              Cuando añadas productos al carrito, aparecerán aquí para que
              puedas revisarlos antes de enviar tu pedido.
            </p>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-[#19b7c9] px-8 py-4 text-base font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0ea5b7]"
              >
                Continuar comprando
              </Link>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-[#16324a] sm:text-3xl">
                ¿Tienes una cuenta?
              </h3>

              <p className="mt-3 text-base leading-8 text-[#4b6b80]">
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
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7 lg:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold">Productos añadidos</h2>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-2xl border border-[#f2c7c7] bg-white px-4 py-3 text-sm font-bold text-[#c94b4b] transition hover:bg-[#fff5f5]"
                  >
                    Vaciar carrito
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <article
                    key={item.productId}
                    className="flex flex-col gap-4 rounded-[28px] border border-[#d9eef7] bg-white p-4 sm:flex-row"
                  >
                    <div className="overflow-hidden rounded-[20px] bg-[#eef9ff]">
                      <Image
                        src={item.mainImage}
                        alt={item.title}
                        width={180}
                        height={220}
                        className="h-[180px] w-full object-cover sm:h-[180px] sm:w-[150px]"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold leading-8 text-[#16324a]">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-lg font-bold text-[#19b7c9]">
                          Bs{item.price}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 rounded-2xl border border-[#cfeaf6] bg-[#f7fdff] px-3 py-2">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.productId)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#16324a] transition hover:bg-[#eef9ff]"
                          >
                            <FiMinus />
                          </button>

                          <span className="min-w-[36px] text-center text-base font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.productId)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#16324a] transition hover:bg-[#eef9ff]"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {item.slug && (
                            <Link
                              href={`/producto/${item.slug}`}
                              className="rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
                            >
                              Ver producto
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-[#f2c7c7] bg-white px-4 py-3 text-sm font-bold text-[#c94b4b] transition hover:bg-[#fff5f5]"
                          >
                            <FiTrash2 />
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7 lg:sticky lg:top-6 lg:h-fit">
              <h2 className="text-2xl font-extrabold text-[#16324a]">
                Resumen
              </h2>

              <div className="mt-6 space-y-3 rounded-3xl border border-[#d9eef7] bg-white p-5">
                <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                  <span>Productos</span>
                  <span>{cartItems.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                  <span>Subtotal</span>
                  <span>Bs{subtotal}</span>
                </div>

                <div className="h-px bg-[#e4f1f7]" />

                <div className="flex items-center justify-between text-lg font-extrabold text-[#16324a]">
                  <span>Total estimado</span>
                  <span>Bs{subtotal}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#eaf8ff] px-4 py-3 text-sm leading-6 text-[#4b6b80]">
                El costo de envío se calculará en el checkout según el
                departamento y tipo de entrega.
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#19b7c9] px-8 text-base font-bold text-white transition hover:scale-[1.01] hover:bg-[#0ea5b7]"
                >
                  Ir a comprar
                </Link>

                <Link
                  href="/"
                  className="inline-flex h-14 w-full items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-8 text-base font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
                >
                  Seguir comprando
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}