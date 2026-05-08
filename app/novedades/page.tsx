import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { connectDB } from "../../lib/mongodb";
import News from "../../models/News";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

type NewsItem = {
  _id: string;
  title?: string;
  summary?: string;
  content?: string;
  image?: string;
  createdAt?: string | Date;
};

function formatDate(dateValue?: string | Date) {
  if (!dateValue) return "Sin fecha";

  return new Date(dateValue).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicNewsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params?.page || 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  await connectDB();

  const [rawNews, total] = await Promise.all([
    News.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    News.countDocuments({ isPublished: true }),
  ]);

  const news = JSON.parse(JSON.stringify(rawNews)) as NewsItem[];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const mainNews = news[0];
  const secondaryNews = news.slice(1);

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#cfeaf6] pb-6">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#19b7c9]">
            Noticias CosLess
          </span>

          <h1 className="mt-4 text-[2.5rem] font-extrabold leading-tight tracking-tight sm:text-[4rem]">
            Novedades
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-[#4b6b80]">
            Actualizaciones, nuevos ingresos, preventas, productos disponibles y
            noticias importantes de la tienda.
          </p>
        </div>

        {news.length === 0 ? (
          <div className="rounded-[30px] border border-[#cfeaf6] bg-white px-6 py-10 text-[#4b6b80]">
            No hay novedades publicadas todavía.
          </div>
        ) : (
          <>
            {mainNews && (
              <article className="mb-8 grid overflow-hidden rounded-[34px] border border-[#cfeaf6] bg-white shadow-[0_12px_30px_rgba(22,50,74,0.06)] lg:grid-cols-[1.1fr_0.9fr]">
                <div className="min-h-[280px] bg-[#eaf8ff]">
                  <img
                    src={mainNews.image || "/placeholder-product.png"}
                    alt={mainNews.title || "Novedad"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#19b7c9]">
                    {formatDate(mainNews.createdAt)}
                  </p>

                  <h2 className="mt-4 text-[2rem] font-extrabold leading-tight tracking-tight sm:text-[2.8rem]">
                    {mainNews.title}
                  </h2>

                  <p className="mt-4 text-base leading-8 text-[#4b6b80]">
                    {mainNews.summary || mainNews.content}
                  </p>

                  <div className="mt-6 whitespace-pre-line border-t border-[#e5f3fa] pt-5 text-[15px] leading-8 text-[#16324a]">
                    {mainNews.content}
                  </div>
                </div>
              </article>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {secondaryNews.map((item) => (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white shadow-[0_10px_26px_rgba(22,50,74,0.05)]"
                >
                  <div className="h-[220px] bg-[#eaf8ff]">
                    <img
                      src={item.image || "/placeholder-product.png"}
                      alt={item.title || "Novedad"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#19b7c9]">
                      {formatDate(item.createdAt)}
                    </p>

                    <h2 className="mt-3 text-xl font-extrabold leading-tight">
                      {item.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#4b6b80]">
                      {item.summary || item.content}
                    </p>

                    <div className="mt-4 whitespace-pre-line border-t border-[#e5f3fa] pt-4 text-sm leading-7 text-[#16324a]">
                      {item.content}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Link
                href={`/novedades?page=${Math.max(1, page - 1)}`}
                className={`rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold ${
                  page <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Anterior
              </Link>

              <span className="text-sm font-bold text-[#4b6b80]">
                Página {page} de {totalPages}
              </span>

              <Link
                href={`/novedades?page=${Math.min(totalPages, page + 1)}`}
                className={`rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold ${
                  page >= totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Siguiente
              </Link>
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}