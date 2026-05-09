"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { FiCalendar, FiPackage, FiShoppingBag } from "react-icons/fi";

type OrderItem = {
  productId?: string;
  title?: string;
  price?: number;
  quantity?: number;
  mainImage?: string;
};

type OrderType = {
  _id: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingDepartment?: string;
  shippingCity?: string;
  shippingZone?: string;
  shippingType?: string;
  shippingCost?: number;
  subtotal?: number;
  total?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0.00";
  return `Bs${value.toFixed(2)}`;
}

function formatDate(dateValue?: string) {
  if (!dateValue) return "Sin fecha";

  return new Date(dateValue).toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";
  const value = src.trim();
  return value || "/placeholder-product.png";
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "contacted":
      return "Contactado";
    case "paid":
      return "Pagado";
    case "preparing":
      return "Preparando";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return "Pendiente";
  }
}

function getStatusClasses(status?: string) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "contacted":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "preparing":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "shipped":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "delivered":
      return "border-teal-200 bg-teal-50 text-teal-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function getProgressSteps(status?: string) {
  if (status === "cancelled") {
    return [
      { label: "Pendiente", active: true },
      { label: "Cancelado", active: true },
    ];
  }

  const order = ["pending", "paid", "shipped", "delivered"];
  const labels: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
  };

  let currentIndex = 0;

  if (status === "pending" || status === "contacted") currentIndex = 0;
  else if (status === "paid" || status === "preparing") currentIndex = 1;
  else if (status === "shipped") currentIndex = 2;
  else if (status === "delivered") currentIndex = 3;

  return order.map((key, index) => ({
    label: labels[key],
    active: index <= currentIndex,
  }));
}

function OrderCard({ order }: { order: OrderType }) {
  const steps = getProgressSteps(order.status);

  return (
    <article className="overflow-hidden rounded-[30px] border border-[#cfeaf6] bg-white shadow-[0_12px_32px_rgba(22,50,74,0.06)] sm:rounded-[34px]">
      <div className="border-b border-[#e5f3fa] bg-[#f8fdff] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#dff4ff] px-3 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-[#19b7c9] sm:px-4 sm:text-xs">
                {order.orderCode || "Sin código"}
              </span>

              <span
                className={`rounded-full border px-3 py-2 text-[0.7rem] font-extrabold sm:px-4 sm:text-xs ${getStatusClasses(
                  order.status
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#4b6b80] sm:text-sm">
              <FiCalendar className="shrink-0 text-[#19b7c9]" />
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="rounded-[22px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(22,50,74,0.04)] sm:text-right">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6f8798]">
              Total
            </p>

            <p className="mt-1 text-[1.45rem] font-black leading-none text-[#19b7c9] sm:text-2xl">
              {formatBs(order.total)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map((step) => (
            <div
              key={step.label}
              className={`shrink-0 rounded-full px-3 py-2 text-[0.7rem] font-extrabold sm:text-xs ${
                step.active
                  ? "bg-[#19b7c9] text-white"
                  : "bg-[#eef7fb] text-[#6a8798]"
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-[#16324a] sm:text-lg">
            <FiPackage className="text-[#19b7c9]" />
            Productos
          </h2>

          <div className="space-y-3">
            {(order.items || []).map((item, index) => (
              <div
                key={`${item.productId || item.title}-${index}`}
                className="flex gap-3 rounded-[22px] border border-[#e5f3fa] bg-[#f9fdff] p-3"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#eaf8ff] sm:h-24 sm:w-20">
                  <img
                    src={getSafeImage(item.mainImage)}
                    alt={item.title || "Producto"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-[#16324a] sm:text-base sm:leading-6">
                    {item.title || "Producto"}
                  </h3>

                  <p className="mt-1 text-xs text-[#4b6b80] sm:text-sm">
                    Cantidad:{" "}
                    <span className="font-bold">{item.quantity || 1}</span>
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-[#19b7c9]">
                    {formatBs(item.price)} c/u
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[26px] border border-[#e5f3fa] bg-[#f9fdff] p-4 sm:p-5">
          <h2 className="text-lg font-extrabold text-[#16324a]">Resumen</h2>

          <div className="mt-4 space-y-3 text-sm text-[#4b6b80]">
            <div className="flex justify-between gap-4">
              <span>Cliente</span>
              <span className="text-right font-extrabold text-[#16324a]">
                {order.customerName || "Sin nombre"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <span className="font-extrabold text-[#16324a]">
                {formatBs(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Envío</span>
              <span className="font-extrabold text-[#16324a]">
                {formatBs(order.shippingCost)}
              </span>
            </div>

            <div className="h-px bg-[#d9eef7]" />

            <div className="flex justify-between gap-4 text-lg font-black text-[#16324a]">
              <span>Total</span>
              <span className="text-[#19b7c9]">{formatBs(order.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  async function loadOrders(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch("/api/account/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setOrders([]);
        setError(data?.error || "No se pudieron obtener tus pedidos.");
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setError("");
      setLastUpdate(
        new Date().toLocaleTimeString("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      setError("No se pudieron obtener tus pedidos.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(true);

    const interval = setInterval(() => {
      loadOrders(false);
    }, 5000);

    const handleFocus = () => loadOrders(false);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-[30px] border border-[#cfeaf6] bg-white px-6 py-12 text-center shadow-[0_12px_32px_rgba(22,50,74,0.06)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dff4ff] border-t-[#19b7c9]" />

          <p className="mt-4 text-sm font-semibold text-[#4b6b80]">
            Cargando pedidos...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-[30px] border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-sm font-bold text-red-600">{error}</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="rounded-[30px] border border-[#cfeaf6] bg-white px-6 py-10 text-center shadow-[0_12px_32px_rgba(22,50,74,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
            <FiShoppingBag className="text-[1.7rem]" />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-[#16324a]">
            Todavía no tienes pedidos
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#4b6b80]">
            Cuando hagas un pedido desde el carrito o compra directa, aparecerá
            aquí.
          </p>

          <Link
            href="/productos"
            className="mt-6 inline-flex rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#0ea5b7]"
          >
            Ver productos
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    );
  }, [orders, loading, error]);

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-start">
          <Link
            href="/perfil"
            className="group relative inline-flex items-center text-sm font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
          >
            <span className="mr-1">←</span>
            Perfil
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#19b7c9] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.6rem]">
              Mis pedidos
            </h1>

            <p className="mt-1 hidden text-sm font-semibold text-[#4b6b80] sm:block">
              Historial de pedidos de tu cuenta.
            </p>
          </div>

          {lastUpdate && (
            <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#7a96a7] shadow-sm">
              {lastUpdate}
            </span>
          )}
        </div>

        {content}
      </section>

      <Footer />
    </main>
  );
}