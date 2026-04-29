import Link from "next/link";

const categories = [
  {
    title: "Cosplays",
    description: "Trajes completos para tus personajes favoritos.",
    href: "/buscar?q=cosplays",
    image: "/images/home/cat-cosplays.png",
    panel: "linear-gradient(135deg, #ffeef5 0%, #ffd9ea 100%)",
    chipBg: "#fff7fb",
    chipText: "#b83280",
    buttonBg: "#f06292",
    buttonHover: "#ec407a",
  },
  {
    title: "Pelucas",
    description: "Pelucas de distintos estilos, colores y cortes.",
    href: "/buscar?q=pelucas",
    image: "/images/home/cat-pelucas.png",
    panel: "linear-gradient(135deg, #f5efff 0%, #e7dcff 100%)",
    chipBg: "#faf7ff",
    chipText: "#7c3aed",
    buttonBg: "#8b5cf6",
    buttonHover: "#7c3aed",
  },
  {
    title: "Lentes",
    description: "Lentes para completar mejor tu personaje.",
    href: "/buscar?q=lentes",
    image: "/images/home/cat-lentes.png",
    panel: "linear-gradient(135deg, #eef8ff 0%, #dff1ff 100%)",
    chipBg: "#f8fdff",
    chipText: "#0f766e",
    buttonBg: "#19b7c9",
    buttonHover: "#0ea5b7",
  },
  {
    title: "Mallas",
    description: "Opciones básicas y especiales para cosplay.",
    href: "/buscar?q=mallas",
    image: "/images/home/cat-mallas.png",
    panel: "linear-gradient(135deg, #fff5ec 0%, #ffe7d1 100%)",
    chipBg: "#fffaf5",
    chipText: "#c05621",
    buttonBg: "#fb923c",
    buttonHover: "#f97316",
  },
  {
    title: "Accesorios",
    description: "Detalles y complementos para tu outfit.",
    href: "/buscar?q=accesorios",
    image: "/images/home/cat-accesorios.png",
    panel: "linear-gradient(135deg, #effcf6 0%, #dcf8ea 100%)",
    chipBg: "#f8fffb",
    chipText: "#15803d",
    buttonBg: "#34c759",
    buttonHover: "#22c55e",
  },
  {
    title: "Preventa",
    description: "Reserva productos próximos a llegar.",
    href: "/buscar?q=preventa",
    image: "/images/home/cat-preventa.png",
    panel: "linear-gradient(135deg, #fff3f6 0%, #ffdbe8 100%)",
    chipBg: "#fff8fb",
    chipText: "#be185d",
    buttonBg: "#ec4899",
    buttonHover: "#db2777",
  },
];

export default function HomeCategoriesMain() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h2 className="text-[2rem] font-extrabold text-[#16324a] sm:text-[2.2rem]">
          Categorías
        </h2>
        <p className="mt-2 text-[1rem] text-[#4b6b80]">
          Explora nuestras categorías principales y encuentra lo que buscas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.title}
            className="overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white shadow-[0_12px_30px_rgba(20,50,80,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(20,50,80,0.12)]"
          >
            <div className="p-4">
              <div
                className="relative flex h-[170px] items-center justify-center overflow-hidden rounded-[24px] sm:h-[190px]"
                style={{ background: category.panel }}
              >
                <span
                  className="rounded-full px-6 py-3 text-[1.05rem] font-extrabold shadow-sm"
                  style={{
                    backgroundColor: category.chipBg,
                    color: category.chipText,
                  }}
                >
                  {category.title}
                </span>

                {/* Si luego quieres usar imagen real IA, descomenta esto:
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <div className="absolute inset-0 bg-white/20" />
                */}
              </div>
            </div>

            <div className="px-5 pb-6">
              <h3 className="text-[1.85rem] font-extrabold text-[#16324a]">
                {category.title}
              </h3>

              <p className="mt-2 min-h-[56px] text-[1rem] leading-7 text-[#4b6b80]">
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