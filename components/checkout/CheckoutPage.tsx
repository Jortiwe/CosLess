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

type FieldState = "neutral" | "valid" | "invalid";

function getInputClass(state: FieldState) {
  const base =
    "h-14 w-full rounded-2xl border bg-white px-4 text-[15px] text-[#16324a] outline-none transition placeholder:text-[#8ba4b3] focus:bg-white";

  if (state === "valid") {
    return `${base} border-emerald-300 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]`;
  }

  if (state === "invalid") {
    return `${base} border-red-300 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]`;
  }

  return `${base} border-[#cfeaf6] focus:border-[#19b7c9] focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)]`;
}

function getTextareaClass() {
  return "min-h-[120px] w-full resize-y rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-[15px] text-[#16324a] outline-none transition placeholder:text-[#8ba4b3] focus:border-[#19b7c9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)]";
}

function FloatingMessage({
  show,
  type,
  children,
}: {
  show: boolean;
  type: "valid" | "invalid" | "info";
  children: React.ReactNode;
}) {
  if (!show) return null;

  const classes =
    type === "valid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "invalid"
      ? "border-red-200 bg-red-50 text-red-600"
      : "border-[#cfeaf6] bg-white text-[#7a96a7]";

  return (
    <span
      className={`pointer-events-none absolute right-3 top-full z-20 mt-1 rounded-full border px-3 py-1 text-[11px] font-extrabold shadow-[0_8px_20px_rgba(22,50,74,0.08)] ${classes}`}
    >
      {children}
    </span>
  );
}

