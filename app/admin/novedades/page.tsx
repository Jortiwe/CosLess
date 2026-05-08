import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import News from "../../../models/News";
import AdminBackButton from "../../../components/admin/AdminBackButton";
import DeleteNewsButton from "../../../components/admin/DeleteNewsButton";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

type NewsItem = {
  _id: string;
  title?: string;
  slug?: string;
  summary?: string;
  image?: string;
  isPublished?: boolean;
  createdAt?: string | Date;
};

function formatDate(dateValue?: string | Date) {
  if (!dateValue) return "Sin fecha";

  return new Date(dateValue).toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminNewsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params?.page || 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  await connectDB();

  const [rawNews, total] = await Promise.all([
    News.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    News.countDocuments(),
  ]);

  const news = JSON.parse(JSON.stringify(rawNews)) as NewsItem[];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestión de novedades</h1>
            <p className="mt-2 text-[#4b6b80]">
              Crea mensajes tipo noticia para mostrar en la tienda.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AdminBackButton />
            <Link
              href="/admin/novedades/nuevo"
              className="rounded-2xl bg-[#19b7c9] px-5 py-3 text-sm font-bold text-white"
            >
              Crear novedad
            </Link>
          </div>
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="rounded-2xl bg-white px-4 py-6 text-sm text-[#4b6b80]">
                No hay novedades todavía.
              </div>
            ) : (
              news.map((item) => (
                <article
                  key={item._id}
                  className="rounded-[24px] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex min-w-0 gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#eaf8ff]">
                        <img
                          src={item.image || "/placeholder-product.png"}
                          alt={item.title || "Novedad"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <h2 className="text-xl font-extrabold">
                          {item.title || "Sin título"}
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b6b80]">
                          {item.summary || "Sin resumen."}
                        </p>

                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.isPublished
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isPublished ? "Publicado" : "Oculto"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/novedades/${item._id}`}
                      className="rounded-xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white"
                    >
                      Editar
                    </Link>

                    <DeleteNewsButton newsId={item._id} title={item.title} />
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              href={`/admin/novedades?page=${Math.max(1, page - 1)}`}
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
              href={`/admin/novedades?page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold ${
                page >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Siguiente
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}