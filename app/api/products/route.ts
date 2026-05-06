import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      products: JSON.parse(JSON.stringify(products)),
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener los productos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await connectDB();

    const product = await Product.create({
      title: body.title,
      slug: body.slug,
      category: body.category,
      status: body.status,
      price: Number(body.price || 0),
      oldPrice: Number(body.oldPrice || 0),
      stock: Number(body.stock || 0),
      mainImage: body.mainImage,
      images: body.images || [],
      description: body.description || "",
      isFeatured: Boolean(body.isFeatured),
      isOffer: Boolean(body.isOffer),
      isWeeklyNew: Boolean(body.isWeeklyNew),
      isActive: body.isActive !== false,
    });

    return NextResponse.json(
      {
        success: true,
        product: JSON.parse(JSON.stringify(product)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando producto:", error);

    return NextResponse.json(
      { error: "No se pudo crear el producto." },
      { status: 500 }
    );
  }
}