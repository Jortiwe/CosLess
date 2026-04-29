import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/mongodb";
import AccountStore from "../../../../models/AccountStore";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

type TokenPayload = {
  userId?: string;
  email?: string;
  role?: string;
  nickname?: string;
  fullName?: string;
};

function cleanCartItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item?.productId)
    .map((item) => ({
      productId: String(item.productId),
      title: String(item.title || "Producto"),
      price: Number(item.price || 0),
      quantity: Math.max(1, Number(item.quantity || 1)),
      mainImage: String(item.mainImage || ""),
      slug: String(item.slug || ""),
    }));
}

function cleanFavoriteItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item?.productId)
    .map((item) => ({
      productId: String(item.productId),
      title: String(item.title || "Producto"),
      price: Number(item.price || 0),
      mainImage: String(item.mainImage || ""),
      slug: String(item.slug || ""),
      category: String(item.category || ""),
      status: String(item.status || "stock"),
    }));
}

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cosless_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (!decoded?.userId || !decoded?.email) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
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
          error: "No hay sesión activa.",
          cart: [],
          favorites: [],
        },
        { status: 401 }
      );
    }

    await connectDB();

    let store = await AccountStore.findOne({
      userId: sessionUser.userId,
    }).lean();

    if (!store) {
      const created = await AccountStore.create({
        userId: sessionUser.userId,
        email: sessionUser.email,
        cart: [],
        favorites: [],
      });

      store = JSON.parse(JSON.stringify(created));
    }

    return NextResponse.json({
      success: true,
      cart: store.cart || [],
      favorites: store.favorites || [],
    });
  } catch (error) {
    console.error("Error leyendo store de cuenta:", error);

    return NextResponse.json(
      {
        error: "No se pudo leer la información de la cuenta.",
        cart: [],
        favorites: [],
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: "No hay sesión activa." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const cart = cleanCartItems(body.cart || []);
    const favorites = cleanFavoriteItems(body.favorites || []);

    await connectDB();

    const store = await AccountStore.findOneAndUpdate(
      { userId: sessionUser.userId },
      {
        $set: {
          userId: sessionUser.userId,
          email: sessionUser.email,
          cart,
          favorites,
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      cart: store?.cart || cart,
      favorites: store?.favorites || favorites,
    });
  } catch (error) {
    console.error("Error guardando store de cuenta:", error);

    return NextResponse.json(
      { error: "No se pudo guardar la información de la cuenta." },
      { status: 500 }
    );
  }
}