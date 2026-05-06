import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import AdminBackButton from "../../../components/admin/AdminBackButton";

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
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
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

export default async function AdminProductsPage() {
  await connectDB();

  const rawProducts = await Product.find().sort({ createdAt: -1 }).lean();
  const products = JSON.parse(JSON.stringify(rawProducts)) as ProductItem[];

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestión de productos</h1>
            <p className="mt-2 text-[#4b6b80]">
              Crea, edita y organiza productos por categoría y secciones.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AdminBackButton />

            <Link
              href="/admin/productos/nuevo"
              className="rounded-2xl bg-[#19b7c9] px-5 py-3 text-sm font-bold text-white"
            >
              Crear producto
            </Link>
          </div>
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="rounded-2xl bg-white px-4 py-6 text-sm text-[#4b6b80]">
                No hay productos todavía.
              </div>
            ) : (
              products.map((product) => (
                <article
                  key={product._id}
                  className="rounded-[24px] bg-white p-5 shadow-[0_8px_22px_rgba(22,50,74,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-extrabold">
                        {product.title || "Sin título"}
                      </h2>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        {categoryLabel(product.category)} ·{" "}
                        {product.status === "preventa"
                          ? "Preventa"
                          : product.status === "stock"
                          ? "Stock"
                          : "Sin estado"}
                      </p>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        Slug: {product.slug || "Sin slug"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            product.isActive
                              ? "bg-[#e6f6ed] text-[#16824c]"
                              : "bg-[#fff0f2] text-[#d62839]"
                          }`}
                        >
                          {product.isActive ? "Activo" : "Inactivo"}
                        </span>

                        {product.isOffer && (
                          <span className="rounded-full bg-[#fff3dc] px-3 py-1 text-xs font-bold text-[#b87d00]">
                            Oferta
                          </span>
                        )}

                        {product.isWeeklyNew && (
                          <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-bold text-[#19b7c9]">
                            Nuevo semanal
                          </span>
                        )}

                        {product.isFeatured && (
                          <span className="rounded-full bg-[#f2eaff] px-3 py-1 text-xs font-bold text-[#7c3aed]">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {typeof product.oldPrice === "number" &&
                        product.oldPrice > 0 && (
                          <p className="text-sm font-bold text-[#8ba4b3] line-through">
                            {formatBs(product.oldPrice)}
                          </p>
                        )}

                      <p className="text-2xl font-extrabold text-[#19b7c9]">
                        {formatBs(product.price)}
                      </p>

                      <p className="mt-1 text-sm text-[#4b6b80]">
                        Stock:{" "}
                        {typeof product.stock === "number" ? product.stock : 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/productos/${product._id}`}
                      className="rounded-xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white"
                    >
                      Editar
                    </Link>

                    <Link
                      href={`/producto/${product.slug}`}
                      className="rounded-xl border border-[#cfeaf6] bg-white px-4 py-2 text-sm font-bold text-[#16324a]"
                    >
                      Ver en tienda
                    </Link>
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