function formatBs(value: number) {
  return `Bs${value.toFixed(2)}`;
}

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

  const [touched, setTouched] = useState({
    customerName: false,
    customerEmail: false,
    customerPhone: false,
    shippingDepartment: false,
  });

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

  const hasProducts = cartItems.length > 0;
  const nameValid = customerName.trim().length >= 3;
  const phoneDigits = customerPhone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 7;
  const departmentValid = Boolean(shippingDepartment.trim());
  const emailValid =
    !customerEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);

  const nameState: FieldState =
    !touched.customerName && !customerName.trim()
      ? "neutral"
      : nameValid
      ? "valid"
      : "invalid";

  const phoneState: FieldState =
    !touched.customerPhone && !customerPhone.trim()
      ? "neutral"
      : phoneValid
      ? "valid"
      : "invalid";

  const emailState: FieldState =
    !customerEmail.trim() && !touched.customerEmail
      ? "neutral"
      : emailValid
      ? "valid"
      : "invalid";

  const departmentState: FieldState = departmentValid ? "valid" : "invalid";

  async function clearCartAfterOrder() {
    if (isDirectCheckout) {
      sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
      setCartItems([]);
      return;
    }

    localStorage.removeItem(CART_KEY);
    localStorage.setItem(CART_KEY, JSON.stringify([]));

    setCartItems([]);

    window.dispatchEvent(new Event("cosless-cart-updated"));
    window.dispatchEvent(new Event("storage"));

    try {
      await fetch("/api/account/store", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: [],
          cart: [],
        }),
      });
    } catch (error) {
      console.error("No se pudo limpiar el carrito de la cuenta:", error);
    }

    window.setTimeout(() => {
      localStorage.removeItem(CART_KEY);
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event("cosless-cart-updated"));
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    setTouched({
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      shippingDepartment: true,
    });

    if (!nameValid) {
      setErrorText("Escribe tu nombre completo.");
      return;
    }

    if (!phoneValid) {
      setErrorText("Escribe un teléfono válido.");
      return;
    }

    if (!emailValid) {
      setErrorText("El correo no tiene un formato válido.");
      return;
    }

    if (!departmentValid) {
      setErrorText("Selecciona un departamento.");
      return;
    }

    if (!hasProducts) {
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

      await clearCartAfterOrder();

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

      <section className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-5 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="group relative inline-flex items-center text-sm font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
          >
            <span className="mr-1">←</span>
            Volver
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#19b7c9] transition-all duration-300 group-hover:w-full" />
          </button>

          {!isDirectCheckout && (
            <button
              type="button"
              onClick={() => router.push("/carrito")}
              className="group relative inline-flex items-center text-sm font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
            >
              Carrito
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#19b7c9] transition-all duration-300 group-hover:w-full" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#19b7c9] shadow-[0_8px_20px_rgba(22,50,74,0.04)]">
            Finalizar pedido
          </span>

          <h1 className="mt-3 text-[2rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.8rem]">
            Completa tus datos
          </h1>

          <p className="mt-2 hidden max-w-2xl text-sm font-semibold leading-7 text-[#4b6b80] sm:block">
            Luego se abrirá WhatsApp con el mensaje listo.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <form
              onSubmit={handleSubmit}
              className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7 lg:p-8"
            >
              <div className="grid gap-x-5 gap-y-7 md:grid-cols-2">
                <div className="relative md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Nombre completo
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onBlur={() =>
                      setTouched((current) => ({
                        ...current,
                        customerName: true,
                      }))
                    }
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className={getInputClass(nameState)}
                  />

                  <FloatingMessage show={nameState === "valid"} type="valid">
                    Correcto
                  </FloatingMessage>

                  <FloatingMessage
                    show={nameState === "invalid"}
                    type="invalid"
                  >
                    Mínimo 3 letras
                  </FloatingMessage>
                </div>

                <div className="relative">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-bold text-[#16324a]">
                      Correo electrónico
                    </label>

                    <span className="text-xs font-extrabold text-[#7a96a7]">
                      Opcional
                    </span>
                  </div>

                  <input
                    type="email"
                    value={customerEmail}
                    onBlur={() =>
                      setTouched((current) => ({
                        ...current,
                        customerEmail: true,
                      }))
                    }
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={getInputClass(emailState)}
                  />

                  <FloatingMessage
                    show={Boolean(customerEmail.trim()) && emailState === "valid"}
                    type="valid"
                  >
                    Correo válido
                  </FloatingMessage>

                  <FloatingMessage
                    show={emailState === "invalid"}
                    type="invalid"
                  >
                    Formato inválido
                  </FloatingMessage>
                </div>

                <div className="relative">
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    value={customerPhone}
                    onBlur={() =>
                      setTouched((current) => ({
                        ...current,
                        customerPhone: true,
                      }))
                    }
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="7xxxxxxx"
                    className={getInputClass(phoneState)}
                  />

                  <FloatingMessage show={phoneState === "valid"} type="valid">
                    Correcto
                  </FloatingMessage>

                  <FloatingMessage
                    show={phoneState === "invalid"}
                    type="invalid"
                  >
                    Mínimo 7 números
                  </FloatingMessage>
                </div>

                <div className="relative">
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Departamento
                  </label>

                  <select
                    value={shippingDepartment}
                    onBlur={() =>
                      setTouched((current) => ({
                        ...current,
                        shippingDepartment: true,
                      }))
                    }
                    onChange={(e) => setShippingDepartment(e.target.value)}
                    className={getInputClass(departmentState)}
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>

                  <FloatingMessage
                    show={touched.shippingDepartment && departmentState === "valid"}
                    type="valid"
                  >
                    Seleccionado
                  </FloatingMessage>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Tipo de entrega
                  </label>

                  <select
                    value={shippingType}
                    onChange={(e) => setShippingType(e.target.value)}
                    className={getInputClass("neutral")}
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Recojo / entrega acordada</option>
                    <option value="por_coordinar">Por coordinar</option>
                  </select>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-bold text-[#16324a]">
                      Ciudad
                    </label>

                    <span className="text-xs font-extrabold text-[#7a96a7]">
                      Opcional
                    </span>
                  </div>

                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="Ej. Sacaba"
                    className={getInputClass("neutral")}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-bold text-[#16324a]">
                      Zona
                    </label>

                    <span className="text-xs font-extrabold text-[#7a96a7]">
                      Opcional
                    </span>
                  </div>

                  <input
                    type="text"
                    value={shippingZone}
                    onChange={(e) => setShippingZone(e.target.value)}
                    placeholder="Ej. Centro"
                    className={getInputClass("neutral")}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-bold text-[#16324a]">
                      Nota adicional
                    </label>

                    <span className="text-xs font-extrabold text-[#7a96a7]">
                      Opcional
                    </span>
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Color, talla, detalle especial, consulta..."
                    className={getTextareaClass()}
                  />
                </div>
              </div>
            </form>

            {errorText && (
              <div className="fixed bottom-5 left-1/2 z-[9998] w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 shadow-[0_16px_40px_rgba(22,50,74,0.18)]">
                {errorText}
              </div>
            )}

            {successText && (
              <div className="fixed bottom-5 left-1/2 z-[9998] w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-[0_16px_40px_rgba(22,50,74,0.18)]">
                {successText}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !mounted || !hasProducts}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-[22px] bg-[#19b7c9] px-8 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(25,183,201,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-60 sm:h-16"
            >
              {loading ? "Creando pedido..." : "Crear pedido y abrir WhatsApp"}
            </button>
          </div>

          <aside className="rounded-[34px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7 xl:sticky xl:top-6 xl:h-fit">
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
                      className="h-24 w-20 shrink-0 rounded-2xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-base font-bold leading-6 text-[#16324a]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        Cantidad: {item.quantity}
                      </p>

                      <p className="mt-2 text-base font-extrabold text-[#19b7c9]">
                        {formatBs(item.price * item.quantity)}
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
                <span>{formatBs(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-[#4b6b80]">
                <span>Envío</span>
                <span>{formatBs(shippingCost)}</span>
              </div>

              <div className="h-px bg-[#e4f1f7]" />

              <div className="flex items-center justify-between text-lg font-extrabold text-[#16324a]">
                <span>Total</span>
                <span>{formatBs(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}