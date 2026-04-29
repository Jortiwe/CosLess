import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";

type SearchProduct = {
  _id: string;
  title?: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string | Date;
};

function normalizeText(value: unknown): string {
  return String(value || "").toLowerCase();
}

function splitWords(value: unknown): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((word: string) => word.length > 0);
}

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

    const rawProducts = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const products: SearchProduct[] = JSON.parse(JSON.stringify(rawProducts));

    const exactMatches = products.filter((product: SearchProduct) => {
      const title = normalizeText(product.title);
      const category = normalizeText(product.category);
      const description = normalizeText(product.description);

      return (
        title.includes(normalized) ||
        category.includes(normalized) ||
        description.includes(normalized)
      );
    });

    const relatedMatches = products.filter((product: SearchProduct) => {
      const titleWords = splitWords(product.title);
      const category = normalizeText(product.category);
      const descriptionWords = splitWords(product.description);
      const queryWords = splitWords(normalized);

      const hasWordMatch = queryWords.some((word: string) => {
        return (
          titleWords.some(
            (item: string) => item.includes(word) || word.includes(item)
          ) ||
          descriptionWords.some(
            (item: string) => item.includes(word) || word.includes(item)
          ) ||
          category.includes(word)
        );
      });

      const alreadyInExact = exactMatches.some(
        (exact: SearchProduct) => String(exact._id) === String(product._id)
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