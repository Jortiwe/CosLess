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
  status?: string;
  stock?: number;
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

function formatCount(count: number) {
  if (count > 99) return "99+";
  return `${count}+`;
}

function ProductCard({ product }: { product: SearchProduct }) {
  const href = product.slug ? `/producto/${product.slug}` : "#";
  const image = product.mainImage || "/placeholder-product.png";
  const status = product.status || "stock";
  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isOutOfStock = status !== "preventa" && stock <= 0;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[26px] border border-[#cfeaf6] bg-white shadow-[0_8px_24px_rgba(22,50,74,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(22,50,74,0.10)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#eaf8ff]">
        <Image
          src={image}
          alt={product.title || "Producto"}
          width={500}
          height={500}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex max-w-[calc(100%-16px)] flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#16324a] shadow-sm sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
            {product.category || "Producto"}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] shadow-sm sm:px-3 sm:text-[10px] sm:tracking-[0.14em] ${
              isOutOfStock
                ? "bg-[#ffe6ed] text-[#d63865]"
                : status === "preventa"
                ? "bg-[#fff3dc] text-[#b87d00]"
                : "bg-[#e6f6ed] text-[#16824c]"
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
        <h3 className="line-clamp-2 min-h-[42px] text-[0.9rem] font-extrabold leading-5 text-[#16324a] sm:min-h-[48px] sm:text-[1.08rem] sm:leading-6">
          {product.title || "Producto sin título"}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2 sm:gap-3">
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-[#cfeaf6] bg-white px-5 py-6 text-sm font-semibold text-[#4b6b80] shadow-[0_8px_24px_rgba(22,50,74,0.04)]">
      {text}
    </div>
  );
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

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mb-4 flex justify-start">
          <Link
            href="/"
            className="group relative inline-flex items-center text-sm font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
          >
            <span className="mr-1">←</span>
            Inicio
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#19b7c9] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <div className="mb-6 rounded-[26px] border border-[#cfeaf6] bg-white px-4 py-4 shadow-[0_10px_25px_rgba(22,50,74,0.04)] sm:mb-7 sm:rounded-[28px] sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-xs font-extrabold text-[#19b7c9] sm:text-sm">
              Búsqueda
            </span>

            <p className="text-sm font-semibold text-[#4b6b80] sm:text-base">
              Consulta por:{" "}
              <span className="font-extrabold text-[#16324a]">“{q}”</span>
            </p>
          </div>
        </div>

        <div className="grid gap-7">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[1.35rem] font-extrabold text-[#16324a] sm:text-2xl">
                Coincidencias directas
              </h2>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#19b7c9] shadow-sm">
                {formatCount(exactMatches.length)}
              </span>
            </div>

            {exactMatches.length === 0 ? (
              <EmptyState text="No hay coincidencias directas." />
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {exactMatches.map((product: SearchProduct) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[1.35rem] font-extrabold text-[#16324a] sm:text-2xl">
                Relacionados
              </h2>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#19b7c9] shadow-sm">
                {formatCount(relatedMatches.length)}
              </span>
            </div>

            {relatedMatches.length === 0 ? (
              <EmptyState text="No hay productos relacionados." />
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {relatedMatches.map((product: SearchProduct) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}