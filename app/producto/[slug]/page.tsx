import { notFound } from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import AddToCartButton from "../../../components/product/AddToCartButton";
import AddToFavoritesButton from "../../../components/product/AddToFavoritesButton";
import BuyNowButton from "../../../components/product/BuyNowButton";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductItem = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  status?: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  mainImage: string;
  images?: string[];
  description?: string;
  isActive?: boolean;
  isOffer?: boolean;
  isWeeklyNew?: boolean;
  isFeatured?: boolean;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value.toFixed(2)}`;
}

function categoryLabel(value?: string) {
  const labels: Record<string, string> = {
    cosplays: "Cosplays",
    pelucas: "Pelucas",
    lentes: "Lentes",
    mallas: "Mallas",
    accesorios: "Accesorios",
    preventa: "Preventa",
  };

  if (!value) return "Sin categoría";
  return labels[value] || value;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const rawProduct = await Product.findOne({
    slug: slug.toLowerCase(),
  }).lean();

  if (!rawProduct) {
    notFound();
  }

  const product = JSON.parse(JSON.stringify(rawProduct)) as ProductItem;

  const gallery = [
    product.mainImage,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  const checkoutProduct = {
    productId: product._id,
    title: product.title,
    price: product.price,
    mainImage: product.mainImage,
    slug: product.slug,
  };

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-[#cfeaf6] bg-white p-4 shadow-[0_12px_30px_rgba(22,50,74,0.05)]">
            <div className="overflow-hidden rounded-[26px] bg-[#eaf8ff]">
              <img
                src={product.mainImage || "/placeholder-product.png"}
                alt={product.title}
                className="h-[430px] w-full object-cover sm:h-[560px]"
              />
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(0, 5).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-2xl border border-[#d7edf7] bg-[#eaf8ff]"
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-[#cfeaf6] bg-white p-6 shadow-[0_12px_30px_rgba(22,50,74,0.05)] sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-bold text-[#19b7c9]">
                {categoryLabel(product.category)}
              </span>

              {product.status === "preventa" && (
                <span className="rounded-full bg-[#fff3dc] px-4 py-2 text-sm font-bold text-[#b87d00]">
                  Preventa
                </span>
              )}

              {product.isOffer && (
                <span className="rounded-full bg-[#ffe8ec] px-4 py-2 text-sm font-bold text-[#d62839]">
                  Oferta
                </span>
              )}

              {product.isWeeklyNew && (
                <span className="rounded-full bg-[#eaf8ff] px-4 py-2 text-sm font-bold text-[#19b7c9]">
                  Nuevo
                </span>
              )}

              {product.isFeatured && (
                <span className="rounded-full bg-[#f2eaff] px-4 py-2 text-sm font-bold text-[#7c3aed]">
                  Destacado
                </span>
              )}
            </div>

            <h1 className="mt-5 text-[2.2rem] font-extrabold leading-tight text-[#16324a] sm:text-[3rem]">
              {product.title}
            </h1>

            <div className="mt-5">
              {typeof product.oldPrice === "number" && product.oldPrice > 0 && (
                <p className="text-lg font-bold text-[#8ba4b3] line-through">
                  {formatBs(product.oldPrice)}
                </p>
              )}

              <p className="text-[2rem] font-black text-[#19b7c9]">
                {formatBs(product.price)}
              </p>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#e5f3fa] bg-[#f8fdff] p-4">
              <p className="text-sm font-bold text-[#16324a]">
                Disponibilidad
              </p>

              <p className="mt-1 text-sm text-[#4b6b80]">
                {product.status === "preventa"
                  ? "Producto disponible bajo pedido o preventa."
                  : "Producto en stock."}
              </p>

              <p className="mt-2 text-sm text-[#4b6b80]">
                Stock:{" "}
                <span className="font-bold text-[#16324a]">
                  {typeof product.stock === "number" ? product.stock : 0}
                </span>
              </p>
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-lg font-extrabold text-[#16324a]">
                  Descripción
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#4b6b80]">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <AddToCartButton product={checkoutProduct} />
              <BuyNowButton product={checkoutProduct} />
            </div>

            <div className="mt-3">
              <AddToFavoritesButton
                product={{
                  productId: product._id,
                  title: product.title,
                  price: product.price,
                  mainImage: product.mainImage,
                  slug: product.slug,
                  category: product.category,
                  status:
                    product.status === "preventa" ? "preventa" : "stock",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}