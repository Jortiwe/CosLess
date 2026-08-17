import {
  FiMessageCircle,
  FiPackage,
  FiRepeat,
  FiTruck,
} from "react-icons/fi";

const infoItems = [
  {
    icon: FiMessageCircle,
    title: "WhatsApp",
    text: "Cotizaciones directas.",
  },
  {
    icon: FiTruck,
    title: "Envíos nacionales",
    text: "Dentro de Bolivia.",
  },
  {
    icon: FiPackage,
    title: "Stock y preventa",
    text: "Disponible y bajo pedido.",
  },
  {
    icon: FiRepeat,
    title: "Renta",
    text: "Consulta disponibilidad.",
  },
];

export default function HomeIntro() {
  return (
    <section className="mt-12 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-5 py-7 shadow-[0_12px_30px_var(--shadow)] sm:px-8 sm:py-9 lg:px-10">
      <div className="max-w-5xl">
        <h2 className="text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--text)] sm:text-[2.45rem] lg:text-[2.8rem]">
          Tienda online de cosplay en Cochabamba
        </h2>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {infoItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-4 sm:rounded-[20px] sm:px-4"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)] shadow-sm">
                <Icon className="text-[1rem]" />
              </div>

              <h3 className="text-[0.9rem] font-extrabold leading-tight text-[var(--text)] sm:text-[1rem]">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}