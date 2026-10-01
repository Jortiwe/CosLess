import type { MetadataRoute } from "next";
import { CATEGORY_LIST } from "../lib/categories";
import { connectDB } from "../lib/mongodb";
import Product from "../models/Product";

const SITE_URL = "https://cosless.store";

// El listado se obtiene de MongoDB para incluir productos creados o editados
// recientemente sin mantener un archivo manual.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const products = await Product.find({
    $or: [
      { isActive: true },
      { active: true },
      { isActive: { $exists: false } },
    ],
  })
    .select("slug updatedAt createdAt")
    .lean();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
    },
    {
      url: `${SITE_URL}/productos`,
    },
    ...CATEGORY_LIST.map((category) => ({
      url: `${SITE_URL}/categoria/${category.slug}`,
    })),
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      url: `${SITE_URL}/producto/${product.slug}`,
      lastModified: product.updatedAt || product.createdAt || new Date(),
    }));

  return [...staticPages, ...productPages];
}
