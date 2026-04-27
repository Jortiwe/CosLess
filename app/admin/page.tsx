import Link from "next/link";
import { connectDB } from "../../lib/mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import User from "../../models/User";
import Favorite from "../../models/Favorite";
import AdminToolbar from "../../components/admin/AdminToolbar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminQuickStat from "../../components/admin/AdminQuickStat";

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

export default async function AdminPage() {
  await connectDB();

  const [
    ordersCount,
    productsCount,
    usersCount,
    favoritesCount,
    rawRecentOrders,
    rawRecentProducts,
    rawRecentUsers,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Favorite.countDocuments(),
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
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
              Panel admin
            </span>

            <h1 className="mt-4 text-4xl font-extrabold">Gestión CosLess</h1>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#4b6b80]">
              Desde aquí podrás gestionar productos, pedidos, usuarios,
              favoritos y estadísticas.
            </p>
          </div>

          <AdminToolbar />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AdminQuickStat
            title="Pedidos"
            value={ordersCount}
            subtitle="Pedidos registrados"
            href="/admin/pedidos"
          />
          <AdminQuickStat
            title="Productos"
            value={productsCount}
            subtitle="Productos cargados"
            href="/admin/productos"
          />
          <AdminQuickStat
            title="Usuarios"
            value={usersCount}
            subtitle="Cuentas registradas"
            href="/admin/usuarios"
          />
          <AdminQuickStat
            title="Favoritos"
            value={favoritesCount}
            subtitle="Favoritos guardados"
            href="/admin/favoritos"
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AdminSectionCard
            title="Pedidos"
            description="Ver pedidos, cambiar estado, marcar pagado, enviado o entregado."
            href="/admin/pedidos"
            buttonLabel="Gestionar pedidos"
          />
          <AdminSectionCard
            title="Productos"
            description="Crear productos, editar stock, precio, imágenes y categorías."
            href="/admin/productos"
            buttonLabel="Gestionar productos"
          />
          <AdminSectionCard
            title="Usuarios"
            description="Ver clientes registrados y administradores del sistema."
            href="/admin/usuarios"
            buttonLabel="Gestionar usuarios"
          />
          <AdminSectionCard
            title="Favoritos"
            description="Revisar qué productos guarda más la gente en favoritos."
            href="/admin/favoritos"
            buttonLabel="Gestionar favoritos"
          />
          <AdminSectionCard
            title="Estadísticas"
            description="Ver productos más vistos, pedidos más frecuentes y resumen general."
            href="/admin/estadisticas"
            buttonLabel="Ver estadísticas"
          />
          <AdminSectionCard
            title="Configuración"
            description="Definir costos de envío, estados y opciones del sistema."
            href="/admin/configuracion"
            buttonLabel="Abrir configuración"
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold">Pedidos recientes</h2>
                <p className="mt-2 text-sm text-[#4b6b80]">
                  Aquí podrás revisar pedidos nuevos y su estado actual.
                </p>
              </div>

              <Link
                href="/admin/pedidos"
                className="rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
              >
                Gestionar pedidos
              </Link>
            </div>

            <div className="overflow-x-auto">
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
                        className="rounded-2xl bg-white px-4 py-6 text-sm text-[#4b6b80]"
                      >
                        No hay pedidos todavía.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="bg-white">
                        <td className="rounded-l-2xl px-3 py-4 font-bold">
                          <Link
                            href={`/admin/pedidos`}
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
          </section>

          <div className="space-y-8">
            <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold">Productos nuevos</h2>
                <Link
                  href="/admin/productos"
                  className="rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
                >
                  Gestionar productos
                </Link>
              </div>

              <div className="space-y-3">
                {recentProducts.length === 0 ? (
                  <div className="rounded-2xl bg-white px-4 py-4 text-sm text-[#4b6b80]">
                    No hay productos todavía.
                  </div>
                ) : (
                  recentProducts.map((product) => (
                    <Link
                      key={product._id}
                      href="/admin/productos"
                      className="block rounded-2xl bg-white px-4 py-4 transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold">
                            {product.title || "Sin título"}
                          </h3>
                          <p className="mt-1 text-sm text-[#4b6b80]">
                            {product.category || "Sin categoría"} ·{" "}
                            {product.status || "Sin estado"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-[#19b7c9]">
                            {formatBs(product.price)}
                          </p>
                          <p className="mt-1 text-xs text-[#6f8798]">
                            Stock: {typeof product.stock === "number" ? product.stock : 0}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold">Usuarios nuevos</h2>
                <Link
                  href="/admin/usuarios"
                  className="rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
                >
                  Gestionar usuarios
                </Link>
              </div>

              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <div className="rounded-2xl bg-white px-4 py-4 text-sm text-[#4b6b80]">
                    No hay usuarios todavía.
                  </div>
                ) : (
                  recentUsers.map((user) => (
                    <Link
                      key={user._id}
                      href="/admin/usuarios"
                      className="block rounded-2xl bg-white px-4 py-4 transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
                    >
                      <h3 className="font-bold">
                        {user.fullName || "Sin nombre"}
                      </h3>
                      <p className="mt-1 text-sm text-[#4b6b80]">
                        {user.email || "Sin correo"}
                      </p>
                      <p className="mt-2 inline-flex rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#19b7c9]">
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