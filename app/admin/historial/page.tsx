import { connectDB } from "../../../lib/mongodb";
import AuditLog from "../../../models/AuditLog";
import AdminHistoryClient from "../../../components/admin/AdminHistoryClient";
export const dynamic = "force-dynamic";
export default async function AdminHistoryPage() { await connectDB(); const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500).lean(); return <AdminHistoryClient initialLogs={JSON.parse(JSON.stringify(logs))} />; }
