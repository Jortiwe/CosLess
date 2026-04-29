import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import AddToCartButton from "../../../components/product/AddToCartButton";
import AddToFavoritesButton from "../../../components/product/AddToFavoritesButton";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductDetail = {
  _id: string;
  slug?: string;
  title?: string;
  category?: string;
  status?: string;
  description?: string;
  price?: number;
  stock?: number;
  mainImage?: string;
  images?: string[];
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const rawProduct = await Product.findOne({ slug, isActive: true }).lean();

  if (!rawProduct) {
    notFound();
  }

  const product: ProductDetail = JSON.parse(JSON.stringify(rawProduct));

  const rawRelatedProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { status: product.status }],
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const relatedProducts: ProductDetail[] = JSON.parse(
    JSON.stringify(rawRelatedProducts)
  );

  const galleryImages: string[] = [
    product.mainImage || "",
    ...((product.images || []).filter((image: string) => Boolean(image))),
  ].filter((image: string) => image.length > 0);

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/buscar?q="
            className="inline-flex items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            ← Volver a productos
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-6">
            <div className="overflow-hidden rounded-[26px] border border-[#d9eef7] bg-white">
              <Image
                src={product.mainImage || "/placeholder-product.png"}
                alt={product.title || "Producto"}
                width={1200}
                height={1400}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {galleryImages.map((image: string, index: number) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-[18px] border border-[#d9eef7] bg-white"
                  >
                    <Image
                      src={image}
                      alt={`${product.title || "Producto"} ${index + 1}`}
                      width={300}
                      height={300}
                      className="h-[100px] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#eaf8ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#19b7c9]">
                {product.category || "Sin categoría"}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  product.status === "stock"
                    ? "bg-[#dff7ea] text-[#16784a]"
                    : "bg-[#fff3d9] text-[#9a6a00]"
                }`}
              >
                {product.status === "stock" ? "En stock" : "Preventa"}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
              {product.title || "Sin título"}
            </h1>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <p className="text-4xl font-extrabold text-[#19b7c9]">
                {formatBs(product.price)}
              </p>

              <p className="pb-1 text-sm text-[#4b6b80]">
                Stock disponible:{" "}
                <span className="font-bold text-[#16324a]">
                  {typeof product.stock === "number" ? product.stock : 0}
                </span>
              </p>
            </div>

            <div className="mt-6 rounded-[24px] bg-white p-5">
              <h2 className="text-lg font-extrabold">Descripción</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#4b6b80]">
                {product.description || "Sin descripción disponible."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCartButton
                product={{
                  productId: String(product._id),
                  title: product.title || "Producto",
                  price: typeof product.price === "number" ? product.price : 0,
                  mainImage:
                    product.mainImage || "/placeholder-product.png",
                  slug: product.slug || "",
                }}
              />

              <AddToFavoritesButton
                product={{
                  productId: String(product._id),
                  title: product.title || "Producto",
                  price: typeof product.price === "number" ? product.price : 0,
                  mainImage:
                    product.mainImage || "/placeholder-product.png",
                  slug: product.slug || "",
                  category: product.category || "Sin categoría",
                  status:
                    product.status === "preventa" ? "preventa" : "stock",
                }}
              />
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold">Productos relacionados</h2>
              <p className="mt-2 text-[#4b6b80]">
                Más opciones que podrían interesarte.
              </p>
            </div>

            <Link
              href="/buscar?q="
              className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
            >
              Ver más productos
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.length === 0 ? (
              <div className="rounded-[24px] bg-white p-5 text-[#4b6b80]">
                No hay productos relacionados todavía.
              </div>
            ) : (
              relatedProducts.map((item: ProductDetail) => (
                <Link
                  key={String(item._id)}
                  href={`/producto/${item.slug || ""}`}
                  className="rounded-[24px] bg-white p-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(22,50,74,0.10)]"
                >
                  <div className="overflow-hidden rounded-[18px] bg-[#eef9ff]">
                    <Image
                      src={item.mainImage || "/placeholder-product.png"}
                      alt={item.title || "Producto"}
                      width={500}
                      height={600}
                      className="h-[260px] w-full object-cover"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                      {item.category || "Sin categoría"}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-7">
                      {item.title || "Sin título"}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xl font-extrabold text-[#19b7c9]">
                        {formatBs(item.price)}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.status === "stock"
                            ? "bg-[#dff7ea] text-[#16784a]"
                            : "bg-[#fff3d9] text-[#9a6a00]"
                        }`}
                      >
                        {item.status === "stock" ? "Stock" : "Preventa"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}