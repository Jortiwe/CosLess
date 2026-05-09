import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import AddToCartButton from "../../../components/product/AddToCartButton";
import AddToFavoritesButton from "../../../components/product/AddToFavoritesButton";
import BuyNowButton from "../../../components/product/BuyNowButton";
import ProductBackButton from "../../../components/product/ProductBackButton";
import ProductImageGallery from "../../../components/product/ProductImageGallery";
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
  active?: boolean;
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

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";

  const value = src.trim();

  if (!value) return "/placeholder-product.png";

  return value;
}

function RelatedProductCard({ product }: { product: ProductItem }) {
  const href = product.slug ? `/producto/${product.slug}` : "#";
  const image = getSafeImage(product.mainImage || product.images?.[0]);
  const status = product.status || "stock";

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[24px] border border-[#cfeaf6] bg-white shadow-[0_8px_24px_rgba(22,50,74,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(22,50,74,0.10)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#eaf8ff]">
        <img
          src={image}
          alt={product.title || "Producto"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#16324a] shadow-sm sm:text-[10px]">
            {categoryLabel(product.category)}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] shadow-sm sm:text-[10px] ${
              status === "preventa"
                ? "bg-[#fff3dc] text-[#b87d00]"
                : "bg-[#e6f6ed] text-[#16824c]"
            }`}
          >
            {status === "preventa" ? "Preventa" : "Stock"}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[42px] text-[0.9rem] font-extrabold leading-5 text-[#16324a] sm:min-h-[48px] sm:text-[1.02rem] sm:leading-6">
          {product.title || "Producto sin título"}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[0.98rem] font-extrabold text-[#19b7c9] sm:text-[1.08rem]">
            {formatBs(product.price)}
          </p>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf8ff] text-sm font-extrabold text-[#19b7c9] transition group-hover:bg-[#19b7c9] group-hover:text-white sm:h-9 sm:w-9">
            →
          </span>
        </div>
      </div>
    </Link>
  );
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

  const mainImage = getSafeImage(product.mainImage);

  const gallery = [
    mainImage,
    ...(Array.isArray(product.images) ? product.images : []),
  ]
    .map((image) => getSafeImage(image))
    .filter(Boolean)
    .slice(0, 5);

  const rawRelatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    $or: [
      { isActive: true },
      { active: true },
      { isActive: { $exists: false } },
    ],
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(4)
    .lean();

  const relatedProducts = JSON.parse(
    JSON.stringify(rawRelatedProducts)
  ) as ProductItem[];

  const checkoutProduct: {
    productId: string;
    title: string;
    price: number;
    mainImage: string;
    slug?: string;
    stock?: number;
    status?: "stock" | "preventa";
  } = {
    productId: product._id,
    title: product.title,
    price: product.price,
    mainImage,
    slug: product.slug,
    stock: typeof product.stock === "number" ? product.stock : 0,
    status: product.status === "preventa" ? "preventa" : "stock",
  };

  const isPreventa = product.status === "preventa";
  const stock = typeof product.stock === "number" ? product.stock : 0;
  const fallbackBackHref = product.category
    ? `/categoria/${product.category}`
    : "/productos";

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mb-4 flex justify-start">
          <ProductBackButton fallbackHref={fallbackBackHref} />
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[#cfeaf6] bg-white shadow-[0_12px_32px_rgba(22,50,74,0.06)] sm:rounded-[34px] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
          <ProductImageGallery title={product.title} images={gallery} />

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#dff4ff] px-4 py-2 text-xs font-extrabold text-[#19b7c9] sm:text-sm">
                {categoryLabel(product.category)}
              </span>

              {isPreventa && (
                <span className="rounded-full bg-[#fff3dc] px-4 py-2 text-xs font-extrabold text-[#b87d00] sm:text-sm">
                  Preventa
                </span>
              )}

              {product.isOffer && (
                <span className="rounded-full bg-[#ffe8ec] px-4 py-2 text-xs font-extrabold text-[#d62839] sm:text-sm">
                  Oferta
                </span>
              )}

              {product.isWeeklyNew && (
                <span className="rounded-full bg-[#eaf8ff] px-4 py-2 text-xs font-extrabold text-[#19b7c9] sm:text-sm">
                  Nuevo
                </span>
              )}

              {product.isFeatured && (
                <span className="rounded-full bg-[#f2eaff] px-4 py-2 text-xs font-extrabold text-[#7c3aed] sm:text-sm">
                  Destacado
                </span>
              )}
            </div>

            <h1 className="mt-5 text-[2.05rem] font-extrabold leading-tight text-[#16324a] sm:text-[3rem] lg:max-w-[760px]">
              {product.title}
            </h1>

            <div className="mt-4">
              {typeof product.oldPrice === "number" && product.oldPrice > 0 && (
                <p className="text-base font-bold text-[#8ba4b3] line-through sm:text-lg">
                  {formatBs(product.oldPrice)}
                </p>
              )}

              <p className="text-[2rem] font-black leading-tight text-[#19b7c9] sm:text-[2.35rem]">
                {formatBs(product.price)}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#4b6b80]">
              <span className="font-extrabold text-[#16324a]">
                {isPreventa
                  ? "Preventa"
                  : stock > 0
                  ? "Disponible"
                  : "Sin stock"}
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-[#19b7c9]" />

              <span>
                Stock:{" "}
                <span
                  className={`font-extrabold ${
                    !isPreventa && stock <= 0
                      ? "text-red-500"
                      : "text-[#16324a]"
                  }`}
                >
                  {stock}
                </span>
              </span>
            </div>

            <div className="mt-7 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 overflow-hidden rounded-[22px] [&_a]:!box-border [&_a]:!flex [&_a]:!h-[56px] [&_a]:!w-full [&_a]:!min-w-0 [&_a]:!max-w-full [&_a]:!items-center [&_a]:!justify-center [&_a]:!overflow-hidden [&_a]:!rounded-[22px] [&_a]:!px-2 [&_a]:!text-center [&_a]:!text-[0.82rem] [&_a]:!leading-none [&_button]:!box-border [&_button]:!flex [&_button]:!h-[56px] [&_button]:!w-full [&_button]:!min-w-0 [&_button]:!max-w-full [&_button]:!items-center [&_button]:!justify-center [&_button]:!overflow-hidden [&_button]:!rounded-[22px] [&_button]:!px-2 [&_button]:!text-center [&_button]:!text-[0.82rem] [&_button]:!leading-none sm:[&_a]:!h-[60px] sm:[&_a]:!px-4 sm:[&_a]:!text-base sm:[&_button]:!h-[60px] sm:[&_button]:!px-4 sm:[&_button]:!text-base">
                  <AddToCartButton product={checkoutProduct} />
                </div>

                <div className="min-w-0 overflow-hidden rounded-[22px] [&_a]:!box-border [&_a]:!flex [&_a]:!h-[56px] [&_a]:!w-full [&_a]:!min-w-0 [&_a]:!max-w-full [&_a]:!items-center [&_a]:!justify-center [&_a]:!overflow-hidden [&_a]:!rounded-[22px] [&_a]:!px-2 [&_a]:!text-center [&_a]:!text-[0.82rem] [&_a]:!leading-none [&_button]:!box-border [&_button]:!flex [&_button]:!h-[56px] [&_button]:!w-full [&_button]:!min-w-0 [&_button]:!max-w-full [&_button]:!items-center [&_button]:!justify-center [&_button]:!overflow-hidden [&_button]:!rounded-[22px] [&_button]:!px-2 [&_button]:!text-center [&_button]:!text-[0.82rem] [&_button]:!leading-none sm:[&_a]:!h-[60px] sm:[&_a]:!px-4 sm:[&_a]:!text-base sm:[&_button]:!h-[60px] sm:[&_button]:!px-4 sm:[&_button]:!text-base">
                  <AddToFavoritesButton
                    product={{
                      productId: product._id,
                      title: product.title,
                      price: product.price,
                      mainImage,
                      slug: product.slug,
                      category: product.category,
                      status: isPreventa ? "preventa" : "stock",
                    }}
                  />
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-[24px] [&_a]:!box-border [&_a]:!flex [&_a]:!h-[60px] [&_a]:!w-full [&_a]:!min-w-0 [&_a]:!max-w-full [&_a]:!items-center [&_a]:!justify-center [&_a]:!overflow-hidden [&_a]:!rounded-[24px] [&_a]:!px-3 [&_a]:!text-center [&_a]:!text-[0.92rem] [&_a]:!leading-none [&_button]:!box-border [&_button]:!flex [&_button]:!h-[60px] [&_button]:!w-full [&_button]:!min-w-0 [&_button]:!max-w-full [&_button]:!items-center [&_button]:!justify-center [&_button]:!overflow-hidden [&_button]:!rounded-[24px] [&_button]:!px-3 [&_button]:!text-center [&_button]:!text-[0.92rem] [&_button]:!leading-none sm:[&_a]:!h-[62px] sm:[&_a]:!px-4 sm:[&_a]:!text-base sm:[&_button]:!h-[62px] sm:[&_button]:!px-4 sm:[&_button]:!text-base">
                <BuyNowButton product={checkoutProduct} />
              </div>
            </div>

            {product.description && (
              <div className="mt-7 border-t border-[#e5f3fa] pt-5">
                <h2 className="text-lg font-extrabold text-[#16324a]">
                  Descripción
                </h2>

                <div className="mt-2 max-h-[150px] overflow-y-auto overscroll-contain whitespace-pre-line text-sm leading-7 text-[#4b6b80] [-ms-overflow-style:none] [scrollbar-width:none] sm:max-h-[190px] [&::-webkit-scrollbar]:hidden">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#19b7c9] shadow-[0_8px_20px_rgba(22,50,74,0.04)]">
                  También te puede gustar
                </span>

                <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.2rem]">
                  Productos relacionados
                </h2>
              </div>

              {product.category && (
                <Link
                  href={`/categoria/${product.category}`}
                  className="hidden shrink-0 rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:inline-flex"
                >
                  Ver más
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <RelatedProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </section>

      <Footer />
    </main>
  );
}