import { Types } from "mongoose";
import { connectDB } from "../../../lib/mongodb";
import AccountStore from "../../../models/AccountStore";
import Favorite from "../../../models/Favorite";
import Product from "../../../models/Product";
import AdminFavoritesClient from "../../../components/admin/AdminFavoritesClient";

export const dynamic = "force-dynamic";

type RawFavorite = {
  _id?: string;
  userId?: string | { _id?: string } | null;
  productId?: string | { _id?: string } | null;
};

type RawAccountStoreFavorite = {
  productId?: unknown;
  title?: string;
  price?: number;
  mainImage?: string;
  slug?: string;
  category?: string;
  status?: string;
};

type RawAccountStore = {
  _id?: string;
  userId?: string;
  email?: string;
  favorites?: RawAccountStoreFavorite[];
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

export default async function AdminFavoritesPage() {
  await connectDB();

  const [rawFavorites, rawStores] = await Promise.all([
    Favorite.find().lean(),
    AccountStore.find().lean(),
  ]);

  const favorites = JSON.parse(JSON.stringify(rawFavorites)) as RawFavorite[];
  const stores = JSON.parse(JSON.stringify(rawStores)) as RawAccountStore[];

  const favoritePairs = new Set<string>();
  const productIds = new Set<string>();

  for (const favorite of favorites) {
    const productId = getId(favorite.productId);
    const userId = getId(favorite.userId) || String(favorite._id || "unknown");

    if (!productId) continue;

    favoritePairs.add(`${userId}:${productId}`);
    productIds.add(productId);
  }

  for (const store of stores) {
    const userId = String(store.userId || store._id || store.email || "unknown");

    if (!Array.isArray(store.favorites)) continue;

    for (const favorite of store.favorites) {
      const productId = getId(favorite.productId);

      if (!productId) continue;

      favoritePairs.add(`${userId}:${productId}`);
      productIds.add(productId);
    }
  }

  const productIdList = Array.from(productIds).filter((productId) =>
    Types.ObjectId.isValid(productId)
  );

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

  const existingProductIds = new Set(products.map((product) => String(product._id)));

  const deletedProductIds = productIdList.filter(
    (productId) => !existingProductIds.has(productId)
  );

  if (deletedProductIds.length > 0) {
    await Promise.all([
      Favorite.deleteMany({
        productId: { $in: deletedProductIds },
      }),
      AccountStore.updateMany(
        {},
        {
          $pull: {
            favorites: {
              productId: { $in: deletedProductIds },
            },
          },
        }
      ),
    ]);
  }

  const countMap = new Map<string, number>();

  for (const pair of favoritePairs) {
    const productId = pair.split(":").pop();

    if (!productId) continue;
    if (!existingProductIds.has(productId)) continue;

    countMap.set(productId, (countMap.get(productId) || 0) + 1);
  }

  const productStats: ProductFavoriteStat[] = Array.from(countMap.entries())
    .map(([productId, count]) => {
      const product = productMap.get(productId);

      if (!product) return null;

      return {
        productId,
        title: product.title || "Sin título",
        category: product.category || "Sin categoría",
        price: product.price,
        status: product.status,
        mainImage: product.mainImage,
        slug: product.slug,
        count,
      };
    })
    .filter(Boolean) as ProductFavoriteStat[];

  productStats.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));

  return <AdminFavoritesClient productStats={productStats} />;
}