import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProductCatalog, {
  CatalogProduct,
} from "../../components/catalog/ProductCatalog";
import { connectDB } from "../../lib/mongodb";
import Product from "../../models/Product";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

function getPageInfo(section?: string) {
  if (section === "ofertas") {
    return {
      badge: "Ofertas",
      title: "Productos en oferta",
      description:
        "Productos seleccionados con precios especiales o promociones activas.",
    };
  }

  if (section === "nuevos") {
    return {
      badge: "Novedades",
      title: "Nuevos semanales",
      description:
        "Productos recién agregados o marcados como novedades de la semana.",
    };
  }

  if (section === "nuevos-cosplays") {
  return {
    badge: "Nuevos cosplays",
    title: "Nuevos cosplays",
    description:
      "Cosplays recién agregados o marcados como novedades de la semana.",
  };
}

if (section === "destacados") {
  return {
    badge: "Destacados",
    title: "Productos destacados",
    description:
      "Productos seleccionados y recomendados por CosLess.",
  };
}

  return {
    badge: "Ver todo",
    title: "Todos los productos",
    description:
      "Explora todo el catálogo y ordena por fecha, categoría, nombre o precio.",
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const section = params?.section;

  await connectDB();

  const query: Record<string, unknown> = {
    isActive: true,
  };

  if (section === "ofertas") {
    query.isOffer = true;
  }

  if (section === "nuevos") {
    query.isWeeklyNew = true;
  }
  if (section === "nuevos-cosplays") {
  query.isWeeklyNew = true;
  query.category = "cosplays";
}

if (section === "destacados") {
  query.isFeatured = true;
}

  const rawProducts = await Product.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(rawProducts)) as CatalogProduct[];

  const pageInfo = getPageInfo(section);

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-bold text-[#19b7c9]">
            {pageInfo.badge}
          </span>

          <h1 className="mt-4 text-[2.3rem] font-extrabold leading-tight sm:text-[3rem]">
            {pageInfo.title}
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-[#4b6b80]">
            {pageInfo.description}
          </p>
        </div>

        {products.length > 0 ? (
          <ProductCatalog products={products} showCategoryFilter />
        ) : (
          <div className="rounded-[28px] border border-[#cfeaf6] bg-white px-6 py-10 text-[#4b6b80] shadow-sm">
            No hay productos en esta sección todavía.
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}