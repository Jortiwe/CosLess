import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import News from "../../../../models/News";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ newsId: string }> }
) {
  try {
    const { newsId } = await params;

    await connectDB();

    const news = await News.findById(newsId).lean();

    if (!news) {
      return NextResponse.json(
        { error: "Novedad no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      news: JSON.parse(JSON.stringify(news)),
    });
  } catch (error) {
    console.error("Error obteniendo novedad:", error);

    return NextResponse.json(
      {
        error: "No se pudo obtener la novedad.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ newsId: string }> }
) {
  try {
    const { newsId } = await params;
    const body = await request.json();

    await connectDB();

    const news = await News.findById(newsId);

    if (!news) {
      return NextResponse.json(
        { error: "Novedad no encontrada." },
        { status: 404 }
      );
    }

    const title = cleanText(body.title);
    const content = cleanText(body.content);
    const slug = cleanSlug(body.slug || title);

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: "Título, slug y contenido son obligatorios." },
        { status: 400 }
      );
    }

    news.title = title;
    news.slug = slug;
    news.summary = cleanText(body.summary);
    news.content = content;
    news.image = cleanImage(body.image);
    news.isPublished = body.isPublished !== false;

    await news.save();

    return NextResponse.json({
      success: true,
      news: JSON.parse(JSON.stringify(news)),
    });
  } catch (error) {
    console.error("Error actualizando novedad:", error);

    return NextResponse.json(
      {
        error: "No se pudo actualizar la novedad.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ newsId: string }> }
) {
  try {
    const { newsId } = await params;

    await connectDB();

    const news = await News.findByIdAndDelete(newsId);

    if (!news) {
      return NextResponse.json(
        { error: "Novedad no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Novedad eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando novedad:", error);

    return NextResponse.json(
      {
        error: "No se pudo eliminar la novedad.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}