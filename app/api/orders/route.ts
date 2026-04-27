import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Product from "../../../models/Product";

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
Ciudad/Zona: ${order.shippingCity || "-"} ${order.shippingZone ? `/ ${order.shippingZone}` : ""}
Tipo de entrega: ${order.shippingType}

Productos:
${itemsText}

Subtotal: Bs${order.subtotal}
Envío: Bs${order.shippingCost}
Total: Bs${order.total}`;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      userId = null,
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

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const orderItems = items.map(
      (item: { productId: string; quantity: number }) => {
        const product = products.find(
          (p) => String(p._id) === String(item.productId)
        );

        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        return {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
          mainImage: product.mainImage,
        };
      }
    );

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const total = subtotal + Number(shippingCost);

    const orderCode = generateOrderCode();

    const whatsappMessage = buildWhatsAppMessage({
      orderCode,
      customerName,
      customerPhone,
      customerEmail,
      shippingDepartment,
      shippingCity,
      shippingZone,
      shippingType,
      shippingCost,
      items: orderItems,
      subtotal,
      total,
    });

    const order = await Order.create({
      orderCode,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingDepartment,
      shippingCity,
      shippingZone,
      shippingType,
      shippingCost,
      paymentMethod: "whatsapp",
      items: orderItems,
      subtotal,
      total,
      status: "pending",
      whatsappMessage,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        order,
        whatsappMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando pedido:", error);

    return NextResponse.json(
      {
        error: "No se pudo crear el pedido.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}