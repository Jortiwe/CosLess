import type { MetadataRoute } from "next";

const SITE_URL = "https://www.cosless.store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/carrito/",
        "/checkout/",
        "/cuenta/",
        "/favoritos/",
        "/perfil/",
        "/alquiler/",
        "/buscar",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
