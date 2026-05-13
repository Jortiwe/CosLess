import { Types } from "mongoose";
import { connectDB } from "../../../lib/mongodb";
import Favorite from "../../../models/Favorite";
import Product from "../../../models/Product";
import User from "../../../models/User";
import AdminFavoritesClient from "../../../components/admin/AdminFavoritesClient";

type RawFavorite = {
  _id?: string;
  userId?: string | { _id?: string } | null;
  productId?: string | { _id?: string } | null;
};

type RawUser = {
  _id?: string;
  fullName?: string;
  email?: string;
  favorites?: unknown[];
  favoriteItems?: unknown[];
  favoriteProducts?: unknown[];
  savedProducts?: unknown[];
};

type RawProduct = {
  _id: string;
  title?: string;
  category?: string;
  price?: number;
  status?: string;
  mainImage?: string;
  slug?: string;
};

export type ProductFavoriteStat = {
  productId: string;
  title: string;
  category: string;
  price?: number;
  status?: string;
  mainImage?: string;
  slug?: string;
  count: number;
};

function getId(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return Types.ObjectId.isValid(value) ? value : null;
  }

  if (typeof value === "object") {
    const objectValue = value as {
      _id?: unknown;
      productId?: unknown;
      id?: unknown;
    };

    if (typeof objectValue._id === "string") {
      return Types.ObjectId.isValid(objectValue._id) ? objectValue._id : null;
    }

    if (typeof objectValue.productId === "string") {
      return Types.ObjectId.isValid(objectValue.productId)
        ? objectValue.productId
        : null;
    }

    if (
      typeof objectValue.productId === "object" &&
      objectValue.productId !== null
    ) {
      const nestedProduct = objectValue.productId as { _id?: unknown };

      if (typeof nestedProduct._id === "string") {
        return Types.ObjectId.isValid(nestedProduct._id)
          ? nestedProduct._id
          : null;
      }
    }

    if (typeof objectValue.id === "string") {
      return Types.ObjectId.isValid(objectValue.id) ? objectValue.id : null;
    }
  }

  return null;
}

function extractUserFavoriteProductIds(user: RawUser) {
  const sources = [
    user.favorites,
    user.favoriteItems,
    user.favoriteProducts,
    user.savedProducts,
  ];

  const ids = new Set<string>();

  for (const list of sources) {
    if (!Array.isArray(list)) continue;

    for (const item of list) {
      const productId = getId(item);

      if (productId) {
        ids.add(productId);
      }
    }
  }

  return Array.from(ids);
}

export default async function AdminFavoritesPage() {
  await connectDB();

  const [rawFavorites, rawUsers] = await Promise.all([
    Favorite.find().lean(),
    User.find().lean(),
  ]);

  const favorites = JSON.parse(JSON.stringify(rawFavorites)) as RawFavorite[];
  const users = JSON.parse(JSON.stringify(rawUsers)) as RawUser[];

  const favoritePairs = new Set<string>();
  const productIds = new Set<string>();

  for (const favorite of favorites) {
    const productId = getId(favorite.productId);
    const userId = getId(favorite.userId) || String(favorite._id || "unknown");

    if (!productId) continue;

    favoritePairs.add(`${userId}:${productId}`);
    productIds.add(productId);
  }

  for (const user of users) {
    const userId = String(user._id || "unknown-user");
    const userProductIds = extractUserFavoriteProductIds(user);

    for (const productId of userProductIds) {
      favoritePairs.add(`${userId}:${productId}`);
      productIds.add(productId);
    }
  }

  const productIdList = Array.from(productIds);

  const rawProducts =
    productIdList.length > 0
      ? await Product.find({
          _id: { $in: productIdList },
        }).lean()
      : [];

  const products = JSON.parse(JSON.stringify(rawProducts)) as RawProduct[];

  const productMap = new Map<string, RawProduct>();

  for (const product of products) {
    productMap.set(String(product._id), product);
  }

  const countMap = new Map<string, number>();

  for (const pair of favoritePairs) {
    const productId = pair.split(":").pop();

    if (!productId) continue;

    countMap.set(productId, (countMap.get(productId) || 0) + 1);
  }

  const productStats: ProductFavoriteStat[] = Array.from(countMap.entries())
    .map(([productId, count]) => {
      const product = productMap.get(productId);

      return {
        productId,
        title: product?.title || "Producto no encontrado",
        category: product?.category || "Sin categoría",
        price: product?.price,
        status: product?.status,
        mainImage: product?.mainImage,
        slug: product?.slug,
        count,
      };
    })
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));

  return <AdminFavoritesClient productStats={productStats} />;
}