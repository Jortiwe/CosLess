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
            heroSlides: Array.isArray(raw.heroSlides) ? raw.heroSlides : [],
            categoryImages: readCategoryImages(raw.categoryImages),
            categoryHeroImages: readCategoryImages(raw.categoryHeroImages),
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
      heroSlides: Array.isArray(body?.heroSlides)
        ? body.heroSlides
            .filter((slide: unknown) => slide && typeof slide === "object")
            .slice(0, 8)
            .map((slide: Record<string, unknown>) => ({
              image: typeof slide.image === "string" ? slide.image : "",
              tag: typeof slide.tag === "string" ? slide.tag : "",
              title: typeof slide.title === "string" ? slide.title : "",
              href: typeof slide.href === "string" ? slide.href : "",
            }))
        : [],
      categoryImages: HOME_CATEGORY_IMAGE_KEYS.reduce((images, key) => {
        const value = body?.categoryImages?.[key];
        if (typeof value === "string") images[key] = value;
        return images;
      }, {} as Record<(typeof HOME_CATEGORY_IMAGE_KEYS)[number], string>),
      categoryHeroImages: HOME_CATEGORY_IMAGE_KEYS.reduce((images, key) => {
        const value = body?.categoryHeroImages?.[key];
        if (typeof value === "string") images[key] = value;
        return images;
      }, {} as Record<(typeof HOME_CATEGORY_IMAGE_KEYS)[number], string>),
    });

    await connectDB();
    await SiteImageSettings.findOneAndUpdate(
      { key: "home" },
      { $set: { heroSlides: settings.heroSlides, categoryImages: settings.categoryImages, categoryHeroImages: settings.categoryHeroImages } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await writeAudit({
      action: "Actualizó imágenes de inicio",
      entityType: "Configuración",
      entityName: "Página principal",
      actor: admin.email,
      details: "Se actualizaron diapositivas, imágenes de categorías y banners.",
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron guardar las imágenes." },
      { status: error instanceof Error && error.message === "No autorizado." ? 401 : 500 }
    );
  }
}
