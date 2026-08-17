import Link from "next/link";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import PrintReportButton from "../../../../components/admin/PrintReportButton";

export const dynamic = "force-dynamic";

type OrderItem = {
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
  inventoryDeducted?: boolean;
  createdAt?: string | Date;
  items?: Array<{
    title?: string;
    quantity?: number;
    price?: number;
  }>;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0.00";
  return `Bs${value.toFixed(2)}`;
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

function shippingTypeLabel(value?: string) {
  if (value === "delivery") return "Delivery";
  if (value === "pickup") return "Recojo";
  if (value === "por_coordinar") return "Por coordinar";
  return "Por coordinar";
}

export default async function OrdersReportPage() {
  await connectDB();

  const rawOrders = await Order.find().sort({ createdAt: -1 }).lean();
  const orders = JSON.parse(JSON.stringify(rawOrders)) as OrderItem[];

  const totalOrders = orders.length;

  const totalSales = orders.reduce((acc, order) => {
    return acc + Number(order.total || 0);
  }, 0);

  const totalSubtotal = orders.reduce((acc, order) => {
    return acc + Number(order.subtotal || 0);
  }, 0);

  const totalShipping = orders.reduce((acc, order) => {
    return acc + Number(order.shippingCost || 0);
  }, 0);

  const pendingCount = orders.filter(
    (order) => order.status === "pending" || order.status === "contacted"
  ).length;

  const paidCount = orders.filter(
    (order) =>
      order.status === "paid" ||
      order.status === "preparing" ||
      order.status === "shipped" ||
      order.status === "delivered"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const deductedCount = orders.filter((order) => order.inventoryDeducted).length;

  const totalItems = orders.reduce((acc, order) => {
    return (
      acc +
      (order.items || []).reduce((itemAcc, item) => {
        return itemAcc + Number(item.quantity || 0);
      }, 0)
    );
  }, 0);

  const today = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-8 text-[var(--text)] print:bg-[var(--cos-white)] print:px-0 print:py-0">
      <div className="mx-auto max-w-[1250px] print:max-w-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin/pedidos"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            ← Volver a pedidos
          </Link>

          <PrintReportButton />
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_14px_40px_var(--shadow)] print:rounded-none print:border-0 print:shadow-none">
          <header className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-8 py-7 print:bg-[var(--cos-white)]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-[2.3rem] font-black leading-none tracking-wide text-[var(--primary)]">
                  CosLess
                </div>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-soft)]">
                  Cosplay Store
                </p>

                <h1 className="mt-7 text-3xl font-black text-[var(--text)]">
                  Reporte de pedidos
                </h1>

                <p className="mt-2 text-sm font-semibold text-[var(--text-soft)]">
                  Resumen general de ventas, estados, clientes, productos
                  pedidos y stock descontado.
                </p>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-right">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Fecha
                </p>

                <p className="mt-1 text-sm font-black text-[var(--text)]">
                  {today}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
            <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Pedidos
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--primary)]">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--success-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--success)]">
                Ventas totales
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--success)]">
                {formatBs(totalSales)}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--warning-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--warning)]">
                Pendientes / Contactados
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--warning)]">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--danger-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--danger)]">
                Cancelados
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--danger)]">
                {cancelledCount}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Pagados / En proceso
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--text-muted)]">
                {paidCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--featured-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--featured)]">
                Entregados
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--featured)]">
                {deliveredCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Productos pedidos
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--primary)]">
                {totalItems}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Subtotal
              </p>
              <p className="mt-1 text-xl font-black text-[var(--text)]">
                {formatBs(totalSubtotal)}
              </p>
            </div>

            <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Envíos
              </p>
              <p className="mt-1 text-xl font-black text-[var(--text)]">
                {formatBs(totalShipping)}
              </p>
            </div>

            <div className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Stock descontado
              </p>
              <p className="mt-1 text-xl font-black text-[var(--primary)]">
                {deductedCount}
              </p>
            </div>
          </section>

          <section className="px-8 pb-8">
            <div className="overflow-hidden rounded-[24px] border border-[var(--border-soft)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--surface-soft)] text-[var(--text)]">
                  <tr>
                    <th className="px-4 py-3 font-black">Código</th>
                    <th className="px-4 py-3 font-black">Cliente</th>
                    <th className="px-4 py-3 font-black">Teléfono</th>
                    <th className="px-4 py-3 font-black">Estado</th>
                    <th className="px-4 py-3 font-black">Entrega</th>
                    <th className="px-4 py-3 font-black">Productos</th>
                    <th className="px-4 py-3 font-black">Subtotal</th>
                    <th className="px-4 py-3 font-black">Envío</th>
                    <th className="px-4 py-3 font-black">Total</th>
                    <th className="px-4 py-3 font-black">Stock</th>
                    <th className="px-4 py-3 font-black">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-6 text-center font-bold text-[var(--text-soft)]"
                      >
                        No hay pedidos registrados.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const itemCount = (order.items || []).reduce(
                        (acc, item) => acc + Number(item.quantity || 0),
                        0
                      );

                      return (
                        <tr
                          key={order._id}
                          className="border-t border-[var(--border-soft)]"
                        >
                          <td className="px-4 py-3 font-bold text-[var(--text)]">
                            {order.orderCode || "Sin código"}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {order.customerName || "Sin cliente"}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {order.customerPhone || "-"}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {statusLabel(order.status)}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {shippingTypeLabel(order.shippingType)}
                          </td>

                          <td className="px-4 py-3 font-bold text-[var(--text)]">
                            {itemCount}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {formatBs(order.subtotal)}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {formatBs(order.shippingCost)}
                          </td>

                          <td className="px-4 py-3 font-bold text-[var(--primary)]">
                            {formatBs(order.total)}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {order.inventoryDeducted
                              ? "Descontado"
                              : "Sin descontar"}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-soft)]">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="px-8 pb-8">
            <h2 className="mb-3 text-xl font-black text-[var(--text)]">
              Detalle de productos por pedido
            </h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5 text-sm font-bold text-[var(--text-soft)]">
                  No hay detalles para mostrar.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={`${order._id}-detail`}
                    className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[var(--text)]">
                          {order.orderCode || "Sin código"}
                        </p>
                        <p className="text-xs font-semibold text-[var(--text-soft)]">
                          {order.customerName || "Sin cliente"} ·{" "}
                          {statusLabel(order.status)}
                        </p>
                      </div>

                      <p className="text-sm font-black text-[var(--primary)]">
                        {formatBs(order.total)}
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)]">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-[var(--surface-soft)] text-[var(--text)]">
                          <tr>
                            <th className="px-3 py-2 font-black">Producto</th>
                            <th className="px-3 py-2 font-black">Cantidad</th>
                            <th className="px-3 py-2 font-black">Precio</th>
                            <th className="px-3 py-2 font-black">Subtotal</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(order.items || []).length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-3 py-3 text-center font-bold text-[var(--text-soft)]"
                              >
                                Sin productos.
                              </td>
                            </tr>
                          ) : (
                            (order.items || []).map((item, index) => {
                              const quantity = Number(item.quantity || 0);
                              const price = Number(item.price || 0);

                              return (
                                <tr
                                  key={`${order._id}-${item.title}-${index}`}
                                  className="border-t border-[var(--border-soft)]"
                                >
                                  <td className="px-3 py-2 font-bold text-[var(--text)]">
                                    {item.title || "Producto"}
                                  </td>

                                  <td className="px-3 py-2 text-[var(--text-soft)]">
                                    {quantity}
                                  </td>

                                  <td className="px-3 py-2 text-[var(--text-soft)]">
                                    {formatBs(price)}
                                  </td>

                                  <td className="px-3 py-2 font-bold text-[var(--primary)]">
                                    {formatBs(price * quantity)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <footer className="border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-8 py-5 text-center print:bg-[var(--cos-white)]">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Reporte generado por CosLess · Sistema interno de administración
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}