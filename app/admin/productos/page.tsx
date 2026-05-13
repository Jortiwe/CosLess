import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import AdminProductsClient from "../../../components/admin/AdminProductsClient";

export const dynamic = "force-dynamic";

type ProductItem = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  isActive?: boolean;
  isOffer?: boolean;
  isWeeklyNew?: boolean;
  isFeatured?: boolean;
};

export default async function AdminProductsPage() {
  await connectDB();

  const rawProducts = await Product.find().sort({ createdAt: -1 }).lean();
  const products = JSON.parse(JSON.stringify(rawProducts)) as ProductItem[];

  return <AdminProductsClient products={products} />;
}