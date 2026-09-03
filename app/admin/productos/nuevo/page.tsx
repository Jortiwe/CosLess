import AdminBackButton from "../../../../components/admin/AdminBackButton";
import ProductForm from "../../../../components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto min-w-0 max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)]">
              Crear producto
            </h1>
            <p className="mt-2 text-[var(--text-soft)]">
              Agrega un nuevo producto a la tienda.
            </p>
          </div>

          <AdminBackButton href="/admin/productos" label="Volver a productos" />
        </div>

        <ProductForm mode="create" />
      </div>
    </main>
  );
}
