import Link from "next/link";
import { connectDB } from "../../lib/mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import User from "../../models/User";
import Favorite from "../../models/Favorite";
import News from "../../models/News";
import AdminToolbar from "../../components/admin/AdminToolbar";

type AdminOrderItem = {
  _id: string;
  orderCode?: string;
  customerName?: string;
  total?: number;
  status?: string;
  createdAt?: string | Date;
};

type AdminProductItem = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  stock?: number;
};

type AdminUserItem = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
};

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  href: string;
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

function StatCard({ title, value, subtitle, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group block w-full min-w-0 overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white p-5 shadow-[0_10px_28px_rgba(22,50,74,0.05)] transition hover:-translate-y-1 hover:border-[#19b7c9] hover:shadow-[0_16px_34px_rgba(22,50,74,0.09)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 break-words text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#6f8798] group-hover:text-[#19b7c9] sm:text-xs sm:tracking-[0.2em]">
          {title}
        </p>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf8ff] text-sm font-extrabold text-[#19b7c9] transition group-hover:bg-[#19b7c9] group-hover:text-white">
          →
        </span>
      </div>

      <p className="mt-6 text-[2.6rem] font-black leading-none text-[#16324a] sm:text-[3rem]">
        {value}
      </p>

      <p className="mt-4 text-sm font-semibold leading-6 text-[#4b6b80]">
        {subtitle}
      </p>
    </Link>
  );
}

export default async function AdminPage() {
  await connectDB();

  const [
    ordersCount,
    productsCount,
    usersCount,
    favoritesCount,
    newsCount,
    rawRecentOrders,
    rawRecentProducts,
    rawRecentUsers,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Favorite.countDocuments(),
    News.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Product.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const recentOrders = JSON.parse(
    JSON.stringify(rawRecentOrders)
  ) as AdminOrderItem[];

  const recentProducts = JSON.parse(
    JSON.stringify(rawRecentProducts)
  ) as AdminProductItem[];

  const recentUsers = JSON.parse(
    JSON.stringify(rawRecentUsers)
  ) as AdminUserItem[];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef9ff] px-4 py-6 text-[#16324a] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1700px]">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#19b7c9] shadow-[0_8px_20px_rgba(22,50,74,0.04)]">
              Panel admin
            </span>

            <h1 className="mt-3 text-[2.2rem] font-extrabold leading-tight text-[#16324a] sm:text-[3.2rem]">
              Gestión CosLess
            </h1>

            <p className="mt-2 hidden max-w-3xl text-sm font-semibold leading-7 text-[#4b6b80] sm:block">
              Resumen general de pedidos, productos, usuarios y novedades.
            </p>
          </div>

          <AdminToolbar />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Pedidos"
            value={ordersCount}
            subtitle="Registrados"
            href="/admin/pedidos"
          />

          <StatCard
            title="Productos"
            value={productsCount}
            subtitle="Cargados"
            href="/admin/productos"
          />

          <StatCard
            title="Usuarios"
            value={usersCount}
            subtitle="Cuentas"
            href="/admin/usuarios"
          />

          <StatCard
            title="Favoritos"
            value={favoritesCount}
            subtitle="Guardados"
            href="/admin/favoritos"
          />

          <StatCard
            title="Novedades"
            value={newsCount}
            subtitle="Publicadas"
            href="/admin/novedades"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[30px] border border-[#cfeaf6] bg-white p-5 shadow-[0_12px_32px_rgba(22,50,74,0.06)] sm:rounded-[34px] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-xs font-extrabold text-[#19b7c9]">
                  Pedidos
                </span>

                <h2 className="mt-3 text-2xl font-extrabold text-[#16324a]">
                  Recientes
                </h2>
              </div>

              <Link
                href="/admin/pedidos"
                className="shrink-0 rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#0ea5b7]"
              >
                Gestionar
              </Link>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-[#6f8798]">
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="rounded-2xl bg-[#f7fdff] px-4 py-6 text-sm text-[#4b6b80]"
                      >
                        No hay pedidos todavía.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="bg-[#f7fdff]">
                        <td className="rounded-l-2xl px-3 py-4 font-bold">
                          <Link
                            href="/admin/pedidos"
                            className="hover:text-[#19b7c9]"
                          >
                            {order.orderCode || "Sin código"}
                          </Link>
                        </td>

                        <td className="px-3 py-4">
                          {order.customerName || "Sin cliente"}
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

                        <td className="rounded-r-2xl px-3 py-4 text-sm text-[#4b6b80]">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {recentOrders.length === 0 ? (
                <div className="rounded-2xl bg-[#f7fdff] px-4 py-6 text-sm text-[#4b6b80]">
                  No hay pedidos todavía.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link
                    key={order._id}
                    href="/admin/pedidos"
                    className="block rounded-[24px] border border-[#e5f3fa] bg-[#f7fdff] p-4 transition hover:border-[#19b7c9]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-[#16324a]">
                          {order.orderCode || "Sin código"}
                        </p>

                        <p className="mt-1 text-sm text-[#4b6b80]">
                          {order.customerName || "Sin cliente"}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-extrabold text-[#19b7c9]">
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

                      <span className="text-xs font-semibold text-[#6f8798]">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-[#cfeaf6] bg-white p-5 shadow-[0_12px_32px_rgba(22,50,74,0.06)] sm:rounded-[34px] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-xs font-extrabold text-[#19b7c9]">
                    Productos
                  </span>

                  <h2 className="mt-3 text-2xl font-extrabold text-[#16324a]">
                    Nuevos
                  </h2>
                </div>

                <Link
                  href="/admin/productos"
                  className="shrink-0 rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#0ea5b7]"
                >
                  Gestionar
                </Link>
              </div>

              <div className="space-y-3">
                {recentProducts.length === 0 ? (
                  <div className="rounded-2xl bg-[#f7fdff] px-4 py-4 text-sm text-[#4b6b80]">
                    No hay productos todavía.
                  </div>
                ) : (
                  recentProducts.map((product) => (
                    <Link
                      key={product._id}
                      href="/admin/productos"
                      className="block rounded-[22px] bg-[#f7fdff] px-4 py-4 transition hover:text-[#19b7c9]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 font-extrabold text-[#16324a]">
                            {product.title || "Sin título"}
                          </h3>

                          <p className="mt-1 text-sm text-[#4b6b80]">
                            {product.category || "Sin categoría"} ·{" "}
                            {product.status || "Sin estado"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-extrabold text-[#19b7c9]">
                            {formatBs(product.price)}
                          </p>

                          <p className="mt-1 text-xs text-[#6f8798]">
                            Stock:{" "}
                            {typeof product.stock === "number"
                              ? product.stock
                              : 0}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[30px] border border-[#cfeaf6] bg-white p-5 shadow-[0_12px_32px_rgba(22,50,74,0.06)] sm:rounded-[34px] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-xs font-extrabold text-[#19b7c9]">
                    Usuarios
                  </span>

                  <h2 className="mt-3 text-2xl font-extrabold text-[#16324a]">
                    Nuevos
                  </h2>
                </div>

                <Link
                  href="/admin/usuarios"
                  className="shrink-0 rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#0ea5b7]"
                >
                  Gestionar
                </Link>
              </div>

              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <div className="rounded-2xl bg-[#f7fdff] px-4 py-4 text-sm text-[#4b6b80]">
                    No hay usuarios todavía.
                  </div>
                ) : (
                  recentUsers.map((user) => (
                    <Link
                      key={user._id}
                      href="/admin/usuarios"
                      className="block rounded-[22px] bg-[#f7fdff] px-4 py-4 transition hover:text-[#19b7c9]"
                    >
                      <h3 className="font-extrabold text-[#16324a]">
                        {user.fullName || "Sin nombre"}
                      </h3>

                      <p className="mt-1 break-all text-sm text-[#4b6b80]">
                        {user.email || "Sin correo"}
                      </p>

                      <p className="mt-3 inline-flex rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#19b7c9]">
                        {user.role || "Sin rol"}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}