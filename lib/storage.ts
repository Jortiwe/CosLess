export type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  mainImage: string;
  slug?: string;
};

export type FavoriteItem = {
  productId: string;
  title: string;
  price: number;
  mainImage: string;
  slug?: string;
  category?: string;
  status?: "stock" | "preventa";
};

export const CART_KEY = "cosless_cart";
export const FAVORITES_KEY = "cosless_favorites";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    typeof item.mainImage === "string"
  );
}

function isFavoriteItem(value: unknown): value is FavoriteItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  const status = item.status;

  return (
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.mainImage === "string" &&
    (status === undefined || status === "stock" || status === "preventa")
  );
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cosless-cart-updated"));
}

export function getFavoriteItems(): FavoriteItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isFavoriteItem);
  } catch {
    return [];
  }
}

export function saveFavoriteItems(items: FavoriteItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cosless-favorites-updated"));
}