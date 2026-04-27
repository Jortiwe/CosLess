import AdminBackButton from "../../../components/admin/AdminBackButton";

export default function AdminStatsPage() {
  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Estadísticas</h1>
            <p className="mt-2 text-[#4b6b80]">
              Aquí luego pondremos métricas reales del sistema.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-8 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <p className="text-[#4b6b80]">
            En desarrollo: productos más vendidos, pedidos por estado,
            favoritos más guardados, totales por fechas, etc.
          </p>
        </section>
      </div>
    </main>
  );
}