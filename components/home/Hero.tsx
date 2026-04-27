export default function Hero() {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#cfeaf6] bg-gradient-to-r from-[#dff4ff] to-[#eef9ff]">
      <div className="grid min-h-[420px] items-center gap-8 px-6 py-12 md:grid-cols-2 md:px-12">
        <div>
          <span className="inline-block rounded-full bg-[#bfefff] px-4 py-1 text-sm font-medium text-[#0e7490]">
            Cosplays, pelucas, lentes y accesorios
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-[#16324a] md:text-6xl">
            Tu tienda de cosplay
            <span className="block text-[#19b7c9]">CosLess</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-[#4b6b80] md:text-lg">
            Encuentra productos en stock y preventa. Arma tu pedido y envíalo
            directamente por WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-semibold text-white">
              Ver categorías
            </button>
            <button className="rounded-2xl border border-[#bfe6f3] bg-white px-6 py-3 text-sm font-semibold text-[#16324a]">
              Ver preventas
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex h-[320px] w-full max-w-[420px] items-center justify-center rounded-3xl border border-dashed border-[#9edff1] bg-white text-center text-[#6d94a8] shadow-sm">
            Banner principal
          </div>
        </div>
      </div>
    </section>
  );
}