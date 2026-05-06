import { notFound } from "next/navigation";
import { connectDB } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import AdminBackButton from "../../../../components/admin/AdminBackButton";
import ProductForm from "../../../../components/admin/ProductForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;

  await connectDB();

  const rawProduct = await Product.findById(productId).lean();

  if (!rawProduct) notFound();

  const product = JSON.parse(JSON.stringify(rawProduct));

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Editar producto</h1>
            <p className="mt-2 text-[#4b6b80]">
              Modifica la información del producto.
            </p>
          </div>

          <AdminBackButton href="/admin/productos" label="Volver a productos" />
        </div>

        <ProductForm mode="edit" product={product} />
      </div>
    </main>
  );
}