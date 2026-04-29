import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProductCatalog, {
  CatalogProduct,
} from "../../components/catalog/ProductCatalog";
import { connectDB } from "../../lib/mongodb";
import Product from "../../models/Product";

export default async function ProductsPage() {
  await connectDB();

  const rawProducts = await Product.find({
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(rawProducts)) as CatalogProduct[];

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-bold text-[#19b7c9]">
            Ver todo
          </span>

          <h1 className="mt-4 text-[2.3rem] font-extrabold leading-tight sm:text-[3rem]">
            Todos los productos
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-[#4b6b80]">
            Explora todo el catálogo y ordena por fecha, categoría, nombre o
            precio.
          </p>
        </div>

        <ProductCatalog products={products} showCategoryFilter />
      </section>

      <Footer />
    </main>
  );
}