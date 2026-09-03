import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { writeAudit } from "../../../../lib/audit";
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

    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Producto no encontrado: ${item.title}`);

    const stock = Number(product.stock || 0);
    if (stock < quantity) {
      throw new Error(`Stock insuficiente para ${item.title}. Stock actual: ${stock}`);
    }

    let lots = Array.isArray(product.inventoryLots)
      ? product.inventoryLots
      : [];

    // Compatibilidad automática con inventario anterior a los lotes.
    if (lots.length === 0 && stock > 0) {
      product.inventoryLots = [{
        quantity: stock,
        remaining: stock,
        costPrice: Number(product.costPrice || 0),
        receivedAt: product.createdAt || new Date(),
      }];
      lots = product.inventoryLots;
    }

    let pending = quantity;
    const allocations: Array<{ lotId: string; quantity: number; costPrice: number }> = [];

    for (const lot of lots) {
      if (pending <= 0) break;

      const available = Number(lot.remaining || 0);
      if (available <= 0) continue;

      const used = Math.min(available, pending);
      lot.remaining = available - used;
      pending -= used;
      allocations.push({
        lotId: String(lot._id || ""),
        quantity: used,
        costPrice: Number(lot.costPrice || 0),
      });
    }

    // Nunca debería ocurrir, pero protege datos antiguos con stock inconsistente.
    if (pending > 0) {
      throw new Error(`No se pudo asignar el lote de inventario para ${item.title}.`);
    }

    const inventoryCost = allocations.reduce(
      (total, allocation) => total + allocation.quantity * allocation.costPrice,
      0
    );

    item.inventoryAllocations = allocations;
    item.inventoryCost = inventoryCost;
    product.stock = stock - quantity;
    product.lastSoldUnitCost = inventoryCost / quantity;

    if (Number(product.stock || 0) <= 0) {
      product.isOffer = false;
      product.isWeeklyNew = false;
    }

    await product.save();
  }

  order.inventoryDeducted = true;
  order.markModified("items");
}

async function restoreInventory(order: any) {
  for (const item of order.items || []) {
    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) continue;

    const product = await Product.findById(item.productId);
    if (!product) continue;

    const allocations = Array.isArray(item.inventoryAllocations)
      ? item.inventoryAllocations
      : [];

    if (allocations.length > 0) {
      const lots = Array.isArray(product.inventoryLots)
        ? product.inventoryLots
        : [];

      for (const allocation of allocations) {
        const restoredQuantity = Number(allocation.quantity || 0);
        if (restoredQuantity <= 0) continue;

        const lot = lots.find(
          (candidate: any) => String(candidate._id || "") === String(allocation.lotId || "")
        );

        if (lot) {
          lot.remaining = Number(lot.remaining || 0) + restoredQuantity;
        } else {
          lots.push({
            quantity: restoredQuantity,
            remaining: restoredQuantity,
            costPrice: Number(allocation.costPrice || product.costPrice || 0),
            receivedAt: new Date(),
          });
        }
      }

      product.inventoryLots = lots;
    } else {
      // Pedidos antiguos que no tienen asignación de lote.
      product.inventoryLots = Array.isArray(product.inventoryLots)
        ? product.inventoryLots
        : [];
      if (product.inventoryLots.length === 0) {
        product.inventoryLots.push({
          quantity,
          remaining: quantity,
          costPrice: Number(product.costPrice || 0),
          receivedAt: new Date(),
        });
      } else {
        product.inventoryLots[0].remaining = Number(product.inventoryLots[0].remaining || 0) + quantity;
      }
    }

    product.stock = Number(product.stock || 0) + quantity;
    item.inventoryAllocations = [];
    item.inventoryCost = 0;
    await product.save();
  }

  order.inventoryDeducted = false;
  order.markModified("items");
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

    await writeAudit({
      action: "Estado de pedido actualizado",
      entityType: "pedido",
      entityId: String(order._id),
      entityName: order.orderCode,
      actor: "Administrador",
      details: `Estado: ${previousStatus} → ${nextStatus}.`,
    });

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
