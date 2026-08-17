import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Liquidation from "../../../models/Liquidation";
import Product from "../../../models/Product";

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

export async function GET() {
  try {
    await connectDB();

    const liquidations = await Liquidation.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      liquidations: JSON.parse(JSON.stringify(liquidations)),
    });
  } catch (error) {
    console.error("Error obteniendo liquidaciones:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener las liquidaciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await connectDB();

    const product = await Product.findById(body.productId).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    const existing = await Liquidation.findOne({
      productId: product._id,
    }).lean();

    if (existing) {
      return NextResponse.json({
        success: true,
        liquidation: JSON.parse(JSON.stringify(existing)),
      });
    }

    const finalSalePrice = Number(body.finalSalePrice || product.price || 0);
    const productCost = Number(body.productCost || product.costPrice || 0);
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

    const liquidation = await Liquidation.create({
      productId: product._id,
      productTitle: product.title || "Producto",
      productSlug: product.slug || "",
      publishedPrice: Number(product.price || 0),
      finalSalePrice,
      productCost,
      capitalProvider,
      notes: String(body.notes || ""),
      ...calculated,
    });

    return NextResponse.json(
      {
        success: true,
        liquidation: JSON.parse(JSON.stringify(liquidation)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando liquidación:", error);

    return NextResponse.json(
      { error: "No se pudo crear la liquidación." },
      { status: 500 }
    );
  }
}