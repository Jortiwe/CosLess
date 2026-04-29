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

const SESSION_MODE_KEY = "cosless_storage_session_mode";

function canUseBrowser() {
  return typeof window !== "undefined";
}

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

function emitCartUpdate() {
  if (!canUseBrowser()) return;
  window.dispatchEvent(new Event("cosless-cart-updated"));
}

function emitFavoritesUpdate() {
  if (!canUseBrowser()) return;
  window.dispatchEvent(new Event("cosless-favorites-updated"));
}

function safeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isCartItem);
}

function safeFavoriteItems(value: unknown): FavoriteItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isFavoriteItem);
}

async function syncAccountStore() {
  if (!canUseBrowser()) return;

  const mode = localStorage.getItem(SESSION_MODE_KEY);

  if (mode !== "user") return;

  const cart = getCartItems();
  const favorites = getFavoriteItems();

  try {
    await fetch("/api/account/store", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart,
        favorites,
      }),
    });
  } catch {
    // Si falla la sincronización, no rompemos la tienda.
  }
}

export function getCartItems(): CartItem[] {
  if (!canUseBrowser()) return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return safeCartItems(parsed);
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (!canUseBrowser()) return;

  localStorage.setItem(CART_KEY, JSON.stringify(safeCartItems(items)));
  emitCartUpdate();
  syncAccountStore();
}

export function clearCartItems() {
  if (!canUseBrowser()) return;

  localStorage.setItem(CART_KEY, JSON.stringify([]));
  emitCartUpdate();
  syncAccountStore();
}

export function getFavoriteItems(): FavoriteItem[] {
  if (!canUseBrowser()) return [];

  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return safeFavoriteItems(parsed);
  } catch {
    return [];
  }
}

export function saveFavoriteItems(items: FavoriteItem[]) {
  if (!canUseBrowser()) return;

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(safeFavoriteItems(items)));
  emitFavoritesUpdate();
  syncAccountStore();
}

export function clearFavoriteItems() {
  if (!canUseBrowser()) return;

  localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
  emitFavoritesUpdate();
  syncAccountStore();
}

export function clearLocalShopState() {
  if (!canUseBrowser()) return;

  localStorage.setItem(CART_KEY, JSON.stringify([]));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
  localStorage.removeItem(SESSION_MODE_KEY);

  emitCartUpdate();
  emitFavoritesUpdate();
}

export function setGuestShopMode() {
  if (!canUseBrowser()) return;

  localStorage.removeItem(SESSION_MODE_KEY);
}

export function setUserShopMode() {
  if (!canUseBrowser()) return;

  localStorage.setItem(SESSION_MODE_KEY, "user");
}

export async function loadAccountStoreToLocal() {
  if (!canUseBrowser()) return;

  try {
    const response = await fetch("/api/account/store", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return;

    const data = await response.json();

    localStorage.setItem(SESSION_MODE_KEY, "user");
    localStorage.setItem(CART_KEY, JSON.stringify(safeCartItems(data.cart)));
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(safeFavoriteItems(data.favorites))
    );

    emitCartUpdate();
    emitFavoritesUpdate();
  } catch {
    // Si falla, no rompemos la página.
  }
}