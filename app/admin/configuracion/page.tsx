import AdminBackButton from "../../../components/admin/AdminBackButton";

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Configuración</h1>
            <p className="mt-2 text-[#4b6b80]">
              Aquí podrás manejar opciones generales del sistema.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-8 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <p className="text-[#4b6b80]">
            En desarrollo: costos de envío, estados, mensajes de WhatsApp,
            parámetros del checkout y opciones del sistema.
          </p>
        </section>
      </div>
    </main>
  );
}