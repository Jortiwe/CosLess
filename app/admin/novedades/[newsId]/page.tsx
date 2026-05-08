import { notFound } from "next/navigation";
import { connectDB } from "../../../../lib/mongodb";
import News from "../../../../models/News";
import AdminBackButton from "../../../../components/admin/AdminBackButton";
import NewsForm from "../../../../components/admin/NewsForm";

type PageProps = {
  params: Promise<{
    newsId: string;
  }>;
};

export default async function EditNewsPage({ params }: PageProps) {
  const { newsId } = await params;

  await connectDB();

  const rawNews = await News.findById(newsId).lean();

  if (!rawNews) notFound();

  const news = JSON.parse(JSON.stringify(rawNews));

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Editar novedad</h1>
            <p className="mt-2 text-[#4b6b80]">
              Modifica la información de la novedad.
            </p>
          </div>

          <AdminBackButton href="/admin/novedades" label="Volver a novedades" />
        </div>

        <NewsForm mode="edit" news={news} />
      </div>
    </main>
  );
}