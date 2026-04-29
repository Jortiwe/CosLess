export const CATEGORY_LIST = [
  {
    slug: "cosplays",
    title: "Cosplays",
    description: "Trajes completos para tus personajes favoritos.",
    image: "/images/home/cat-cosplays.png",
    queryValues: ["cosplays", "cosplay"],
  },
  {
    slug: "pelucas",
    title: "Pelucas",
    description: "Pelucas de distintos estilos, colores y cortes.",
    image: "/images/home/cat-pelucas.png",
    queryValues: ["pelucas", "peluca"],
  },
  {
    slug: "lentes",
    title: "Lentes",
    description: "Lentes para completar mejor tu personaje.",
    image: "/images/home/cat-lentes.png",
    queryValues: ["lentes", "lentillas"],
  },
  {
    slug: "mallas",
    title: "Mallas",
    description: "Mallas y prendas base para cosplay.",
    image: "/images/home/cat-mallas.png",
    queryValues: ["mallas", "malla"],
  },
  {
    slug: "accesorios",
    title: "Accesorios",
    description: "Complementos, detalles y piezas especiales.",
    image: "/images/home/cat-accesorios.png",
    queryValues: ["accesorios", "accesorio"],
  },
  {
    slug: "preventa",
    title: "Preventa",
    description: "Productos próximos a llegar o disponibles bajo pedido.",
    image: "/images/home/cat-preventa.png",
    queryValues: ["preventa"],
  },
];

export function getCategoryBySlug(slug: string) {
  return CATEGORY_LIST.find((category) => category.slug === slug);
}