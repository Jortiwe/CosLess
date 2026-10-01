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

export type HeroSlideSettings = {
  image: string;
  tag: string;
  title: string;
  href: string;
};

export type HomeImageSettings = {
  heroSlides: HeroSlideSettings[];
  categoryImages: Record<HomeCategoryImageKey, string>;
  categoryHeroImages: Record<HomeCategoryImageKey, string>;
};

type HomeImageSettingsInput = {
  heroImages?: string[];
  heroSlides?: Partial<HeroSlideSettings>[];
  categoryImages?: Partial<Record<HomeCategoryImageKey, string>>;
  categoryHeroImages?: Partial<Record<HomeCategoryImageKey, string>>;
};

export const DEFAULT_HERO_SLIDES: HeroSlideSettings[] = [
  { image: COSLESS_IMAGES.home.hero1, tag: "Cosplay", title: "CosLess", href: "/productos" },
  { image: COSLESS_IMAGES.home.hero2, tag: "Lentillas", title: "Lentes", href: "/categoria/lentes" },
  { image: COSLESS_IMAGES.home.hero3, tag: "Accesorios", title: "Detalles", href: "/categoria/accesorios" },
  { image: COSLESS_IMAGES.home.hero4, tag: "Alquiler", title: "Cosplays", href: "/categoria/alquiler" },
];

export const DEFAULT_HOME_IMAGE_SETTINGS: HomeImageSettings = {
  heroSlides: DEFAULT_HERO_SLIDES,
  categoryImages: {
    cosplays: COSLESS_IMAGES.home.catCosplays,
    pelucas: COSLESS_IMAGES.home.catPelucas,
    lentes: COSLESS_IMAGES.home.catLentes,
    accesorios: COSLESS_IMAGES.home.catAccesorios,
    preventa: COSLESS_IMAGES.home.catPreventa,
    alquiler: COSLESS_IMAGES.home.hero4,
  },
  categoryHeroImages: {
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
  const sourceSlides = Array.isArray(value?.heroSlides) && value.heroSlides.length > 0
    ? value.heroSlides.slice(0, 8)
    : DEFAULT_HERO_SLIDES.map((slide, index) => ({
        ...slide,
        image: value?.heroImages?.[index]?.trim() || slide.image,
      }));

  const heroSlides = sourceSlides.map((slide, index) => {
    const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length];
    return {
      image: slide.image?.trim() || fallback.image,
      tag: slide.tag?.trim() || fallback.tag,
      title: slide.title?.trim() || fallback.title,
      href: slide.href?.trim() || fallback.href,
    };
  });

  const categoryImages = HOME_CATEGORY_IMAGE_KEYS.reduce((images, key) => {
    const image = value?.categoryImages?.[key]?.trim();
    images[key] = image || DEFAULT_HOME_IMAGE_SETTINGS.categoryImages[key];
    return images;
  }, {} as Record<HomeCategoryImageKey, string>);

  const categoryHeroImages = HOME_CATEGORY_IMAGE_KEYS.reduce((images, key) => {
    const image = value?.categoryHeroImages?.[key]?.trim();
    images[key] = image || categoryImages[key];
    return images;
  }, {} as Record<HomeCategoryImageKey, string>);

  return { heroSlides, categoryImages, categoryHeroImages };
}
