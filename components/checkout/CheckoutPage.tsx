"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  mainImage: string;
  slug?: string;
};

const CART_KEY = "cosless_cart";
const DIRECT_CHECKOUT_KEY = "cosless_direct_checkout";

const shippingRates: Record<string, number> = {
  "La Paz": 18,
  Cochabamba: 15,
  "Santa Cruz": 20,
  Oruro: 17,
  Potosí: 18,
  Chuquisaca: 17,
  Tarija: 19,
  Beni: 24,
  Pando: 28,
};

const departments = [
  "La Paz",
  "Cochabamba",
  "Santa Cruz",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirectCheckout = searchParams.get("direct") === "1";

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingDepartment, setShippingDepartment] = useState("Cochabamba");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZone, setShippingZone] = useState("");
  const [shippingType, setShippingType] = useState("delivery");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const storageKey = isDirectCheckout ? DIRECT_CHECKOUT_KEY : CART_KEY;
      const savedCart = isDirectCheckout
        ? sessionStorage.getItem(storageKey)
        : localStorage.getItem(storageKey);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error leyendo productos del checkout:", error);
    }
  }, [isDirectCheckout]);

  const shippingCost = useMemo(() => {
    if (shippingType === "pickup") return 0;
    if (shippingType === "por_coordinar") return 0;
    return shippingRates[shippingDepartment] ?? 0;
  }, [shippingDepartment, shippingType]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const total = subtotal + shippingCost;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!customerName.trim()) {
      setErrorText("Escribe tu nombre.");
      return;
    }

    if (!customerPhone.trim()) {
      setErrorText("Escribe tu teléfono.");
      return;
    }

    if (!shippingDepartment.trim()) {
      setErrorText("Selecciona un departamento.");
      return;
    }

    if (cartItems.length === 0) {
      setErrorText("No hay productos para finalizar el pedido.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingDepartment,
          shippingCity,
          shippingZone,
          shippingType,
          shippingCost,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo crear el pedido.");
      }

      setSuccessText(`Pedido creado: ${data.order.orderCode}`);

      if (isDirectCheckout) {
        sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
      } else {
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new Event("cosless-cart-updated"));
      }

      setCartItems([]);

      const phone = "59160769356";
      const message = encodeURIComponent(data.whatsappMessage);
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Ocurrió un error inesperado."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            ← Volver
          </button>

          {!isDirectCheckout && (
            <button
              type="button"
              onClick={() => router.push("/carrito")}
              className="inline-flex items-center justify-center rounded-2xl border border-[#cfeaf6] bg-[#f7fdff] px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
            >
              Ir al carrito
            </button>
          )}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7 lg:p-8">
            <div className="mb-6">
              <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
                Finalizar pedido
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Completa tus datos para enviar tu pedido por WhatsApp
              </h1>

              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#4b6b80] sm:text-base">
                Confirma tus datos de contacto y entrega. Luego se abrirá
                WhatsApp con el mensaje listo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="7xxxxxxx"
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Departamento
                  </label>
                  <select
                    value={shippingDepartment}
                    onChange={(e) => setShippingDepartment(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Tipo de entrega
                  </label>
                  <select
                    value={shippingType}
                    onChange={(e) => setShippingType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Recojo / entrega acordada</option>
                    <option value="por_coordinar">Por coordinar</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="Ej. Sacaba"
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Zona
                  </label>
                  <input
                    type="text"
                    value={shippingZone}
                    onChange={(e) => setShippingZone(e.target.value)}
                    placeholder="Ej. Centro"
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Nota adicional
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Color, talla, detalle especial, consulta..."
                    className="min-h-[120px] w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-[15px] outline-none transition focus:border-[#19b7c9]"
                  />
                </div>
              </div>

              {errorText ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {errorText}
                </div>
              ) : null}

              {successText ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successText}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || !mounted || cartItems.length === 0}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#19b7c9] px-8 text-base font-bold text-white transition hover:scale-[1.01] hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creando pedido..." : "Crear pedido y abrir WhatsApp"}
              </button>
            </form>
          </div>

          <aside className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7 lg:sticky lg:top-6 lg:h-fit">
            <h2 className="text-2xl font-extrabold text-[#16324a]">
              Resumen del pedido
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4b6b80]">
              Revisa tus productos antes de enviarlos por WhatsApp.
            </p>

            <div className="mt-6 space-y-4">
              {mounted && cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <article
                    key={item.productId}
                    className="flex gap-4 rounded-3xl border border-[#d9eef7] bg-white p-4"
                  >
                    <Image
                      src={item.mainImage}
                      alt={item.title}
                      width={80}
                      height={96}
                      className="h-24 w-20 rounded-2xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold leading-6 text-[#16324a]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        Cantidad: {item.quantity}
                      </p>

                      <p className="mt-2 text-base font-extrabold text-[#19b7c9]">
                        Bs{item.price * item.quantity}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-[#d9eef7] bg-white px-4 py-5 text-sm text-[#4b6b80]">
                  No hay productos para finalizar el pedido.
                </div>
              )}
            </div>

            <div className="mt-7 space-y-3 rounded-3xl border border-[#d9eef7] bg-white p-5">
              <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                <span>Subtotal</span>
                <span>Bs{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                <span>Envío</span>
                <span>Bs{shippingCost}</span>
              </div>

              <div className="h-px bg-[#e4f1f7]" />

              <div className="flex items-center justify-between text-lg font-extrabold text-[#16324a]">
                <span>Total</span>
                <span>Bs{total}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}