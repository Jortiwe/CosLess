import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import AuditLog from "../../../models/AuditLog";

export async function GET(request: Request) {
  try {
    await connectDB();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toLowerCase() || "";
    const from = params.get("from");
    const to = params.get("to");
    const filter: Record<string, unknown> = {};
    if (q) filter.searchText = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) createdAt.$gte = new Date(`${from}T00:00:00`);
      if (to) createdAt.$lte = new Date(`${to}T23:59:59.999`);
      filter.createdAt = createdAt;
    }
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({ logs: JSON.parse(JSON.stringify(logs)) });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener el historial." }, { status: 500 });
  }
}
