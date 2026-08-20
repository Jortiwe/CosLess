import { Types } from "mongoose";
import Link from "next/link";
import { connectDB } from "../../lib/mongodb";
import Order from "../../models/Order";
import Product from "../../models/Product";
import User from "../../models/User";
import Favorite from "../../models/Favorite";
import AccountStore from "../../models/AccountStore";
import News from "../../models/News";
import AdminToolbar from "../../components/admin/AdminToolbar";

export const dynamic = "force-dynamic";

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

type RawFavorite = {
  _id?: string;
  userId?: string | { _id?: string } | null;
  productId?: string | { _id?: string } | null;
};

type RawAccountStoreFavorite = {
  productId?: unknown;
};

type RawAccountStore = {
  _id?: string;
  userId?: string;
  email?: string;
  favorites?: RawAccountStoreFavorite[];
};

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  href?: string;
  disabled?: boolean;
};

function getId(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return Types.ObjectId.isValid(value) ? value : null;
  }

  if (typeof value === "object") {
    const objectValue = value as {
      _id?: unknown;
      productId?: unknown;
      id?: unknown;
    };

    if (typeof objectValue._id === "string") {
      return Types.ObjectId.isValid(objectValue._id) ? objectValue._id : null;
    }

    if (typeof objectValue.productId === "string") {
      return Types.ObjectId.isValid(objectValue.productId)
        ? objectValue.productId
        : null;
    }

    if (
      typeof objectValue.productId === "object" &&
      objectValue.productId !== null
    ) {
      const nestedProduct = objectValue.productId as { _id?: unknown };

      if (typeof nestedProduct._id === "string") {
        return Types.ObjectId.isValid(nestedProduct._id)
          ? nestedProduct._id
          : null;
      }
    }

    if (typeof objectValue.id === "string") {
      return Types.ObjectId.isValid(objectValue.id) ? objectValue.id : null;
    }
  }

  return null;
}

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

