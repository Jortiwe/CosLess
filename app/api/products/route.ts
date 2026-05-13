import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

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

    const category = cleanCategory(body.category || "cosplays");
    const categories = cleanCategories(body.categories, category);

    const product = await Product.create({
      title: String(body.title || "").trim(),
      slug: String(body.slug || "").trim().toLowerCase(),
      category,
      categories,
      status: body.status === "preventa" ? "preventa" : "stock",
      price: Number(body.price || 0),
      oldPrice: Number(body.oldPrice || 0),
      stock: Number(body.stock || 0),
      mainImage: cleanImage(body.mainImage),
      images: Array.isArray(body.images)
        ? body.images
            .map((image: unknown) => cleanImage(image))
            .filter((image: string) => image !== "/placeholder-product.png")
            .slice(0, 5)
        : [],
      description: String(body.description || ""),
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