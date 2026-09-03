import Link from "next/link";
import { CATEGORY_LIST } from "../../lib/categories";

export default function Categories() {
  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-5 sm:mb-6">
        <span className="inline-flex rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)] shadow-sm">
          Explora
        </span>

        <div className="mt-3 flex items-center justify-between gap-4">
          <h2 className="text-[1.9rem] font-extrabold leading-tight text-[var(--text)] sm:text-[2.35rem]">
            Categorías
          </h2>

          <Link
            href="/productos"
            className="inline-flex shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--text)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95"
          >
            Ver todo
          </Link>
        </div>

        <p className="mt-2 hidden max-w-xl text-sm leading-6 text-[var(--text-soft)] sm:block sm:text-base">
          Encuentra rápido lo que necesitas para armar tu cosplay.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {CATEGORY_LIST.map((category) => (
          <Link
            key={category.slug}
            href={`/categoria/${category.slug}`}
            className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_24px_var(--shadow)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_var(--shadow-strong)]"
          >
            <div className="relative h-[145px] overflow-hidden sm:h-[170px] xl:h-[190px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,38,90,0.72)] via-[rgba(16,38,90,0.14)] to-white/5" />

              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-[var(--text)] shadow-sm backdrop-blur sm:text-xs">
                {category.title}
              </span>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-[1.05rem] font-extrabold leading-tight text-white sm:text-[1.18rem]">
                  {category.title}
                </h3>

                <p className="mt-1 line-clamp-1 text-[12px] font-medium text-white/90 sm:text-[13px]">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-3 sm:px-4">
              <span className="text-[12px] font-bold text-[var(--text-soft)] sm:text-sm">
                Ver categoría
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}