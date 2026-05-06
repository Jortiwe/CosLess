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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  await connectDB();

  const rawProducts = await Product.find({
    category: { $in: category.queryValues },
    $or: [
      { isActive: true },
      { active: true },
      { isActive: { $exists: false } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(rawProducts)) as CatalogProduct[];

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 overflow-hidden rounded-[34px] border border-[#cfeaf6] bg-white shadow-[0_12px_32px_rgba(22,50,74,0.06)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <span className="inline-flex w-fit rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-bold text-[#19b7c9]">
                Categoría
              </span>

              <h1 className="mt-4 text-[2.4rem] font-extrabold leading-tight text-[#16324a] sm:text-[3.2rem]">
                {category.title}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4b6b80]">
                {category.description}
              </p>

              <p className="mt-4 text-sm font-bold text-[#19b7c9]">
                {products.length} productos encontrados
              </p>
            </div>

            <div className="relative min-h-[230px] overflow-hidden lg:min-h-[320px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>
        </div>

        <ProductCatalog products={products} showCategoryFilter={false} />
      </section>

      <Footer />
    </main>
  );
}