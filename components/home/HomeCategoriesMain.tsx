import Link from "next/link";
import { COSLESS_IMAGES } from "../../lib/coslessImages";

const categories = [
  {
    title: "Cosplays",
    description: "Trajes completos para tus personajes favoritos.",
    href: "/buscar?q=cosplays",
    image: COSLESS_IMAGES.home.catCosplays,
    panel:
      "linear-gradient(135deg, var(--surface-soft) 0%, var(--cos-soft) 100%)",
    chipBg: "var(--surface)",
    chipText: "var(--primary)",
    buttonBg: "var(--primary)",
    buttonHover: "var(--primary-dark)",
  },
  {
    title: "Pelucas",
    description: "Pelucas de distintos estilos, colores y cortes.",
    href: "/buscar?q=pelucas",
    image: COSLESS_IMAGES.home.catPelucas,
    panel:
      "linear-gradient(135deg, var(--surface-soft) 0%, var(--cos-soft) 100%)",
    chipBg: "var(--surface)",
    chipText: "var(--featured)",
    buttonBg: "var(--featured)",
    buttonHover: "var(--primary-dark)",
  },
  {
    title: "Lentes",
    description: "Lentes para completar mejor tu personaje.",
    href: "/buscar?q=lentes",
    image: COSLESS_IMAGES.home.catLentes,
    panel:
      "linear-gradient(135deg, var(--surface-soft) 0%, var(--cos-soft) 100%)",
    chipBg: "var(--surface)",
    chipText: "var(--primary)",
    buttonBg: "var(--primary)",
    buttonHover: "var(--primary-dark)",
  },
  {
    title: "Accesorios",
    description: "Detalles y complementos para tu outfit.",
    href: "/buscar?q=accesorios",
    image: COSLESS_IMAGES.home.catAccesorios,
    panel:
      "linear-gradient(135deg, var(--success-bg) 0%, var(--surface-soft) 100%)",
    chipBg: "var(--surface)",
    chipText: "var(--success)",
    buttonBg: "var(--success)",
    buttonHover: "var(--primary-dark)",
  },
  {
    title: "Preventa",
    description: "Reserva productos próximos a llegar.",
    href: "/buscar?q=preventa",
    image: COSLESS_IMAGES.home.catPreventa,
    panel:
      "linear-gradient(135deg, var(--danger-bg) 0%, var(--surface-soft) 100%)",
    chipBg: "var(--surface)",
    chipText: "var(--danger)",
    buttonBg: "var(--danger)",
    buttonHover: "var(--primary-dark)",
  },
];

export default function HomeCategoriesMain() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h2 className="text-[2rem] font-extrabold text-[var(--text)] sm:text-[2.2rem]">
          Categorías
        </h2>

        <p className="mt-2 text-[1rem] text-[var(--text-soft)]">
          Explora nuestras categorías principales y encuentra lo que buscas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.title}
            className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_30px_var(--shadow)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_var(--shadow-strong)]"
          >
            <div className="p-4">
              <div
                className="relative flex h-[170px] items-center justify-center overflow-hidden rounded-[24px] sm:h-[190px]"
                style={{ background: category.panel }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-95 transition duration-500 hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${category.image})` }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(16,38,90,0.18)_100%)]" />

                <span
                  className="relative z-10 rounded-full px-6 py-3 text-[1.05rem] font-extrabold shadow-sm backdrop-blur-sm"
                  style={{
                    backgroundColor: category.chipBg,
                    color: category.chipText,
                  }}
                >
                  {category.title}
                </span>
              </div>
            </div>

            <div className="px-5 pb-6">
              <h3 className="text-[1.85rem] font-extrabold text-[var(--text)]">
                {category.title}
              </h3>

              <p className="mt-2 min-h-[56px] text-[1rem] leading-7 text-[var(--text-soft)]">
                {category.description}
              </p>

              <Link
                href={category.href}
                className="mt-5 inline-flex rounded-2xl px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]"
                style={{ backgroundColor: category.buttonBg }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = category.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = category.buttonBg;
                }}
              >
                Ver categoría
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
