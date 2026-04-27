import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";

const validStatuses = [
  "pending",
  "contacted",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    await connectDB();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    if (body.status && validStatuses.includes(body.status)) {
      order.status = body.status;
    }

    if (typeof body.notes === "string") {
      order.notes = body.notes;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      order: JSON.parse(JSON.stringify(order)),
    });
  } catch (error) {
    console.error("Error actualizando pedido:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el pedido." },
      { status: 500 }
    );
  }
}