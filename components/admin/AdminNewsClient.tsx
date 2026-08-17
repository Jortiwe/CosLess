"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import DeleteNewsButton from "./DeleteNewsButton";

type NewsItem = {
  _id: string;
  title?: string;
  slug?: string;
  summary?: string;
  image?: string;
  isPublished?: boolean;
  createdAt?: string | Date;
};

type AdminNewsClientProps = {
  news: NewsItem[];
  page: number;
  totalPages: number;
  total: number;
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

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";

  const value = src.trim();

  if (!value) return "/placeholder-product.png";

  return value;
}

export default function AdminNewsClient({
  news,
  page,
  totalPages,
  total,
}: AdminNewsClientProps) {
  const [search, setSearch] = useState("");

  const filteredNews = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return news;

    return news.filter((item) => {
      const searchableText = [
        item.title,
        item.slug,
        item.summary,
        item.isPublished ? "publicado" : "oculto",
        formatDate(item.createdAt),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [news, search]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
            Gestión de novedades
          </h1>

          <p className="mt-2 hidden text-[var(--text-soft)] sm:block">
            Crea mensajes tipo noticia para mostrar en la tienda.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/admin/novedades/nuevo"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-3 text-xs font-extrabold text-[var(--cos-white)] transition hover:bg-[var(--primary-dark)] sm:h-12 sm:px-5 sm:text-sm"
            >
              Crear novedad
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_26px_var(--shadow)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar novedad..."
              className="h-12 w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)] sm:h-14"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[var(--text-muted)]">
            <span>
              {filteredNews.length} de {news.length} en esta página
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[var(--primary)] transition hover:text-[var(--primary-dark)]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredNews.length === 0 ? (
              <div className="rounded-[24px] bg-[var(--surface)] px-4 py-6 text-sm font-semibold text-[var(--text-soft)]">
                No hay novedades que coincidan con la búsqueda.
              </div>
            ) : (
              filteredNews.map((item) => (
                <article
                  key={item._id}
                  className="rounded-[24px] border border-transparent bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_26px_var(--shadow-strong)] sm:p-5"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[20px] bg-[var(--surface-soft)] sm:h-24 sm:w-24 sm:rounded-2xl">
                      <img
                        src={getSafeImage(item.image)}
                        alt={item.title || "Novedad"}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-[1rem] font-extrabold leading-5 text-[var(--text)] sm:text-xl sm:leading-7">
                          {item.title || "Sin título"}
                        </h2>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] sm:text-xs ${
                            item.isPublished
                              ? "bg-[var(--success-bg)] text-[var(--success)]"
                              : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                          }`}
                        >
                          {item.isPublished ? "Publicado" : "Oculto"}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-soft)]">
                        {item.summary || "Sin resumen."}
                      </p>

                      <p className="mt-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:text-xs">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <Link
                      href={`/admin/novedades/${item._id}`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-xs font-extrabold text-[var(--cos-white)] transition hover:bg-[var(--primary-dark)] sm:w-auto sm:text-sm"
                    >
                      Editar
                    </Link>

                    <div className="[&_button]:!h-11 [&_button]:!w-full [&_button]:!rounded-2xl [&_button]:!text-xs [&_button]:!font-extrabold sm:[&_button]:!w-auto sm:[&_button]:!text-sm">
                      <DeleteNewsButton newsId={item._id} title={item.title} />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 items-center gap-2">
            <Link
              href={`/admin/novedades?page=${Math.max(1, page - 1)}`}
              className={`inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm ${
                page <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Anterior
            </Link>

            <span className="text-center text-xs font-extrabold text-[var(--text-soft)] sm:text-sm">
              {page} / {totalPages}
            </span>

            <Link
              href={`/admin/novedades?page=${Math.min(totalPages, page + 1)}`}
              className={`inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm ${
                page >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Siguiente
            </Link>
          </div>

          <p className="mt-3 text-center text-xs font-bold text-[var(--text-muted)]">
            Total: {total} novedades
          </p>
        </section>
      </div>
    </main>
  );
}