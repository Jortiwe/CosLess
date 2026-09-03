type DatedProduct = {
  category?: string;
  createdAt?: string | Date;
  status?: string;
  stock?: number;
};

function timestamp(value?: string | Date) {
  const date = value ? new Date(value).getTime() : 0;
  return Number.isFinite(date) ? date : 0;
}

export function availabilityPriority(product: DatedProduct) {
  if (String(product.status || "").toLowerCase() === "preventa") return 1;
  return Number(product.stock || 0) > 0 ? 0 : 2;
}

// Primero disponible, luego preventa y finalmente sin stock. Dentro de cada
// bloque los lentes van por antigüedad y las demás categorías por novedades.
export function compareProductsByRotation<T extends DatedProduct>(a: T, b: T) {
  const availabilityDifference = availabilityPriority(a) - availabilityPriority(b);
  if (availabilityDifference !== 0) return availabilityDifference;

  const aIsLens = String(a.category || "").toLowerCase() === "lentes";
  const bIsLens = String(b.category || "").toLowerCase() === "lentes";

  if (aIsLens && bIsLens) return timestamp(a.createdAt) - timestamp(b.createdAt);
  if (!aIsLens && !bIsLens) return timestamp(b.createdAt) - timestamp(a.createdAt);
  return aIsLens ? -1 : 1;
}

export function sortProductsByRotation<T extends DatedProduct>(products: T[]) {
  return [...products].sort(compareProductsByRotation);
}
