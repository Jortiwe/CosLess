import { COSLESS_IMAGES } from "./coslessImages";

export const CATEGORY_LIST = [
  {
    slug: "cosplays",
    title: "Cosplays",
    description: "Trajes completos para tus personajes favoritos.",
    image: COSLESS_IMAGES.home.catCosplays,
    queryValues: ["cosplays", "cosplay"],
  },
  {
    slug: "pelucas",
    title: "Pelucas",
    description: "Pelucas de distintos estilos, colores y cortes.",
    image: COSLESS_IMAGES.home.catPelucas,
    queryValues: ["pelucas", "peluca"],
  },
  {
    slug: "lentes",
    title: "Lentes",
    description: "Lentes para completar mejor tu personaje.",
    image: COSLESS_IMAGES.home.catLentes,
    queryValues: ["lentes", "lentillas"],
  },
  {
    slug: "accesorios",
    title: "Accesorios",
    description: "Complementos, detalles y piezas especiales.",
    image: COSLESS_IMAGES.home.catAccesorios,
    queryValues: ["accesorios", "accesorio"],
  },
  {
    slug: "preventa",
    title: "Preventa",
    description: "Productos próximos a llegar o disponibles bajo pedido.",
    image: COSLESS_IMAGES.home.catPreventa,
    queryValues: ["preventa"],
  },

  // NUEVA CATEGORÍA
  {
    slug: "alquiler",
    title: "Alquiler",
    description:
      "Cosplays y pelucas disponibles para alquilar por eventos, sesiones y convenciones.",
    image: COSLESS_IMAGES.home.hero4,
    queryValues: ["alquiler", "renta"],
  },
];

export function getCategoryBySlug(slug: string) {
  return CATEGORY_LIST.find((category) => category.slug === slug);
}
