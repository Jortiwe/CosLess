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
  categories?: string[];
  isRentable?: boolean;
  rentalPrice?: number;
  rentalDays?: number;
  rentalAvailable?: boolean;
  pairedProducts?: string[];
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

function getRentalInfo(product: ProductItem) {
  const categories = (product.categories || []).map((item) => item.toLowerCase());
  const category = (product.category || "").toLowerCase();
  const rentable = product.isRentable === true || category === "renta" || category === "alquiler" || categories.includes("renta") || categories.includes("alquiler");
  return {
    rentable: rentable && product.rentalAvailable !== false,
    price: typeof product.rentalPrice === "number" ? product.rentalPrice : 0,
    days: typeof product.rentalDays === "number" && product.rentalDays > 0 ? product.rentalDays : 1,
  };
}

function RelatedProductCard({ product }: { product: ProductItem }) {
  const href = product.slug ? `/producto/${product.slug}` : "#";
  const image = getSafeImage(product.mainImage || product.images?.[0]);
  const status = product.status || "stock";
  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isOutOfStock = status !== "preventa" && stock <= 0;
  const rental = getRentalInfo(product);

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_24px_var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_var(--shadow-strong)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--surface-soft)]">
        <img
          src={image}
          alt={product.title || "Producto"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[var(--text)] shadow-sm sm:text-[10px]">
            {categoryLabel(product.category)}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] shadow-sm sm:text-[10px] ${
              isOutOfStock
                ? "bg-[var(--danger-bg)] text-[var(--danger)]"
                : status === "preventa"
                ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                : "bg-[var(--success-bg)] text-[var(--success)]"
            }`}
          >
            {isOutOfStock
              ? "Sin stock"
              : status === "preventa"
              ? "Preventa"
              : "Stock"}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[42px] text-[0.9rem] font-extrabold leading-5 text-[var(--text)] sm:min-h-[48px] sm:text-[1.02rem] sm:leading-6">
          {product.title || "Producto sin título"}
        </h3>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.98rem] font-extrabold text-[var(--primary)] sm:text-[1.08rem]">
            {formatBs(product.price)}
          </p>

          {rental.rentable && rental.price > 0 && (
            <span className="text-[0.68rem] font-bold text-[#5661c9]">
              Alquiler {formatBs(rental.price)}
            </span>
          )}

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white sm:h-9 sm:w-9">
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

  const pairedIds = Array.isArray(product.pairedProducts)
    ? product.pairedProducts.filter((id) => String(id) !== String(product._id))
    : [];

  const [rawPairedProducts, rawRelatedProducts] = await Promise.all([
    pairedIds.length > 0
      ? Product.find({
          _id: { $in: pairedIds },
          $or: [{ isActive: true }, { active: true }, { isActive: { $exists: false } }],
        }).limit(4).lean()
      : [],
    Product.find({
      _id: { $ne: product._id, $nin: pairedIds },
      category: product.category,
      $or: [{ isActive: true }, { active: true }, { isActive: { $exists: false } }],
    }).sort({ updatedAt: -1, createdAt: -1 }).limit(4).lean(),
  ]);

  const relatedProducts = JSON.parse(
    JSON.stringify([...rawPairedProducts, ...rawRelatedProducts])
  ).slice(0, 4) as ProductItem[];

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
  const rental = getRentalInfo(product);
  const fallbackBackHref = product.category
    ? `/categoria/${product.category}`
    : "/productos";

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mb-4 flex justify-start">
          <ProductBackButton fallbackHref={fallbackBackHref} />
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_var(--shadow)] sm:rounded-[34px] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
          <ProductImageGallery title={product.title} images={gallery} />

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)] sm:text-sm">
                {categoryLabel(product.category)}
              </span>

              {isPreventa && (
                <span className="rounded-full bg-[var(--warning-bg)] px-4 py-2 text-xs font-extrabold text-[var(--warning)] sm:text-sm">
                  Preventa
                </span>
              )}

              {product.isOffer && (
                <span className="rounded-full bg-[var(--danger-bg)] px-4 py-2 text-xs font-extrabold text-[var(--danger)] sm:text-sm">
                  Oferta
                </span>
              )}

              {product.isWeeklyNew && (
                <span className="rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)] sm:text-sm">
                  Nuevo
                </span>
              )}

              {product.isFeatured && (
                <span className="rounded-full bg-[var(--featured-bg)] px-4 py-2 text-xs font-extrabold text-[var(--featured)] sm:text-sm">
                  Destacado
                </span>
              )}

              {rental.rentable && rental.price > 0 && (
                <span className="rounded-full bg-[#eef0ff] px-4 py-2 text-xs font-extrabold text-[#5661c9] sm:text-sm">
                  Alquiler
                </span>
              )}
            </div>

            <h1 className="mt-5 text-[2.05rem] font-extrabold leading-tight text-[var(--text)] sm:text-[3rem] lg:max-w-[760px]">
              {product.title}
            </h1>

            <div className="mt-4">
              {typeof product.oldPrice === "number" && product.oldPrice > 0 && (
                <p className="text-base font-bold text-[var(--text-muted)] line-through sm:text-lg">
                  {formatBs(product.oldPrice)}
                </p>
              )}

              <p className="text-[2rem] font-black leading-tight text-[var(--primary)] sm:text-[2.35rem]">
                {formatBs(product.price)}
              </p>

              {rental.rentable && rental.price > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#eef0ff] px-4 py-3 text-sm font-bold text-[#5661c9] sm:text-base">
                  <span>Alquiler:</span>
                  <span>{formatBs(rental.price)}</span>
                  <span className="text-xs font-semibold opacity-80">
                    / {rental.days === 1 ? "día" : `${rental.days} días`}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--text-soft)]">
              <span className="font-extrabold text-[var(--text)]">
                {isPreventa
                  ? "Preventa"
                  : stock > 0
                  ? "Disponible"
                  : "Sin stock"}
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />

              <span>
                Stock:{" "}
                <span
                  className={`font-extrabold ${
                    !isPreventa && stock <= 0
                      ? "text-[var(--danger)]"
                      : "text-[var(--text)]"
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
              <div className="mt-7 border-t border-[var(--border-soft)] pt-5">
                <h2 className="text-lg font-extrabold text-[var(--text)]">
                  Descripción
                </h2>

                <div className="mt-2 max-h-[150px] overflow-y-auto overscroll-contain whitespace-pre-line text-sm leading-7 text-[var(--text-soft)] [-ms-overflow-style:none] [scrollbar-width:none] sm:max-h-[190px] [&::-webkit-scrollbar]:hidden">
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
                <span className="inline-flex rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] shadow-[0_8px_20px_var(--shadow)]">
                  {pairedIds.length > 0 ? "Completa el conjunto" : "También te puede gustar"}
                </span>

                <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[var(--text)] sm:text-[2.2rem]">
                  Productos relacionados
                </h2>
              </div>

              {product.category && (
                <Link
                  href={`/categoria/${product.category}`}
                  className="hidden shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:inline-flex"
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
