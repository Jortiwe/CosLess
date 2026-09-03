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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1380px] px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mb-5 flex justify-start">
          <Link
            href="/"
            className="group relative inline-flex items-center text-sm font-extrabold text-[var(--text)] transition hover:text-[var(--primary)]"
          >
            <span className="mr-1">←</span>
            Inicio
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <div className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-8 sm:pb-6">
          <span className="inline-flex rounded-full bg-[var(--surface)] px-5 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)] shadow-[0_8px_20px_var(--shadow)] sm:text-sm">
            Noticias CosLess
          </span>
        </div>

        {news.length === 0 ? (
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-[var(--text-soft)] shadow-[0_10px_25px_var(--shadow)]">
            No hay novedades publicadas todavía.
          </div>
        ) : (
          <>
            {mainNews && (
              <article className="mb-7 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_var(--shadow)] sm:mb-8 sm:rounded-[34px] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
                <div className="h-[270px] overflow-hidden bg-[var(--surface-soft)] sm:h-[380px] lg:min-h-[560px]">
                  <img
                    src={mainNews.image || "/placeholder-product.png"}
                    alt={mainNews.title || "Novedad"}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="flex flex-col p-5 sm:p-8 lg:min-h-[560px] lg:p-10">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)] sm:text-sm">
                    {formatDate(mainNews.createdAt)}
                  </p>

                  <h2 className="mt-4 max-w-[850px] text-[1.95rem] font-extrabold leading-[1.16] tracking-[-0.03em] text-[var(--text)] sm:text-[2.45rem] lg:text-[2.75rem] xl:text-[3rem]">
                    {mainNews.title}
                  </h2>

                  {mainNews.summary && (
                    <p className="mt-4 text-[0.95rem] leading-7 text-[var(--text-soft)] sm:text-base lg:text-[1.05rem]">
                      {mainNews.summary}
                    </p>
                  )}

                  {mainNews.content && (
                    <div className="mt-5 max-h-none overflow-visible whitespace-pre-line border-t border-[var(--border-soft)] pt-5 text-[0.92rem] leading-7 text-[var(--text)] sm:text-[15px] sm:leading-8 lg:max-h-[300px] lg:overflow-y-auto lg:overscroll-contain lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
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
                    className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_26px_var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_var(--shadow-strong)]"
                  >
                    <div className="h-[190px] overflow-hidden bg-[var(--surface-soft)] sm:h-[220px] lg:h-[230px]">
                      <img
                        src={item.image || "/placeholder-product.png"}
                        alt={item.title || "Novedad"}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                        {formatDate(item.createdAt)}
                      </p>

                      <h2 className="mt-3 line-clamp-2 min-h-[60px] text-xl font-extrabold leading-[1.18] tracking-[-0.02em] text-[var(--text)]">
                        {item.title}
                      </h2>

                      {(item.summary || item.content) && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-soft)]">
                          {item.summary || item.content}
                        </p>
                      )}

                      {item.content && (
                        <div className="mt-4 max-h-[170px] overflow-y-auto overscroll-contain whitespace-pre-line border-t border-[var(--border-soft)] pt-4 text-sm leading-7 text-[var(--text)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:px-5 ${
                  page <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Anterior
              </Link>

              <span className="rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-extrabold text-[var(--text-soft)] shadow-sm sm:text-sm">
                Página {page} de {totalPages}
              </span>

              <Link
                href={`/novedades?page=${Math.min(totalPages, page + 1)}`}
                className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:px-5 ${
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