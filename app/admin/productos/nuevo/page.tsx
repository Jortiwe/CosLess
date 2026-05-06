import AdminBackButton from "../../../../components/admin/AdminBackButton";
import ProductForm from "../../../../components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Crear producto</h1>
            <p className="mt-2 text-[#4b6b80]">
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