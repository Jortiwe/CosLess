import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import RentalRequestForm from "../../../components/product/RentalRequestForm";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

export const dynamic = "force-dynamic";

export default async function RentalPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  await connectDB();
  const product = await Product.findById(productId).lean();
  if (!product) notFound();
  const pairedIds = Array.isArray(product.pairedProducts) ? product.pairedProducts : [];
  const related = await Product.find({ _id: { $in: pairedIds }, isRentable: true, rentalAvailable: { $ne: false } }).lean();
  const main = JSON.parse(JSON.stringify(product));
  const items = JSON.parse(JSON.stringify(related));
  return <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]"><Header /><section className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8"><Link href={`/producto/${main.slug || ""}`} className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-extrabold text-[var(--text)]">← Volver al producto</Link><h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">Completa tus datos</h1><p className="mt-2 text-[var(--text-soft)]">Luego se abrirá WhatsApp con el reporte de alquiler.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"><div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-6"><RentalRequestForm standalone product={{ _id: String(main._id), title: main.title, rentalPrice: main.rentalPrice, rentalDays: main.rentalDays }} relatedProducts={items.map((item: typeof main) => ({ _id: String(item._id), title: item.title, rentalPrice: item.rentalPrice, rentalDays: item.rentalDays, mainImage: item.mainImage }))} /></div><aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-6"><h2 className="text-2xl font-extrabold">Resumen del alquiler</h2><div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--surface-soft)] p-3"><img src={main.mainImage || "/placeholder-product.png"} alt={main.title} className="h-20 w-20 rounded-xl object-cover" /><div><p className="font-extrabold">{main.title}</p><p className="font-bold text-[#5661c9]">Bs{Number(main.rentalPrice || 0).toFixed(2)}</p></div></div>{items.length > 0 && <p className="mt-5 text-sm font-bold text-[#5661c9]">Puedes añadir los productos del conjunto desde el formulario.</p>}</aside></div></section><Footer /></main>;
}
