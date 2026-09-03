import AdminBackButton from "../../../components/admin/AdminBackButton";

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-8 text-[var(--text)] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)]">
              Configuración
            </h1>
            <p className="mt-2 text-[var(--text-soft)]">
              Aquí podrás manejar opciones generales del sistema.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_10px_30px_var(--shadow)]">
          <p className="text-[var(--text-soft)]">
            En desarrollo: costos de envío, estados, mensajes de WhatsApp,
            parámetros del checkout y opciones del sistema.
          </p>
        </section>
      </div>
    </main>
  );
}