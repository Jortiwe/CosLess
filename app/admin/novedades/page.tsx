import { connectDB } from "../../../lib/mongodb";
import News from "../../../models/News";
import AdminNewsClient from "../../../components/admin/AdminNewsClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

type NewsItem = {
  _id: string;
  title?: string;
  slug?: string;
  summary?: string;
  image?: string;
  isPublished?: boolean;
  createdAt?: string | Date;
};

export default async function AdminNewsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params?.page || 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  await connectDB();

  const [rawNews, total] = await Promise.all([
    News.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    News.countDocuments(),
  ]);

  const news = JSON.parse(JSON.stringify(rawNews)) as NewsItem[];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminNewsClient
      news={news}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}