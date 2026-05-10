import Link from "next/link";
import { connectDB } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import PrintReportButton from "../../../../components/admin/PrintReportButton";

export const dynamic = "force-dynamic";

type ProductItem = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  isActive?: boolean;
  isOffer?: boolean;
  isWeeklyNew?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0.00";
  return `Bs${value.toFixed(2)}`;
}

function categoryLabel(value?: string) {
  if (!value) return "Sin categoría";

  const labels: Record<string, string> = {
    cosplays: "Cosplays",
    pelucas: "Pelucas",
    lentes: "Lentes",
    mallas: "Mallas",
    accesorios: "Accesorios",
    preventa: "Preventa",
  };

  return labels[value] || value;
}

function statusLabel(value?: string) {
  if (value === "preventa") return "Preventa";
  if (value === "stock") return "Stock";
  return "Sin estado";
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function ProductsReportPage() {
  await connectDB();

  const rawProducts = await Product.find().sort({ createdAt: -1 }).lean();
  const products = JSON.parse(JSON.stringify(rawProducts)) as ProductItem[];

  const activeCount = products.filter((product) => product.isActive).length;
  const inactiveCount = products.length - activeCount;
  const offerCount = products.filter((product) => product.isOffer).length;
  const featuredCount = products.filter((product) => product.isFeatured).length;
  const weeklyCount = products.filter((product) => product.isWeeklyNew).length;
  const preventaCount = products.filter(
    (product) => product.status === "preventa"
  ).length;

  const lowStockCount = products.filter(
    (product) => Number(product.stock || 0) <= 3
  ).length;

  const totalInventoryValue = products.reduce((acc, product) => {
    const price = Number(product.price || 0);
    const stock = Number(product.stock || 0);

    return acc + price * stock;
  }, 0);

  const today = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-[1200px] print:max-w-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin/productos"
            className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            ← Volver a productos
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
                  Reporte de productos
                </h1>

                <p className="mt-2 text-sm font-semibold text-[#4b6b80]">
                  Inventario general, precios, stock, estado y secciones de
                  tienda.
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
              <p className="text-xs font-bold text-[#4b6b80]">Productos</p>
              <p className="mt-1 text-2xl font-black text-[#19b7c9]">
                {products.length}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#e6f6ed] px-4 py-4">
              <p className="text-xs font-bold text-[#326b4d]">Activos</p>
              <p className="mt-1 text-2xl font-black text-[#16824c]">
                {activeCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#fff3dc] px-4 py-4">
              <p className="text-xs font-bold text-[#7d5c12]">Preventa</p>
              <p className="mt-1 text-2xl font-black text-[#b87d00]">
                {preventaCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#ffe8ec] px-4 py-4">
              <p className="text-xs font-bold text-[#9d3040]">Stock bajo</p>
              <p className="mt-1 text-2xl font-black text-[#d62839]">
                {lowStockCount}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
            <div className="rounded-[22px] bg-[#f8fdff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Inactivos</p>
              <p className="mt-1 text-2xl font-black text-[#6f8798]">
                {inactiveCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#fff3dc] px-4 py-4">
              <p className="text-xs font-bold text-[#7d5c12]">Ofertas</p>
              <p className="mt-1 text-2xl font-black text-[#b87d00]">
                {offerCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#eaf8ff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">
                Nuevos semanales
              </p>
              <p className="mt-1 text-2xl font-black text-[#19b7c9]">
                {weeklyCount}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#f2eaff] px-4 py-4">
              <p className="text-xs font-bold text-[#5d36a5]">Destacados</p>
              <p className="mt-1 text-2xl font-black text-[#7c3aed]">
                {featuredCount}
              </p>
            </div>
          </section>

          <section className="px-8 pb-6">
            <div className="rounded-[24px] border border-[#d9eef7] bg-[#f9fdff] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#4b6b80]">
                  Valor estimado del inventario
                </p>

                <p className="text-2xl font-black text-[#19b7c9]">
                  {formatBs(totalInventoryValue)}
                </p>
              </div>
            </div>
          </section>

          <section className="px-8 pb-8">
            <div className="overflow-hidden rounded-[24px] border border-[#d9eef7]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#eaf8ff] text-[#16324a]">
                  <tr>
                    <th className="px-4 py-3 font-black">Producto</th>
                    <th className="px-4 py-3 font-black">Categoría</th>
                    <th className="px-4 py-3 font-black">Estado</th>
                    <th className="px-4 py-3 font-black">Precio</th>
                    <th className="px-4 py-3 font-black">Precio ant.</th>
                    <th className="px-4 py-3 font-black">Stock</th>
                    <th className="px-4 py-3 font-black">Activo</th>
                    <th className="px-4 py-3 font-black">Secciones</th>
                    <th className="px-4 py-3 font-black">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-6 text-center font-bold text-[#4b6b80]"
                      >
                        No hay productos registrados.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const sections = [
                        product.isOffer ? "Oferta" : null,
                        product.isWeeklyNew ? "Nuevo" : null,
                        product.isFeatured ? "Destacado" : null,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <tr
                          key={product._id}
                          className="border-t border-[#e5f3fa]"
                        >
                          <td className="px-4 py-3 font-bold text-[#16324a]">
                            {product.title || "Sin título"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {categoryLabel(product.category)}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {statusLabel(product.status)}
                          </td>

                          <td className="px-4 py-3 font-bold text-[#19b7c9]">
                            {formatBs(product.price)}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {Number(product.oldPrice || 0) > 0
                              ? formatBs(product.oldPrice)
                              : "-"}
                          </td>

                          <td className="px-4 py-3 font-bold text-[#16324a]">
                            {typeof product.stock === "number"
                              ? product.stock
                              : 0}
                          </td>

                          <td className="px-4 py-3">
                            {product.isActive ? "Sí" : "No"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {sections || "-"}
                          </td>

                          <td className="px-4 py-3 text-[#4b6b80]">
                            {formatDate(product.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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