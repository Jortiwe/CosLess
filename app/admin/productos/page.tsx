import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import AdminBackButton from "../../../components/admin/AdminBackButton";

type ProductItem = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
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
              Aquí podrás crear, editar y administrar productos.
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
                  className="rounded-[24px] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold">
                        {product.title || "Sin título"}
                      </h2>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        {product.category || "Sin categoría"} ·{" "}
                        {product.status || "Sin estado"}
                      </p>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        Slug: {product.slug || "Sin slug"}
                      </p>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        {product.isActive ? "Activo" : "Inactivo"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-[#19b7c9]">
                        {formatBs(product.price)}
                      </p>

                      <p className="mt-1 text-sm text-[#4b6b80]">
                        Stock: {typeof product.stock === "number" ? product.stock : 0}
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
                      href={`/admin/productos/${product._id}`}
                      className="rounded-xl border border-[#cfeaf6] bg-white px-4 py-2 text-sm font-bold text-[#16324a]"
                    >
                      Ver detalle
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