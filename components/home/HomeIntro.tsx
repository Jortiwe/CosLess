import Image from "next/image";
import {
  FiMessageCircle,
  FiPackage,
  FiRepeat,
  FiTruck,
} from "react-icons/fi";
import { COSLESS_IMAGES } from "../../lib/coslessImages";

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
    title: "Alquiler",
    text: "Consulta disponibilidad.",
  },
];

export default function HomeIntro() {
  return (
    <section className="relative isolate mt-12 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface)_0%,var(--surface)_62%,var(--surface-soft)_100%)] px-5 py-7 shadow-[0_12px_30px_var(--shadow)] sm:px-8 sm:py-8 lg:px-10 xl:px-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[var(--primary-light)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-[var(--cos-soft)]/18 blur-3xl" />

      {/* Yui izquierda desktop */}
      <div className="pointer-events-none absolute bottom-2 left-4 z-0 hidden lg:block xl:left-6 2xl:left-8">
        <div className="absolute bottom-6 left-1/2 h-[140px] w-[120px] -translate-x-1/2 rounded-full bg-[var(--primary-light)]/10 blur-2xl" />

        <Image
          src={COSLESS_IMAGES.characters.yui}
          alt=""
          aria-hidden="true"
          width={260}
          height={390}
          className="relative w-[118px] -scale-x-100 select-none object-contain opacity-95 drop-shadow-[0_18px_28px_rgba(16,38,90,0.16)] xl:w-[132px] 2xl:w-[142px]"
        />
      </div>

      {/* Aoi derecha desktop */}
      <div className="pointer-events-none absolute bottom-2 right-4 z-0 hidden lg:block xl:right-6 2xl:right-8">
        <div className="absolute bottom-6 left-1/2 h-[140px] w-[120px] -translate-x-1/2 rounded-full bg-[var(--primary-light)]/10 blur-2xl" />

        <Image
          src={COSLESS_IMAGES.characters.aoi}
          alt=""
          aria-hidden="true"
          width={260}
          height={390}
          className="relative w-[122px] select-none object-contain opacity-95 drop-shadow-[0_18px_28px_rgba(16,38,90,0.16)] xl:w-[136px] 2xl:w-[146px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] lg:px-[120px] xl:px-[135px] 2xl:px-[145px]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--primary)] shadow-sm">
            CosLess Bolivia
          </span>

          <div className="relative mx-auto mt-4 max-w-[310px] sm:max-w-4xl">
            {/* Yui móvil al lado izquierdo del título */}
            <Image
              src={COSLESS_IMAGES.characters.yui}
              alt=""
              aria-hidden="true"
              width={120}
              height={180}
              className="pointer-events-none absolute -left-2 top-1/2 z-0 w-[46px] -translate-y-1/2 -scale-x-100 select-none object-contain opacity-80 drop-shadow-[0_12px_18px_rgba(16,38,90,0.14)] sm:-left-4 sm:w-[68px] md:w-[82px] lg:hidden"
            />

            {/* Aoi móvil al lado derecho del título */}
            <Image
              src={COSLESS_IMAGES.characters.aoi}
              alt=""
              aria-hidden="true"
              width={120}
              height={180}
              className="pointer-events-none absolute -right-2 top-1/2 z-0 w-[48px] -translate-y-1/2 select-none object-contain opacity-80 drop-shadow-[0_12px_18px_rgba(16,38,90,0.14)] sm:-right-4 sm:w-[70px] md:w-[84px] lg:hidden"
            />

            <h2 className="relative z-10 mx-auto max-w-[235px] text-[1.85rem] font-extrabold leading-tight tracking-tight text-[var(--text)] sm:max-w-3xl sm:text-[2.35rem] lg:text-[2.65rem]">
              Tienda online de cosplay en Cochabamba
            </h2>
          </div>

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
            Atención rápida para cosplays, pelucas, lentes, accesorios,
            preventas y alquiler.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {infoItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-4 sm:px-5 sm:py-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)] shadow-sm">
                  <Icon className="text-[1rem]" />
                </div>

                <h3 className="text-[0.92rem] font-extrabold leading-tight text-[var(--text)] sm:text-[1rem]">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
