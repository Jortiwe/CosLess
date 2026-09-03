import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { writeAudit } from "../../../../lib/audit";
import Liquidation from "../../../../models/Liquidation";

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateLiquidation(data: {
  finalSalePrice: number;
  productCost: number;
  capitalProvider: "admin1" | "admin2";
  paidToAdmin1: number;
  paidToAdmin2: number;
}) {
  const finalSalePrice = Number(data.finalSalePrice || 0);
  const productCost = Number(data.productCost || 0);
  const paidToAdmin1 = Number(data.paidToAdmin1 || 0);
  const paidToAdmin2 = Number(data.paidToAdmin2 || 0);

  const netProfit = roundMoney(finalSalePrice - productCost);
  const distributableProfit = Math.max(netProfit, 0);

  const admin1Percentage = data.capitalProvider === "admin1" ? 70 : 30;
  const admin2Percentage = data.capitalProvider === "admin2" ? 70 : 30;

  const admin1Profit = roundMoney(distributableProfit * (admin1Percentage / 100));
  const admin2Profit = roundMoney(distributableProfit * (admin2Percentage / 100));

  const admin1CapitalReturn =
    data.capitalProvider === "admin1" ? productCost : 0;

  const admin2CapitalReturn =
    data.capitalProvider === "admin2" ? productCost : 0;

  const admin1Amount = roundMoney(admin1CapitalReturn + admin1Profit);
  const admin2Amount = roundMoney(admin2CapitalReturn + admin2Profit);

  const balanceAdmin1 = roundMoney(Math.max(admin1Amount - paidToAdmin1, 0));
  const balanceAdmin2 = roundMoney(Math.max(admin2Amount - paidToAdmin2, 0));

  const status =
    balanceAdmin1 === 0 && balanceAdmin2 === 0
      ? "liquidado"
      : paidToAdmin1 > 0 || paidToAdmin2 > 0
      ? "parcial"
      : "pendiente";

  return {
    netProfit,
    admin1Percentage,
    admin2Percentage,
    admin1Amount,
    admin2Amount,
    paidToAdmin1,
    paidToAdmin2,
    balanceAdmin1,
    balanceAdmin2,
    status,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ liquidationId: string }> }
) {
  try {
    const { liquidationId } = await params;
    const body = await request.json();

    await connectDB();

    const liquidation = await Liquidation.findById(liquidationId);

    if (!liquidation) {
      return NextResponse.json(
        { error: "Liquidación no encontrada." },
        { status: 404 }
      );
    }

    const finalSalePrice = Number(
      body.finalSalePrice ?? liquidation.finalSalePrice ?? 0
    );

    const productCost = Number(body.productCost ?? liquidation.productCost ?? 0);

    const capitalProvider =
      body.capitalProvider === "admin2" ? "admin2" : "admin1";

    const paidToAdmin1 = Number(body.paidToAdmin1 || 0);
    const paidToAdmin2 = Number(body.paidToAdmin2 || 0);

    const calculated = calculateLiquidation({
      finalSalePrice,
      productCost,
      capitalProvider,
      paidToAdmin1,
      paidToAdmin2,
    });

    liquidation.finalSalePrice = finalSalePrice;
    liquidation.productCost = productCost;
    liquidation.capitalProvider = capitalProvider;
    liquidation.notes = String(body.notes || "");
    liquidation.set(calculated);

    await liquidation.save();

    await writeAudit({
      action: "Pago actualizado",
      entityType: "pago",
      entityId: String(liquidation._id),
      entityName: liquidation.productTitle,
      actor: "Administrador",
      details: `Venta: Bs${liquidation.finalSalePrice}. Costo: Bs${liquidation.productCost}.`,
    });

    return NextResponse.json({
      success: true,
      liquidation: JSON.parse(JSON.stringify(liquidation)),
    });
  } catch (error) {
    console.error("Error actualizando liquidación:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar la liquidación." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ liquidationId: string }> }
) {
  try {
    const { liquidationId } = await params;

    await connectDB();

    await Liquidation.findByIdAndDelete(liquidationId);

    return NextResponse.json({
      success: true,
      message: "Liquidación eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando liquidación:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar la liquidación." },
      { status: 500 }
    );
  }
}
