import Header from "../components/layout/Header";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import HomeIntro from "../components/home/HomeIntro";
import HomeProductRail from "../components/home/HomeProductRail";
import Footer from "../components/layout/Footer";
import { connectDB } from "../lib/mongodb";
import Product from "../models/Product";

export const dynamic = "force-dynamic";

type RawProduct = {
  title?: string;
  slug?: string;
  price?: number;
  oldPrice?: number;
  mainImage?: string;
  images?: string[];
  status?: string;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Consultar";
  return `Bs${value.toFixed(2)}`;
}

function formatProduct(product: RawProduct, fallbackBadge: string) {
  return {
    title: product.title || "Producto",
    price: formatBs(product.price),
    oldPrice:
      typeof product.oldPrice === "number" && product.oldPrice > 0
        ? formatBs(product.oldPrice)
        : undefined,
    image:
      product.mainImage ||
      product.images?.[0] ||
      "/placeholder-product.png",
    href: product.slug ? `/producto/${product.slug}` : "/productos",
    badge:
      product.status === "preventa"
        ? "Preventa"
        : fallbackBadge,
  };
}

export default async function HomePage() {
  await connectDB();

  const [offerRawProducts, weeklyRawProducts] = await Promise.all([
    Product.find({
      isActive: true,
      isOffer: true,
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(10)
      .lean(),

    Product.find({
      isActive: true,
      isWeeklyNew: true,
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const offerProducts = JSON.parse(JSON.stringify(offerRawProducts)).map(
    (product: RawProduct) => formatProduct(product, "Oferta")
  );

  const weeklyProducts = JSON.parse(JSON.stringify(weeklyRawProducts)).map(
    (product: RawProduct) => formatProduct(product, "Nuevo")
  );

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
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