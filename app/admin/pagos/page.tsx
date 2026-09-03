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
  lastSoldUnitCost?: number;
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

  const products = (JSON.parse(JSON.stringify(rawProducts)) as PaymentProduct[]).map(
    (product) => ({
      ...product,
      // El costo sugerido corresponde a la unidad que realmente salió del
      // lote FIFO; se puede ajustar manualmente si la venta tuvo un caso especial.
      costPrice:
        Number(product.lastSoldUnitCost || 0) > 0
          ? Number(product.lastSoldUnitCost)
          : Number(product.costPrice || 0),
    })
  );
  const liquidations = JSON.parse(
    JSON.stringify(rawLiquidations)
  ) as PaymentLiquidation[];

  return (
    <AdminPaymentsClient products={products} liquidations={liquidations} />
  );
}
