import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { connectDB } from "../../lib/mongodb";
import Product from "../../models/Product";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type SearchProduct = {
  _id: string;
  slug?: string;
  title?: string;
  category?: string;
  description?: string;
  mainImage?: string;
  price?: number;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

function normalizeText(value: unknown): string {
  return String(value || "").toLowerCase();
}

function splitWords(value: unknown): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((word: string) => word.length > 0);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  await connectDB();

  const rawProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const products: SearchProduct[] = JSON.parse(JSON.stringify(rawProducts));

  const exactMatches: SearchProduct[] = query
    ? products.filter((product: SearchProduct) => {
        const title = normalizeText(product.title);
        const category = normalizeText(product.category);
        const description = normalizeText(product.description);

        return (
          title.includes(query) ||
          category.includes(query) ||
          description.includes(query)
        );
      })
    : [];

  const relatedMatches: SearchProduct[] = query
    ? products.filter((product: SearchProduct) => {
        const titleWords = splitWords(product.title);
        const category = normalizeText(product.category);
        const descriptionWords = splitWords(product.description);
        const queryWords = splitWords(query);

        const hasWordMatch = queryWords.some((word: string) => {
          return (
            titleWords.some(
              (item: string) => item.includes(word) || word.includes(item)
            ) ||
            descriptionWords.some(
              (item: string) => item.includes(word) || word.includes(item)
            ) ||
            category.includes(word)
          );
        });

        const alreadyInExact = exactMatches.some(
          (exact: SearchProduct) => String(exact._id) === String(product._id)
        );

        return hasWordMatch && !alreadyInExact;
      })
    : [];

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            ← Volver al inicio
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold">Resultados de búsqueda</h1>
          <p className="mt-3 text-[#4b6b80]">
            Consulta por: <span className="font-bold">“{q}”</span>
          </p>
        </div>

        <div className="grid gap-8">
          <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6">
            <h2 className="text-2xl font-extrabold">Coincidencias directas</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {exactMatches.length === 0 ? (
                <div className="rounded-2xl bg-white p-5 text-[#4b6b80]">
                  No hay coincidencias directas.
                </div>
              ) : (
                exactMatches.map((product: SearchProduct) => (
                  <Link
                    key={product._id}
                    href={`/producto/${product.slug || ""}`}
                    className="rounded-[24px] bg-white p-5 transition hover:-translate-y-1"
                  >
                    <Image
                      src={product.mainImage || "/placeholder-product.png"}
                      alt={product.title || "Producto"}
                      width={400}
                      height={400}
                      className="h-[220px] w-full rounded-2xl object-cover"
                    />

                    <h3 className="mt-4 text-xl font-extrabold">
                      {product.title || "Sin título"}
                    </h3>
                    <p className="mt-2 text-sm text-[#4b6b80]">
                      {product.category || "Sin categoría"}
                    </p>
                    <p className="mt-3 text-lg font-extrabold text-[#19b7c9]">
                      {formatBs(product.price)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6">
            <h2 className="text-2xl font-extrabold">Relacionados</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedMatches.length === 0 ? (
                <div className="rounded-2xl bg-white p-5 text-[#4b6b80]">
                  No hay productos relacionados.
                </div>
              ) : (
                relatedMatches.map((product: SearchProduct) => (
                  <Link
                    key={product._id}
                    href={`/producto/${product.slug || ""}`}
                    className="rounded-[24px] bg-white p-5 transition hover:-translate-y-1"
                  >
                    <Image
                      src={product.mainImage || "/placeholder-product.png"}
                      alt={product.title || "Producto"}
                      width={400}
                      height={400}
                      className="h-[220px] w-full rounded-2xl object-cover"
                    />

                    <h3 className="mt-4 text-xl font-extrabold">
                      {product.title || "Sin título"}
                    </h3>
                    <p className="mt-2 text-sm text-[#4b6b80]">
                      {product.category || "Sin categoría"}
                    </p>
                    <p className="mt-3 text-lg font-extrabold text-[#19b7c9]">
                      {formatBs(product.price)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}