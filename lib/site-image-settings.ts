import { connectDB } from "./mongodb";
import SiteImageSettings from "../models/SiteImageSettings";
import {
  type HomeImageSettings,
  normalizeHomeImageSettings,
  readCategoryImages,
} from "./home-images";

export async function getHomeImageSettings(): Promise<HomeImageSettings> {
  await connectDB();
  const raw = await SiteImageSettings.findOne({ key: "home" }).lean();

  if (!raw) return normalizeHomeImageSettings();

  return normalizeHomeImageSettings({
    heroImages: Array.isArray(raw.heroImages) ? raw.heroImages : [],
    categoryImages: readCategoryImages(raw.categoryImages),
  });
}
