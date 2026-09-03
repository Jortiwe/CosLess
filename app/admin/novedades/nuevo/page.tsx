import AdminBackButton from "../../../../components/admin/AdminBackButton";
import NewsForm from "../../../../components/admin/NewsForm";

export default function NewNewsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-8 text-[var(--text)] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)]">
              Crear novedad
            </h1>
            <p className="mt-2 text-[var(--text-soft)]">
              Agrega una noticia o actualización para los clientes.
            </p>
          </div>

          <AdminBackButton href="/admin/novedades" label="Volver a novedades" />
        </div>

        <NewsForm mode="create" />
      </div>
    </main>
  );
}