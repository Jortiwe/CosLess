import Header from "../components/layout/Header";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import HomeIntro from "../components/home/HomeIntro";
import HomeProductRail from "../components/home/HomeProductRail";
import Footer from "../components/layout/Footer";
import { connectDB } from "../lib/mongodb";
import Product from "../models/Product";
import { sortProductsByRotation } from "../lib/product-order";

export const dynamic = "force-dynamic";

type RawProduct = {
  title?: string;
  slug?: string;
  price?: number;
  oldPrice?: number;
  mainImage?: string;
  images?: string[];
  status?: string;
  categories?: string[];
  isRentable?: boolean;
  rentalPrice?: number;
  rentalAvailable?: boolean;
  category?: string;
  createdAt?: string | Date;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Consultar";
  return `Bs${value.toFixed(2)}`;
}

function formatProduct(product: RawProduct, fallbackBadge: string, rental = false) {
  return {
    title: product.title || "Producto",
    price: formatBs(rental ? product.rentalPrice : product.price),
    oldPrice:
      typeof product.oldPrice === "number" && product.oldPrice > 0
        ? formatBs(product.oldPrice)
        : undefined,
    image: product.mainImage || product.images?.[0] || "/placeholder-product.png",
    href: product.slug ? `/producto/${product.slug}` : "/productos",
    badge: rental ? "Alquiler" : product.status === "preventa" ? "Preventa" : fallbackBadge,
  };
}

export default async function HomePage() {
  await connectDB();

  const [offerRawProducts, rentalRawProducts, weeklyRawProducts] = await Promise.all([
    Product.find({
      isActive: true,
      isOffer: true,
      stock: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .lean(),

    Product.find({
      isActive: true,
      stock: { $gt: 0 },
      isRentable: true,
      rentalAvailable: { $ne: false },
      rentalPrice: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .lean(),

    Product.find({
      isActive: true,
      isWeeklyNew: true,
      stock: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const offerProducts = sortProductsByRotation(JSON.parse(JSON.stringify(offerRawProducts)) as RawProduct[]).slice(0, 10).map(
    (product: RawProduct) => formatProduct(product, "Oferta")
  );

  const rentalProducts = sortProductsByRotation(JSON.parse(JSON.stringify(rentalRawProducts)) as RawProduct[]).slice(0, 10).map(
    (product: RawProduct) => formatProduct(product, "Alquiler", true)
  );

  const weeklyProducts = sortProductsByRotation(JSON.parse(JSON.stringify(weeklyRawProducts)) as RawProduct[]).slice(0, 10).map(
    (product: RawProduct) => formatProduct(product, "Nuevo")
  );

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <div className="mx-auto max-w-[1380px] px-4 pb-6 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        <Hero />

        <Categories />

        {offerProducts.length > 0 && (
          <HomeProductRail
            title="Ofertas"
            subtitle="Productos seleccionados con precios especiales."
            products={offerProducts}
            viewAllHref="/productos?section=ofertas"
          />
        )}

        {rentalProducts.length > 0 && (
          <HomeProductRail
            title="Alquiler"
            subtitle="Productos disponibles para alquilar por tiempo limitado."
            products={rentalProducts}
            viewAllHref="/productos?section=alquiler"
          />
        )}

        {weeklyProducts.length > 0 && (
          <HomeProductRail
            title="Nuevos semanales"
            subtitle="Ingresos recientes y productos destacados de la semana."
            products={weeklyProducts}
            viewAllHref="/productos?section=nuevos"
          />
        )}

        <HomeIntro />
      </div>

      <Footer />
    </main>
  );
}
