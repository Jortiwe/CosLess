import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Product from "../../../../models/Product";

function cleanImage(value: unknown) {
  const image = String(value || "").trim();

  if (!image) {
    return "/placeholder-product.png";
  }

  return image;
}

function cleanCategory(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function cleanCategories(value: unknown, fallbackCategory: string) {
  const receivedCategories = Array.isArray(value) ? value : [];

  const categories = receivedCategories
    .map((item) => cleanCategory(item))
    .filter(Boolean);

  if (fallbackCategory) {
    categories.unshift(fallbackCategory);
  }

  return Array.from(new Set(categories));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    await connectDB();

    const product = await Product.findById(productId).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: JSON.parse(JSON.stringify(product)),
    });
  } catch (error) {
    console.error("Error obteniendo producto:", error);

    return NextResponse.json(
      {
        error: "No se pudo obtener el producto.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

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

    const category = cleanCategory(body.category || "cosplays");
    const categories = cleanCategories(body.categories, category);

    product.title = String(body.title || "").trim();
    product.slug = String(body.slug || "").trim().toLowerCase();
    product.category = category;
    product.categories = categories;
    product.status = body.status === "preventa" ? "preventa" : "stock";
    product.price = Number(body.price || 0);
    product.oldPrice = Number(body.oldPrice || 0);
    product.stock = Number(body.stock || 0);
    product.mainImage = cleanImage(body.mainImage);

    product.images = Array.isArray(body.images)
      ? body.images
          .map((image: unknown) => cleanImage(image))
          .filter((image: string) => image !== "/placeholder-product.png")
          .slice(0, 5)
      : [];

    product.description = String(body.description || "");
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
      {
        error: "No se pudo actualizar el producto.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    await connectDB();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(productId);

    return NextResponse.json({
      success: true,
      message: "Producto eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);

    return NextResponse.json(
      {
        error: "No se pudo eliminar el producto.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}