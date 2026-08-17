import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import Liquidation from "../../../models/Liquidation";
import AdminPaymentsClient from "../../../components/admin/AdminPaymentsClient";

export const dynamic = "force-dynamic";

type PaymentProduct = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  mainImage?: string;
};

type PaymentLiquidation = {
  _id: string;
  productId: string;
  productTitle: string;
  productSlug?: string;
  publishedPrice: number;
  finalSalePrice: number;
  productCost: number;
  capitalProvider: "admin1" | "admin2";
  admin1Percentage: number;
  admin2Percentage: number;
  netProfit: number;
  admin1Amount: number;
  admin2Amount: number;
  paidToAdmin1: number;
  paidToAdmin2: number;
  balanceAdmin1: number;
  balanceAdmin2: number;
  status: "pendiente" | "parcial" | "liquidado";
  notes?: string;
};

export default async function AdminPaymentsPage() {
  await connectDB();

  const [rawProducts, rawLiquidations] = await Promise.all([
    Product.find({
      stock: { $lte: 0 },
    })
      .sort({ updatedAt: -1 })
      .lean(),
    Liquidation.find().sort({ updatedAt: -1 }).lean(),
  ]);

  const products = JSON.parse(JSON.stringify(rawProducts)) as PaymentProduct[];
  const liquidations = JSON.parse(
    JSON.stringify(rawLiquidations)
  ) as PaymentLiquidation[];

  return (
    <AdminPaymentsClient products={products} liquidations={liquidations} />
  );
}