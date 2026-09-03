"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import DeleteOrderButton from "./DeleteOrderButton";

type OrderItem = {
  _id: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  total?: number;
  status?: string;
  inventoryDeducted?: boolean;
  createdAt?: string | Date;
};

type AdminOrdersClientProps = {
  orders: OrderItem[];
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

function formatDate(dateValue?: string | Date) {
  if (!dateValue) return "Sin fecha";

  const date = new Date(dateValue);

  return date.toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status?: string) {
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
      return status || "Sin estado";
  }
}

function statusClass(status?: string) {
  switch (status) {
    case "paid":
      return "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-bg)]";
    case "pending":
      return "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-bg)]";
    case "contacted":
      return "bg-[var(--surface-soft)] text-[var(--primary)] border-[var(--border)]";
    case "preparing":
      return "bg-[var(--featured-bg)] text-[var(--featured)] border-[var(--featured-bg)]";
    case "shipped":
      return "bg-[var(--surface-soft)] text-[var(--primary-dark)] border-[var(--border)]";
    case "delivered":
      return "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-bg)]";
    case "cancelled":
      return "bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-bg-hover)]";
    default:
      return "bg-[var(--surface-soft)] text-[var(--text-muted)] border-[var(--border-soft)]";
  }
}

export default function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return orders;

    return orders.filter((order) => {
      const searchableText = [
        order.orderCode,
        order.customerName,
        order.customerPhone,
        statusLabel(order.status),
        formatBs(order.total),
        formatDate(order.createdAt),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [orders, search]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-[2.15rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
            Gestión de pedidos
          </h1>

          <p className="mt-2 hidden text-[var(--text-soft)] sm:block">
            Revisa todos los pedidos creados en la tienda.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/admin/pedidos/reporte"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Reporte</span>
              <span className="hidden sm:inline">Reporte PDF</span>
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-[26px] border border-[var(--border)] bg-white p-3 shadow-[0_10px_26px_var(--shadow)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar pedido..."
              className="h-12 w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-white focus:shadow-[0_0_0_4px_var(--shadow)] sm:h-14 sm:placeholder:text-sm"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[var(--text-muted)]">
            <span>
              {filteredOrders.length} de {orders.length} pedidos
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[var(--primary)] transition hover:text-[var(--primary-dark)]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-[var(--text-muted)]">
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Teléfono</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Acción</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="rounded-2xl bg-white px-4 py-6 text-sm text-[var(--text-soft)]"
                    >
                      No hay pedidos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="bg-white">
                      <td className="rounded-l-2xl px-3 py-4 font-bold">
                        {order.orderCode || "Sin código"}
                      </td>

                      <td className="px-3 py-4">
                        {order.customerName || "Sin cliente"}
                      </td>

                      <td className="px-3 py-4">
                        {order.customerPhone || "Sin teléfono"}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {formatBs(order.total)}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                            order.status
                          )}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        {order.inventoryDeducted ? (
                          <span className="inline-flex rounded-full border border-[var(--success-bg)] bg-[var(--success-bg)] px-3 py-1 text-xs font-bold text-[var(--success)]">
                            Descontado
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                            Sin descontar
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-4 text-sm text-[var(--text-soft)]">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="rounded-r-2xl px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/pedidos/${order._id}`}
                            className="inline-flex rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]"
                          >
                            Ver / editar
                          </Link>

                          <DeleteOrderButton
                            orderId={order._id}
                            orderCode={order.orderCode}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filteredOrders.length === 0 ? (
              <div className="rounded-[24px] bg-white px-4 py-6 text-sm font-semibold text-[var(--text-soft)]">
                No hay pedidos que coincidan con la búsqueda.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article
                  key={order._id}
                  className="rounded-[24px] border border-transparent bg-white p-4 shadow-[0_8px_22px_var(--shadow)] transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-[var(--text)]">
                        {order.orderCode || "Sin código"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-sm text-[var(--text-soft)]">
                        {order.customerName || "Sin cliente"}
                      </p>

                      <p className="mt-1 text-sm text-[var(--text-soft)]">
                        {order.customerPhone || "Sin teléfono"}
                      </p>
                    </div>

                    <p className="shrink-0 text-base font-black text-[var(--primary)]">
                      {formatBs(order.total)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                        order.status
                      )}`}
                    >
                      {statusLabel(order.status)}
                    </span>

                    {order.inventoryDeducted ? (
                      <span className="inline-flex rounded-full border border-[var(--success-bg)] bg-[var(--success-bg)] px-3 py-1 text-xs font-bold text-[var(--success)]">
                        Descontado
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                        Sin descontar
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">
                    {formatDate(order.createdAt)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/admin/pedidos/${order._id}`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-xs font-extrabold text-white transition hover:bg-[var(--primary-dark)]"
                    >
                      Ver / editar
                    </Link>

                    <div className="[&_button]:!h-11 [&_button]:!w-full [&_button]:!rounded-2xl [&_button]:!text-xs [&_button]:!font-extrabold">
                      <DeleteOrderButton
                        orderId={order._id}
                        orderCode={order.orderCode}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}