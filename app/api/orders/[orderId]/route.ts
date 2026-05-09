import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";

const validStatuses = [
  "pending",
  "contacted",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const STOCK_DEDUCT_STATUSES = ["paid", "preparing", "shipped", "delivered"];

function statusShouldHaveStockDeducted(status?: string) {
  return STOCK_DEDUCT_STATUSES.includes(String(status || ""));
}

function orderAlreadyDeducted(order: any) {
  return Boolean(order.inventoryDeducted);
}

async function deductInventory(order: any) {
  for (const item of order.items || []) {
    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) continue;

    await Product.findByIdAndUpdate(item.productId, {
      $inc: {
        stock: -quantity,
      },
    });
  }

  order.inventoryDeducted = true;
}

async function restoreInventory(order: any) {
  for (const item of order.items || []) {
    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) continue;

    await Product.findByIdAndUpdate(item.productId, {
      $inc: {
        stock: quantity,
      },
    });
  }

  order.inventoryDeducted = false;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    await connectDB();

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: JSON.parse(JSON.stringify(order)),
    });
  } catch (error) {
    console.error("Error obteniendo pedido:", error);

    return NextResponse.json(
      {
        error: "No se pudo obtener el pedido.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

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

    const previousStatus = String(order.status || "pending");
    const nextStatus = String(body.status || previousStatus);

    if (!validStatuses.includes(nextStatus)) {
      return NextResponse.json(
        { error: "Estado de pedido inválido." },
        { status: 400 }
      );
    }

    const wasDeducted = orderAlreadyDeducted(order);
    const nextShouldDeduct = statusShouldHaveStockDeducted(nextStatus);
    const nextShouldRestore = !nextShouldDeduct || nextStatus === "cancelled";

    /*
      Si pasa de pendiente/contactado/cancelado a:
      paid / preparing / shipped / delivered
      recién ahí se descuenta stock.

      IMPORTANTE:
      Preventa también usa stock.
      Ya no se ignora el stock por ser preventa.
    */
    if (nextShouldDeduct && !wasDeducted) {
      for (const item of order.items || []) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return NextResponse.json(
            { error: `Producto no encontrado: ${item.title}` },
            { status: 404 }
          );
        }

        const currentStock = Number(product.stock || 0);
        const requestedQuantity = Number(item.quantity || 0);

        if (currentStock < requestedQuantity) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${item.title}. Stock actual: ${currentStock}`,
            },
            { status: 400 }
          );
        }
      }

      await deductInventory(order);
    }

    /*
      Si vuelve de pagado/preparando/enviado/entregado a:
      pending / contacted / cancelled
      se devuelve el stock.
    */
    if (nextShouldRestore && wasDeducted) {
      await restoreInventory(order);
    }

    order.status = nextStatus;

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
      {
        error: "No se pudo actualizar el pedido.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    await connectDB();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    const wasDeducted = orderAlreadyDeducted(order);

    /*
      Si el pedido ya había descontado stock,
      al eliminarlo se devuelve el stock.
      Así queda como si ese movimiento nunca hubiera existido.
    */
    if (wasDeducted) {
      await restoreInventory(order);
    }

    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({
      success: true,
      message: "Pedido eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando pedido:", error);

    return NextResponse.json(
      {
        error: "No se pudo eliminar el pedido.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}