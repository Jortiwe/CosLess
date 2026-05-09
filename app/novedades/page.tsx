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

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mb-5 flex justify-start">
          <Link
            href="/"
            className="group relative inline-flex items-center text-sm font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
          >
            <span className="mr-1">←</span>
            Inicio
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#19b7c9] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <div className="mb-6 border-b border-[#cfeaf6] pb-5 sm:mb-8 sm:pb-6">
          <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#19b7c9] shadow-[0_8px_20px_rgba(22,50,74,0.04)] sm:text-sm">
            Noticias CosLess
          </span>
        </div>

        {news.length === 0 ? (
          <div className="rounded-[30px] border border-[#cfeaf6] bg-white px-6 py-10 text-[#4b6b80] shadow-[0_10px_25px_rgba(22,50,74,0.04)]">
            No hay novedades publicadas todavía.
          </div>
        ) : (
          <>
            {mainNews && (
              <article className="mb-7 overflow-hidden rounded-[30px] border border-[#cfeaf6] bg-white shadow-[0_12px_32px_rgba(22,50,74,0.06)] sm:mb-8 sm:rounded-[34px] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
                <div className="h-[270px] overflow-hidden bg-[#eaf8ff] sm:h-[380px] lg:h-[560px]">
                  <img
                    src={mainNews.image || "/placeholder-product.png"}
                    alt={mainNews.title || "Novedad"}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="flex flex-col p-5 sm:p-8 lg:h-[560px] lg:p-10">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#19b7c9] sm:text-sm">
                    {formatDate(mainNews.createdAt)}
                  </p>

                  <h2 className="mt-3 line-clamp-3 text-[2rem] font-extrabold leading-tight tracking-tight text-[#16324a] sm:mt-4 sm:text-[2.8rem]">
                    {mainNews.title}
                  </h2>

                  {(mainNews.summary || mainNews.content) && (
                    <p className="mt-3 line-clamp-2 text-[0.95rem] leading-7 text-[#4b6b80] sm:mt-4 sm:text-base">
                      {mainNews.summary || mainNews.content}
                    </p>
                  )}

                  {mainNews.content && (
                    <div className="mt-5 max-h-[230px] overflow-y-auto overscroll-contain whitespace-pre-line border-t border-[#e5f3fa] pt-5 text-[0.92rem] leading-7 text-[#16324a] [-ms-overflow-style:none] [scrollbar-width:none] sm:max-h-[280px] sm:text-[15px] sm:leading-8 lg:max-h-[310px] [&::-webkit-scrollbar]:hidden">
                      {mainNews.content}
                    </div>
                  )}
                </div>
              </article>
            )}

            {secondaryNews.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {secondaryNews.map((item) => (
                  <article
                    key={item._id}
                    className="overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white shadow-[0_10px_26px_rgba(22,50,74,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(22,50,74,0.09)]"
                  >
                    <div className="h-[190px] overflow-hidden bg-[#eaf8ff] sm:h-[220px] lg:h-[230px]">
                      <img
                        src={item.image || "/placeholder-product.png"}
                        alt={item.title || "Novedad"}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#19b7c9]">
                        {formatDate(item.createdAt)}
                      </p>

                      <h2 className="mt-3 line-clamp-2 min-h-[56px] text-xl font-extrabold leading-tight text-[#16324a]">
                        {item.title}
                      </h2>

                      {(item.summary || item.content) && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#4b6b80]">
                          {item.summary || item.content}
                        </p>
                      )}

                      {item.content && (
                        <div className="mt-4 max-h-[170px] overflow-y-auto overscroll-contain whitespace-pre-line border-t border-[#e5f3fa] pt-4 text-sm leading-7 text-[#16324a] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {item.content}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Link
                href={`/novedades?page=${Math.max(1, page - 1)}`}
                className={`rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:px-5 ${
                  page <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Anterior
              </Link>

              <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#4b6b80] shadow-sm sm:text-sm">
                Página {page} de {totalPages}
              </span>

              <Link
                href={`/novedades?page=${Math.min(totalPages, page + 1)}`}
                className={`rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:px-5 ${
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