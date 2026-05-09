import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import User from "../../../models/User";

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

function generateOrderCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `COS-${random}`;
}

function buildWhatsAppMessage(order: {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingDepartment: string;
  shippingCity?: string;
  shippingZone?: string;
  shippingType: string;
  shippingCost: number;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
}) {
  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.title} x${item.quantity} — Bs${item.price * item.quantity}`
    )
    .join("\n");

  return `Hola, quiero consultar sobre el pedido ${order.orderCode}

Nombre: ${order.customerName}
Teléfono: ${order.customerPhone}
Correo: ${order.customerEmail || "No especificado"}

Departamento: ${order.shippingDepartment}
Ciudad/Zona: ${order.shippingCity || "-"} ${
    order.shippingZone ? `/ ${order.shippingZone}` : ""
  }
Tipo de entrega: ${order.shippingType}

Productos:
${itemsText}

Subtotal: Bs${order.subtotal}
Envío: Bs${order.shippingCost}
Total: Bs${order.total}`;
}

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
    });
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los pedidos.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();

    const body = await request.json();

    const {
      customerName,
      customerEmail = "",
      customerPhone,
      shippingDepartment,
      shippingCity = "",
      shippingZone = "",
      shippingType = "por_coordinar",
      shippingCost = 0,
      items = [],
      notes = "",
    } = body;

    if (!customerName || !customerPhone || !shippingDepartment) {
      return NextResponse.json(
        { error: "Faltan datos del cliente o del envío." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El pedido no tiene productos." },
        { status: 400 }
      );
    }

    const normalizedItems = items.map(
      (item: { productId: string; quantity: number }) => ({
        productId: String(item.productId),
        quantity: Math.max(1, Number(item.quantity || 1)),
      })
    );

    const productIds = normalizedItems.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const orderItems = normalizedItems.map((item) => {
      const product = products.find(
        (p) => String(p._id) === String(item.productId)
      );

      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      const currentStock = Number(product.stock || 0);

if (currentStock < item.quantity) {
  throw new Error(
    `Stock insuficiente para ${product.title}. Stock actual: ${currentStock}`
  );
}

      return {
        productId: product._id,
        title: product.title,
        price: Number(product.price || 0),
        quantity: item.quantity,
        mainImage: product.mainImage || "/placeholder-product.png",
      };
    });

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const total = subtotal + Number(shippingCost || 0);
    const orderCode = generateOrderCode();

    const cleanCustomerEmail = String(customerEmail || "")
      .toLowerCase()
      .trim();

    const accountEmail = String(sessionUser?.email || "")
      .toLowerCase()
      .trim();

    const whatsappMessage = buildWhatsAppMessage({
      orderCode,
      customerName,
      customerPhone,
      customerEmail: cleanCustomerEmail,
      shippingDepartment,
      shippingCity,
      shippingZone,
      shippingType,
      shippingCost: Number(shippingCost || 0),
      items: orderItems,
      subtotal,
      total,
    });

    const order = await Order.create({
      orderCode,

      userId: sessionUser?.userId || null,
      accountEmail,

      customerName,
      customerEmail: cleanCustomerEmail,
      customerPhone,
      shippingDepartment,
      shippingCity,
      shippingZone,
      shippingType,
      shippingCost: Number(shippingCost || 0),
      paymentMethod: "whatsapp",
      items: orderItems,
      subtotal,
      total,
      status: "pending",
      inventoryDeducted: false,
      whatsappMessage,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        order: JSON.parse(JSON.stringify(order)),
        whatsappMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando pedido:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear el pedido.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}