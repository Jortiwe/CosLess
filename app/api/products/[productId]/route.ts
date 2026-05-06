import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();

    await connectDB();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    product.title = body.title;
    product.slug = body.slug;
    product.category = body.category;
    product.status = body.status;
    product.price = Number(body.price || 0);
    product.oldPrice = Number(body.oldPrice || 0);
    product.stock = Number(body.stock || 0);
    product.mainImage = body.mainImage;
    product.images = body.images || [];
    product.description = body.description || "";
    product.isFeatured = Boolean(body.isFeatured);
    product.isOffer = Boolean(body.isOffer);
    product.isWeeklyNew = Boolean(body.isWeeklyNew);
    product.isActive = body.isActive !== false;

    await product.save();

    return NextResponse.json({
      success: true,
      product: JSON.parse(JSON.stringify(product)),
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el producto." },
      { status: 500 }
    );
  }
}