import { COSLESS_IMAGES } from "./coslessImages";

export const HOME_CATEGORY_IMAGE_KEYS = [
  "cosplays",
  "pelucas",
  "lentes",
  "accesorios",
  "preventa",
  "alquiler",
] as const;

export type HomeCategoryImageKey = (typeof HOME_CATEGORY_IMAGE_KEYS)[number];

export type HomeImageSettings = {
  heroImages: string[];
  categoryImages: Record<HomeCategoryImageKey, string>;
};

type HomeImageSettingsInput = {
  heroImages?: string[];
  categoryImages?: Partial<Record<HomeCategoryImageKey, string>>;
};

export const DEFAULT_HOME_IMAGE_SETTINGS: HomeImageSettings = {
  heroImages: [
    COSLESS_IMAGES.home.hero1,
    COSLESS_IMAGES.home.hero2,
    COSLESS_IMAGES.home.hero3,
    COSLESS_IMAGES.home.hero4,
  ],
  categoryImages: {
    cosplays: COSLESS_IMAGES.home.catCosplays,
    pelucas: COSLESS_IMAGES.home.catPelucas,
    lentes: COSLESS_IMAGES.home.catLentes,
    accesorios: COSLESS_IMAGES.home.catAccesorios,
    preventa: COSLESS_IMAGES.home.catPreventa,
    alquiler: COSLESS_IMAGES.home.hero4,
  },
};

export function readCategoryImages(value: unknown): Partial<Record<HomeCategoryImageKey, string>> {
  if (value instanceof Map) {
    return Object.fromEntries(value) as Partial<Record<HomeCategoryImageKey, string>>;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, image]) => typeof image === "string")
    ) as Partial<Record<HomeCategoryImageKey, string>>;
  }

  return {};
}

export function normalizeHomeImageSettings(value?: HomeImageSettingsInput | null): HomeImageSettings {
  const heroImages = Array.from({ length: 4 }, (_, index) => {
    const image = value?.heroImages?.[index]?.trim();
    return image || DEFAULT_HOME_IMAGE_SETTINGS.heroImages[index];
  });

  const categoryImages = HOME_CATEGORY_IMAGE_KEYS.reduce((images, key) => {
    const image = value?.categoryImages?.[key]?.trim();
    images[key] = image || DEFAULT_HOME_IMAGE_SETTINGS.categoryImages[key];
    return images;
  }, {} as Record<HomeCategoryImageKey, string>);

  return { heroImages, categoryImages };
}
