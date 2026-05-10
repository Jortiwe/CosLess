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
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-[1250px] print:max-w-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin/pedidos"
            className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            ← Volver a pedidos
          </Link>

          <PrintReportButton />
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#cfeaf6] bg-white shadow-[0_14px_40px_rgba(22,50,74,0.08)] print:rounded-none print:border-0 print:shadow-none">
          <header className="border-b border-[#d9eef7] bg-[#f7fdff] px-8 py-7 print:bg-white">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-[2.3rem] font-black leading-none tracking-wide text-[#19b7c9]">
                  CosLess
                </div>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-[#4b6b80]">
                  Cosplay Store
                </p>

                <h1 className="mt-7 text-3xl font-black text-[#16324a]">
                  Reporte de pedidos
                </h1>

                <p className="mt-2 text-sm font-semibold text-[#4b6b80]">
                  Resumen general de ventas, estados, clientes, productos
                  pedidos y stock descontado.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#cfeaf6] bg-white px-5 py-4 text-right">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f8798]">
                  Fecha
                </p>

                <p className="mt-1 text-sm font-black text-[#16324a]">
                  {today}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
            <div className="rounded-[22px] bg-[#eaf8ff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Pedidos</p>
              <p className="mt-1 text-2xl font-black text-[#19b7c9]">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#e6f6ed] px-4 py-4">
              <p className="text-xs font-bold text-[#326b4d]">Ventas totales</p>
              <p className="mt-1 text-2xl font-black text-[#16824c]">
                {formatBs(totalSales)}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#fff3dc] px-4 py-4">
              <p className="text-xs font-bold text-[#7d5c12]">
                Pendientes / Contactados
              </p>
              <p className="mt-1 text-2xl font-black text-[#b87d00]">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#ffe8ec] px-4 py-4">
              <p className="text-xs font-bold text-[#9d3040]">Cancelados</p>
              <p className="mt-1 text-2xl font-black text-[#d62839]">
                {cancelledCount}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] bg-[#f8fdff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">
                Pagados / En proceso
              </p>
              <p className="mt-1 text-2xl font-black text-[#6f8798]">
                {paidCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#f2eaff] px-4 py-4">
              <p className="text-xs font-bold text-[#5d36a5]">Entregados</p>
              <p className="mt-1 text-2xl font-black text-[#7c3aed]">
                {deliveredCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#eaf8ff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">
                Productos pedidos
              </p>
              <p className="mt-1 text-2xl font-black text-[#19b7c9]">
                {totalItems}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] border border-[#d9eef7] bg-[#f9fdff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Subtotal</p>
              <p className="mt-1 text-xl font-black text-[#16324a]">
                {formatBs(totalSubtotal)}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#d9eef7] bg-[#f9fdff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Envíos</p>
              <p className="mt-1 text-xl font-black text-[#16324a]">
                {formatBs(totalShipping)}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#d9eef7] bg-[#f9fdff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">
                Stock descontado
              </p>
              <p className="mt-1 text-xl font-black text-[#19b7c9]">
                {deductedCount}
              </p>
            </div>
          </section>

          <section className="px-8 pb-8">
            <div className="overflow-hidden rounded-[24px] border border-[#d9eef7]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#eaf8ff] text-[#16324a]">
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
                        className="px-4 py-6 text-center font-bold text-[#4b6b80]"
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
                          className="border-t border-[#e5f3fa]"
                        >
                          <td className="px-4 py-3 font-bold text-[#16324a]">
                            {order.orderCode || "Sin código"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {order.customerName || "Sin cliente"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {order.customerPhone || "-"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {statusLabel(order.status)}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {shippingTypeLabel(order.shippingType)}
                          </td>

                          <td className="px-4 py-3 font-bold text-[#16324a]">
                            {itemCount}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {formatBs(order.subtotal)}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {formatBs(order.shippingCost)}
                          </td>

                          <td className="px-4 py-3 font-bold text-[#19b7c9]">
                            {formatBs(order.total)}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {order.inventoryDeducted
                              ? "Descontado"
                              : "Sin descontar"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
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
            <h2 className="mb-3 text-xl font-black text-[#16324a]">
              Detalle de productos por pedido
            </h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-[24px] border border-[#d9eef7] bg-[#f9fdff] p-5 text-sm font-bold text-[#4b6b80]">
                  No hay detalles para mostrar.
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={`${order._id}-detail`}
                    className="rounded-[24px] border border-[#d9eef7] bg-[#f9fdff] p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#16324a]">
                          {order.orderCode || "Sin código"}
                        </p>
                        <p className="text-xs font-semibold text-[#4b6b80]">
                          {order.customerName || "Sin cliente"} ·{" "}
                          {statusLabel(order.status)}
                        </p>
                      </div>

                      <p className="text-sm font-black text-[#19b7c9]">
                        {formatBs(order.total)}
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-[18px] border border-[#e5f3fa] bg-white">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-[#eaf8ff] text-[#16324a]">
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
                                className="px-3 py-3 text-center font-bold text-[#4b6b80]"
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
                                  className="border-t border-[#e5f3fa]"
                                >
                                  <td className="px-3 py-2 font-bold text-[#16324a]">
                                    {item.title || "Producto"}
                                  </td>

                                  <td className="px-3 py-2 text-[#4b6b80]">
                                    {quantity}
                                  </td>

                                  <td className="px-3 py-2 text-[#4b6b80]">
                                    {formatBs(price)}
                                  </td>

                                  <td className="px-3 py-2 font-bold text-[#19b7c9]">
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

          <footer className="border-t border-[#d9eef7] bg-[#f7fdff] px-8 py-5 text-center print:bg-white">
            <p className="text-xs font-semibold text-[#6f8798]">
              Reporte generado por CosLess · Sistema interno de administración
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}