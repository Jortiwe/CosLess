import { notFound } from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import ProductCatalog, {
  CatalogProduct,
} from "../../../components/catalog/ProductCatalog";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import { getCategoryBySlug } from "../../../lib/categories";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatProductCount(count: number) {
  if (count > 99) return "99+";
  return `${count}+`;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  await connectDB();

  const activeFilter = {
    $or: [
      { isActive: true },
      { active: true },
      { isActive: { $exists: false } },
    ],
  };

  const categoryFilter =
    slug === "preventa"
      ? {
          $or: [
            { status: "preventa" },
            { category: { $in: category.queryValues } },
            { categories: { $in: category.queryValues } },
          ],
        }
      : {
          $or: [
            { category: { $in: category.queryValues } },
            { categories: { $in: category.queryValues } },
          ],
        };

  const rawProducts = await Product.find({
    $and: [activeFilter, categoryFilter],
  })
    .sort({ createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(rawProducts)) as CatalogProduct[];

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_var(--shadow)] sm:mb-7 sm:rounded-[34px]">
          <div className="grid min-h-[165px] grid-cols-[1fr_40%] lg:min-h-[320px] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center p-5 pr-3 sm:p-8 lg:p-10">
              <span className="inline-flex w-fit rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)] sm:text-sm">
                Categoría
              </span>

              <h1 className="mt-3 text-[2rem] font-extrabold leading-tight text-[var(--text)] sm:mt-4 sm:text-[3.2rem]">
                {category.title}
              </h1>

              <p className="mt-3 hidden max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:block">
                {category.description}
              </p>

              <p className="mt-3 text-sm font-extrabold text-[var(--primary)] sm:mt-4">
                {formatProductCount(products.length)} productos
              </p>
            </div>

            <div className="relative min-h-[165px] overflow-hidden bg-[var(--surface-soft)] lg:min-h-[320px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${category.image})` }}
              />

              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          </div>
        </div>

        <ProductCatalog products={products} showCategoryFilter={false} />
      </section>

      <Footer />
    </main>
  );
}