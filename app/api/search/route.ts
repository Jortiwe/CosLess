import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    await connectDB();

    if (!q) {
      return NextResponse.json({
        exactMatches: [],
        relatedMatches: [],
      });
    }

    const normalized = q.toLowerCase();

    const rawProducts = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const products = JSON.parse(JSON.stringify(rawProducts));

    const exactMatches = products.filter((product: any) => {
      const title = String(product.title || "").toLowerCase();
      const category = String(product.category || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();

      return (
        title.includes(normalized) ||
        category.includes(normalized) ||
        description.includes(normalized)
      );
    });

    const relatedMatches = products.filter((product: any) => {
      const titleWords = String(product.title || "")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      const category = String(product.category || "").toLowerCase();
      const descriptionWords = String(product.description || "")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      const queryWords = normalized.split(/\s+/).filter(Boolean);

      const hasWordMatch = queryWords.some((word) => {
        return (
          titleWords.some((item: string) => item.includes(word) || word.includes(item)) ||
          descriptionWords.some((item: string) => item.includes(word) || word.includes(item)) ||
          category.includes(word)
        );
      });

      const alreadyInExact = exactMatches.some(
        (exact: any) => String(exact._id) === String(product._id)
      );

      return hasWordMatch && !alreadyInExact;
    });

    return NextResponse.json({
      exactMatches,
      relatedMatches,
    });
  } catch (error) {
    console.error("Error buscando productos:", error);

    return NextResponse.json(
      { error: "No se pudo realizar la búsqueda." },
      { status: 500 }
    );
  }
}