function StatCard({ title, value, subtitle, href, disabled }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 break-words text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)] transition group-hover:text-[var(--primary)] sm:text-[0.7rem] sm:tracking-[0.18em] lg:text-xs">
          {title}
        </p>

        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition sm:h-8 sm:w-8 sm:text-sm ${
            disabled
              ? "bg-[var(--surface-soft)] text-[var(--text-muted)]"
              : "bg-[var(--surface-soft)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
          }`}
        >
          →
        </span>
      </div>

      <p className="mt-4 text-[1.8rem] font-black leading-none text-[var(--text)] sm:mt-5 sm:text-[2.5rem] lg:text-[2.8rem]">
        {value}
      </p>

      <p className="mt-2 text-[0.72rem] font-semibold leading-4 text-[var(--text-soft)] sm:mt-3 sm:text-sm sm:leading-6">
        {subtitle}
      </p>
    </>
  );

  const className = `group block w-full min-w-0 overflow-hidden rounded-[22px] border border-[var(--border)] bg-white p-3 shadow-[0_8px_22px_var(--shadow)] transition sm:rounded-[26px] sm:p-5 lg:rounded-[28px] ${
    disabled
      ? "cursor-default opacity-90"
      : "hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_16px_34px_var(--shadow-strong)]"
  }`;

  if (!href || disabled) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default async function AdminPage() {
  await connectDB();

  const [
    ordersCount,
    productsCount,
    usersCount,
    newsCount,
    rawRecentOrders,
    rawRecentProducts,
    rawRecentUsers,
    rawPaidOrders,
    rawFavorites,
    rawStores,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    News.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Product.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    Order.find({
      status: { $in: ["paid", "preparing", "shipped", "delivered"] },
      inventoryDeducted: true,
    })
      .select("items")
      .lean(),
    Favorite.find().lean(),
    AccountStore.find().lean(),
  ]);

  const soldUnitsCount = rawPaidOrders.reduce(
    (total, order) =>
      total +
      (Array.isArray(order.items)
        ? order.items.reduce(
            (itemTotal: number, item: { quantity?: number }) =>
              itemTotal + Number(item.quantity || 0),
            0
          )
        : 0),
    0
  );

  const recentOrders = JSON.parse(
    JSON.stringify(rawRecentOrders)
  ) as AdminOrderItem[];

  const recentProducts = JSON.parse(
    JSON.stringify(rawRecentProducts)
  ) as AdminProductItem[];

  const recentUsers = JSON.parse(
    JSON.stringify(rawRecentUsers)
  ) as AdminUserItem[];

  const favorites = JSON.parse(JSON.stringify(rawFavorites)) as RawFavorite[];
  const stores = JSON.parse(JSON.stringify(rawStores)) as RawAccountStore[];

  const favoriteProductIds = new Set<string>();

  for (const favorite of favorites) {
    const productId = getId(favorite.productId);

    if (productId) {
      favoriteProductIds.add(productId);
    }
  }

  for (const store of stores) {
    if (!Array.isArray(store.favorites)) continue;

    for (const favorite of store.favorites) {
      const productId = getId(favorite.productId);

      if (productId) {
        favoriteProductIds.add(productId);
      }
    }
  }

  const favoriteProductIdList = Array.from(favoriteProductIds).filter(
    (productId) => Types.ObjectId.isValid(productId)
  );

  const existingFavoriteProducts =
    favoriteProductIdList.length > 0
      ? await Product.find({
          _id: { $in: favoriteProductIdList },
        })
          .select("_id")
          .lean()
      : [];

  const favoriteProductsCount = existingFavoriteProducts.length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1700px]">
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] shadow-[0_8px_20px_var(--shadow)] sm:px-5 sm:text-xs">
              Panel admin
            </span>

            <div className="shrink-0 [&_a]:!h-11 [&_a]:!px-4 [&_a]:!text-xs [&_a]:!font-extrabold [&_a]:!whitespace-nowrap [&_button]:!h-11 [&_button]:!px-4 [&_button]:!text-xs [&_button]:!font-extrabold [&_button]:!whitespace-nowrap sm:[&_a]:!h-12 sm:[&_a]:!px-5 sm:[&_a]:!text-sm sm:[&_button]:!h-12 sm:[&_button]:!px-5 sm:[&_button]:!text-sm">
              <AdminToolbar />
            </div>
          </div>

          <h1 className="mt-3 whitespace-nowrap text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--text)] sm:text-[3.2rem]">
            Gestión CosLess
          </h1>

          <p className="mt-2 hidden max-w-3xl text-sm font-semibold leading-7 text-[var(--text-soft)] sm:block">
            Resumen general de pedidos, productos, usuarios y novedades.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
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
            value={favoriteProductsCount}
            subtitle="Productos"
            href="/admin/favoritos"
          />

          <StatCard
            title="Novedades"
            value={newsCount}
            subtitle="Publicadas"
            href="/admin/novedades"
          />

          <StatCard
            title="Pagos"
            value={soldUnitsCount}
            subtitle="Unidades vendidas"
            href="/admin/pagos"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_12px_32px_var(--shadow)] sm:rounded-[34px] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                  Pedidos
                </span>

                <h2 className="mt-3 text-2xl font-extrabold text-[var(--text)]">
                  Recientes
                </h2>
              </div>

              <Link
                href="/admin/pedidos"
                className="shrink-0 rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)]"
              >
                Gestionar
              </Link>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-[var(--text-muted)]">
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.slice(0, 5).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="rounded-2xl bg-[var(--surface)] px-4 py-6 text-sm text-[var(--text-soft)]"
                      >
                        No hay pedidos todavía.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="bg-[var(--surface)]">
                        <td className="rounded-l-2xl px-3 py-4 font-bold">
                          <Link
                            href="/admin/pedidos"
                            className="hover:text-[var(--primary)]"
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

                        <td className="rounded-r-2xl px-3 py-4 text-sm text-[var(--text-soft)]">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {recentOrders.slice(0, 5).length === 0 ? (
                <div className="rounded-2xl bg-[var(--surface)] px-4 py-6 text-sm text-[var(--text-soft)]">
                  No hay pedidos todavía.
                </div>
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order._id}
                    href="/admin/pedidos"
                    className="block rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 transition hover:border-[var(--primary)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-[var(--text)]">
                          {order.orderCode || "Sin código"}
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-soft)]">
                          {order.customerName || "Sin cliente"}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-extrabold text-[var(--primary)]">
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

                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_12px_32px_var(--shadow)] sm:rounded-[34px] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                    Productos
                  </span>

                  <h2 className="mt-3 text-2xl font-extrabold text-[var(--text)]">
                    Nuevos
                  </h2>
                </div>

                <Link
                  href="/admin/productos"
                  className="shrink-0 rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)]"
                >
                  Gestionar
                </Link>
              </div>

              <div className="space-y-3">
                {recentProducts.slice(0, 5).length === 0 ? (
                  <div className="rounded-2xl bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text-soft)]">
                    No hay productos todavía.
                  </div>
                ) : (
                  recentProducts.slice(0, 5).map((product) => (
                    <Link
                      key={product._id}
                      href="/admin/productos"
                      className="group block rounded-[22px] border border-transparent bg-[var(--surface)] px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-white hover:shadow-[0_12px_26px_var(--shadow-strong)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 font-extrabold text-[var(--text)] transition group-hover:text-[var(--primary)]">
                            {product.title || "Sin título"}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--text-soft)]">
                            {product.category || "Sin categoría"} ·{" "}
                            {product.status || "Sin estado"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-extrabold text-[var(--primary)]">
                            {formatBs(product.price)}
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
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

            <section className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_12px_32px_var(--shadow)] sm:rounded-[34px] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                    Usuarios
                  </span>

                  <h2 className="mt-3 text-2xl font-extrabold text-[var(--text)]">
                    Nuevos
                  </h2>
                </div>

                <Link
                  href="/admin/usuarios"
                  className="shrink-0 rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)]"
                >
                  Gestionar
                </Link>
              </div>

              <div className="space-y-3">
                {recentUsers.slice(0, 5).length === 0 ? (
                  <div className="rounded-2xl bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text-soft)]">
                    No hay usuarios todavía.
                  </div>
                ) : (
                  recentUsers.slice(0, 5).map((user) => (
                    <Link
                      key={user._id}
                      href="/admin/usuarios"
                      className="group block rounded-[22px] border border-transparent bg-[var(--surface)] px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-white hover:shadow-[0_12px_26px_var(--shadow-strong)]"
                    >
                      <h3 className="font-extrabold text-[var(--text)] transition group-hover:text-[var(--primary)]">
                        {user.fullName || "Sin nombre"}
                      </h3>

                      <p className="mt-1 break-all text-sm text-[var(--text-soft)]">
                        {user.email || "Sin correo"}
                      </p>

                      <p className="mt-3 inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
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
