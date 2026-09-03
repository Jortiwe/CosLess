import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import User from "../../../../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

type TokenPayload = {
  userId?: string;
  id?: string;
  _id?: string;
  sub?: string;
  email?: string;
  user?: {
    id?: string;
    _id?: string;
    userId?: string;
    email?: string;
  };
};

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cosless_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    const tokenEmail = String(decoded.email || decoded.user?.email || "")
      .toLowerCase()
      .trim();

    const possibleUserId =
      decoded.userId ||
      decoded.id ||
      decoded._id ||
      decoded.user?.userId ||
      decoded.user?.id ||
      decoded.user?._id ||
      "";

    await connectDB();

    if (possibleUserId) {
      const user = await User.findById(possibleUserId)
        .select("_id email")
        .lean();

      if (user) {
        return {
          userId: String(user._id),
          email: String(user.email || tokenEmail).toLowerCase().trim(),
        };
      }
    }

    if (tokenEmail) {
      const user = await User.findOne({ email: tokenEmail })
        .select("_id email")
        .lean();

      if (user) {
        return {
          userId: String(user._id),
          email: String(user.email || tokenEmail).toLowerCase().trim(),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        {
          success: false,
          sessionUser: null,
          orders: [],
          error: "No hay sesión activa.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const filters: Record<string, unknown>[] = [];

    if (sessionUser.userId) {
      filters.push({ userId: sessionUser.userId });
    }

    if (sessionUser.email) {
      filters.push({ accountEmail: sessionUser.email });
    }

    // Respaldo para pedidos antiguos.
    if (sessionUser.email) {
      filters.push({ customerEmail: sessionUser.email });
    }

    const rawOrders = await Order.find(
      filters.length > 0 ? { $or: filters } : { _id: null }
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      sessionUser,
      filters,
      count: rawOrders.length,
      orders: JSON.parse(JSON.stringify(rawOrders)),
    });
  } catch (error) {
    console.error("Error obteniendo historial del cliente:", error);

    return NextResponse.json(
      {
        success: false,
        sessionUser: null,
        orders: [],
        error: "No se pudo obtener el historial de pedidos.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}