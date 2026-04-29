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
    <section className="mt-8 rounded-[28px] border border-[#cfeaf6] bg-white px-5 py-7 shadow-[0_12px_30px_rgba(22,50,74,0.05)] sm:px-8 sm:py-9 lg:px-10">
      <div className="max-w-5xl">
        <h2 className="font-serif text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[#16324a] sm:text-[2.6rem] lg:text-[3.15rem]">
          Tienda online de cosplay en Cochabamba
        </h2>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {infoItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[18px] border border-[#e5f3fa] bg-[#f9fdff] px-3 py-4 sm:rounded-[20px] sm:px-4"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#19b7c9] shadow-sm">
                <Icon className="text-[1rem]" />
              </div>

              <h3 className="text-[0.9rem] font-extrabold leading-tight text-[#16324a] sm:text-[1rem]">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#5f7f93] sm:text-sm">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}