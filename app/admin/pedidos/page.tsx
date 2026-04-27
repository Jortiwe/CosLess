import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import AdminBackButton from "../../../components/admin/AdminBackButton";

type OrderItem = {
  _id: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  total?: number;
  status?: string;
  createdAt?: string | Date;
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
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "contacted":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "preparing":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "shipped":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "delivered":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default async function AdminOrdersPage() {
  await connectDB();

  const rawOrders = await Order.find().sort({ createdAt: -1 }).lean();
  const orders = JSON.parse(JSON.stringify(rawOrders)) as OrderItem[];

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestión de pedidos</h1>
            <p className="mt-2 text-[#4b6b80]">
              Revisa todos los pedidos creados en la tienda.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-[#6f8798]">
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Teléfono</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Acción</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="rounded-2xl bg-white px-4 py-6 text-sm text-[#4b6b80]"
                    >
                      No hay pedidos todavía.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
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
                      <td className="px-3 py-4 text-sm text-[#4b6b80]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="rounded-r-2xl px-3 py-4">
                        <Link
                          href={`/admin/pedidos/${order._id}`}
                          className="inline-flex rounded-xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white"
                        >
                          Ver / editar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}