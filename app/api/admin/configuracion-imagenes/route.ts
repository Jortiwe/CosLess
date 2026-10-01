import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/mongodb";
import SiteImageSettings from "../../../../models/SiteImageSettings";
import { writeAudit } from "../../../../lib/audit";
import {
  HOME_CATEGORY_IMAGE_KEYS,
  normalizeHomeImageSettings,
  readCategoryImages,
} from "../../../../lib/home-images";

async function requireAdmin() {
  const token = (await cookies()).get("cosless_admin_token")?.value;
  if (!token) throw new Error("No autorizado.");
  return verifyAdminToken(token);
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const raw = await SiteImageSettings.findOne({ key: "home" }).lean();
    const settings = normalizeHomeImageSettings(
      raw
        ? {
            heroImages: Array.isArray(raw.heroImages) ? raw.heroImages : [],
            categoryImages: readCategoryImages(raw.categoryImages),
          }
        : undefined
    );
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No autorizado." },
      { status: 401 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const settings = normalizeHomeImageSettings({
      heroImages: Array.isArray(body?.heroImages)
        ? body.heroImages.filter((value: unknown) => typeof value === "string")
        : [],
      categoryImages: HOME_CATEGORY_IMAGE_KEYS.reduce((images, key) => {
        const value = body?.categoryImages?.[key];
        if (typeof value === "string") images[key] = value;
        return images;
      }, {} as Record<(typeof HOME_CATEGORY_IMAGE_KEYS)[number], string>),
    });

    await connectDB();
    await SiteImageSettings.findOneAndUpdate(
      { key: "home" },
      { $set: { heroImages: settings.heroImages, categoryImages: settings.categoryImages } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await writeAudit({
      action: "Actualizó imágenes de inicio",
      entityType: "Configuración",
      entityName: "Página principal",
      actor: admin.email,
      details: "Se actualizaron imágenes del carrusel y categorías.",
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron guardar las imágenes." },
      { status: error instanceof Error && error.message === "No autorizado." ? 401 : 500 }
    );
  }
}
