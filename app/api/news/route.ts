import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import News from "../../../models/News";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanSlug(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9áéíóúñü-]/gi, "")
    .replace(/-+/g, "-");
}

function cleanImage(value: unknown) {
  const image = String(value || "").trim();
  return image || "/placeholder-product.png";
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") || 20)));
    const publishedOnly = searchParams.get("published") === "true";

    const query: Record<string, unknown> = {};

    if (publishedOnly) {
      query.isPublished = true;
    }

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      News.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      news: JSON.parse(JSON.stringify(news)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo novedades:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener las novedades.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const title = cleanText(body.title);
    const content = cleanText(body.content);
    const slug = cleanSlug(body.slug || title);

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: "Título, slug y contenido son obligatorios." },
        { status: 400 }
      );
    }

    const created = await News.create({
      title,
      slug,
      summary: cleanText(body.summary),
      content,
      image: cleanImage(body.image),
      isPublished: body.isPublished !== false,
    });

    return NextResponse.json(
      {
        success: true,
        news: JSON.parse(JSON.stringify(created)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando novedad:", error);

    return NextResponse.json(
      {
        error: "No se pudo crear la novedad.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}