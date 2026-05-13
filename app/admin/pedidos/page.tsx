import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import AdminOrdersClient from "../../../components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic";

type OrderItem = {
  _id: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  total?: number;
  status?: string;
  inventoryDeducted?: boolean;
  createdAt?: string | Date;
};

export default async function AdminOrdersPage() {
  await connectDB();

  const rawOrders = await Order.find().sort({ createdAt: -1 }).lean();
  const orders = JSON.parse(JSON.stringify(rawOrders)) as OrderItem[];

  return <AdminOrdersClient orders={orders} />;
}