import Link from "next/link";
import { CATEGORY_LIST } from "../../lib/categories";


const categories = [
  {
    title: "Cosplays",
    description: "Trajes completos",
    href: "/buscar?q=cosplays",
    image: "/images/home/cat-cosplays.png",
  },
  {
    title: "Pelucas",
    description: "Estilos y colores",
    href: "/buscar?q=pelucas",
    image: "/images/home/cat-pelucas.png",
  },
  {
    title: "Lentes",
    description: "Para tu personaje",
    href: "/buscar?q=lentes",
    image: "/images/home/cat-lentes.png",
  },
  {
    title: "Mallas",
    description: "Base para cosplay",
    href: "/buscar?q=mallas",
    image: "/images/home/cat-mallas.png",
  },
  {
    title: "Accesorios",
    description: "Detalles finales",
    href: "/buscar?q=accesorios",
    image: "/images/home/cat-accesorios.png",
  },
  {
    title: "Preventa",
    description: "Próximos ingresos",
    href: "/buscar?q=preventa",
    image: "/images/home/cat-preventa.png",
  },
];

export default function Categories() {
  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#19b7c9] shadow-sm">
            Explora
          </span>

          <h2 className="mt-3 text-[1.9rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.35rem]">
            Categorías
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#4b6b80] sm:text-base">
            Encuentra rápido lo que necesitas para armar tu cosplay.
          </p>
        </div>

        <Link
          href="/productos"
          className="hidden rounded-2xl border border-[#bfefff] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:inline-flex"
        >
          Ver todo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {CATEGORY_LIST.map((category) => (
          <Link
            key={category.slug}
            href={`/categoria/${category.slug}`}
            className="group overflow-hidden rounded-[24px] border border-[#cfeaf6] bg-white shadow-[0_10px_24px_rgba(22,50,74,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(22,50,74,0.10)]"
          >
            <div className="relative h-[145px] overflow-hidden sm:h-[170px] xl:h-[190px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#102d44]/65 via-[#102d44]/10 to-white/5" />

              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-[#16324a] shadow-sm backdrop-blur sm:text-xs">
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
              <span className="text-[12px] font-bold text-[#4b6b80] sm:text-sm">
                Ver categoría
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf8ff] text-sm font-extrabold text-[#19b7c9] transition group-hover:bg-[#19b7c9] group-hover:text-white">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}