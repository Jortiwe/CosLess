import { connectDB } from "../../../lib/mongodb";
import Favorite from "../../../models/Favorite";
import AdminBackButton from "../../../components/admin/AdminBackButton";

type FavoriteItem = {
  _id: string;
  userId?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | null;
  productId?: {
    _id?: string;
    title?: string;
    category?: string;
    price?: number;
    status?: string;
    mainImage?: string;
    slug?: string;
  } | null;
};

type ProductFavoriteStat = {
  productId: string;
  title: string;
  category: string;
  price?: number;
  status?: string;
  mainImage?: string;
  slug?: string;
  count: number;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

function categoryLabel(value?: string) {
  if (!value) return "Sin categoría";

  const labels: Record<string, string> = {
    cosplays: "Cosplays",
    pelucas: "Pelucas",
    lentes: "Lentes",
    mallas: "Mallas",
    accesorios: "Accesorios",
    preventa: "Preventa",
  };

  return labels[value] || value;
}

function statusLabel(value?: string) {
  if (value === "preventa") return "Preventa";
  if (value === "stock") return "Stock";
  return "Sin estado";
}

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";
  const value = src.trim();
  return value || "/placeholder-product.png";
}

export default async function AdminFavoritesPage() {
  await connectDB();

  const rawFavorites = await Favorite.find()
    .populate("productId")
    .populate("userId")
    .sort({ createdAt: -1 })
    .lean();

  const favorites = JSON.parse(JSON.stringify(rawFavorites)) as FavoriteItem[];

  const statsMap = new Map<string, ProductFavoriteStat>();

  for (const fav of favorites) {
    const product = fav.productId;

    if (!product?._id) continue;

    const productId = String(product._id);

    const existing = statsMap.get(productId);

    if (existing) {
      existing.count += 1;
    } else {
      statsMap.set(productId, {
        productId,
        title: product.title || "Producto sin título",
        category: product.category || "Sin categoría",
        price: product.price,
        status: product.status,
        mainImage: product.mainImage,
        slug: product.slug,
        count: 1,
      });
    }
  }

  const productStats = Array.from(statsMap.values()).sort((a, b) => {
    return b.count - a.count || a.title.localeCompare(b.title);
  });

  const totalFavorites = favorites.length;
  const totalProducts = productStats.length;
  const mostPopular = productStats[0];
  const maxFavorites = mostPopular?.count || 1;

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestión de favoritos</h1>

            <p className="mt-2 text-[#4b6b80]">
              Revisa qué productos guardan más los usuarios y detecta cuáles son
              los más populares.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#cfeaf6] bg-white p-5 shadow-[0_10px_28px_rgba(22,50,74,0.05)]">
            <p className="text-sm font-bold text-[#6f8798]">
              Favoritos totales
            </p>

            <p className="mt-2 text-3xl font-black text-[#19b7c9]">
              {totalFavorites}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#cfeaf6] bg-white p-5 shadow-[0_10px_28px_rgba(22,50,74,0.05)]">
            <p className="text-sm font-bold text-[#6f8798]">
              Productos guardados
            </p>

            <p className="mt-2 text-3xl font-black text-[#19b7c9]">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#cfeaf6] bg-white p-5 shadow-[0_10px_28px_rgba(22,50,74,0.05)] sm:col-span-2">
            <p className="text-sm font-bold text-[#6f8798]">
              Producto más popular
            </p>

            <p className="mt-2 line-clamp-1 text-2xl font-black text-[#16324a]">
              {mostPopular?.title || "Sin datos todavía"}
            </p>

            <p className="mt-1 text-sm font-bold text-[#19b7c9]">
              {mostPopular
                ? `${mostPopular.count} favorito(s)`
                : "Aún no hay favoritos"}
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-5 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:p-6">
          {productStats.length === 0 ? (
            <div className="rounded-[26px] bg-white px-5 py-10 text-center shadow-[0_8px_22px_rgba(22,50,74,0.04)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#eaf8ff] text-2xl text-[#19b7c9]">
                ♥
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-[#16324a]">
                No hay favoritos todavía
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#4b6b80]">
                Cuando los usuarios guarden productos como favoritos, aquí verás
                cuáles son los más populares.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {productStats.map((product, index) => {
                const percentage = Math.max(
                  8,
                  Math.round((product.count / maxFavorites) * 100)
                );

                return (
                  <article
                    key={product.productId}
                    className="rounded-[28px] bg-white p-4 shadow-[0_8px_22px_rgba(22,50,74,0.04)] sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-[#eaf8ff] sm:h-28 sm:w-24">
                          <img
                            src={getSafeImage(product.mainImage)}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-black text-[#19b7c9]">
                              #{index + 1}
                            </span>

                            <span className="rounded-full bg-[#f2f8fb] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6f8798]">
                              {categoryLabel(product.category)}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                                product.status === "preventa"
                                  ? "bg-[#fff3dc] text-[#b87d00]"
                                  : "bg-[#e6f6ed] text-[#16824c]"
                              }`}
                            >
                              {statusLabel(product.status)}
                            </span>
                          </div>

                          <h2 className="mt-3 line-clamp-2 text-xl font-extrabold leading-7 text-[#16324a]">
                            {product.title}
                          </h2>

                          <p className="mt-2 text-lg font-black text-[#19b7c9]">
                            {formatBs(product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="w-full lg:max-w-[360px]">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-bold text-[#4b6b80]">
                            Favoritos
                          </p>

                          <p className="text-2xl font-black text-[#19b7c9]">
                            {product.count}
                          </p>
                        </div>

                        <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#eaf8ff]">
                          <div
                            className="h-full rounded-full bg-[#19b7c9]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-2 text-xs font-semibold text-[#6f8798]">
                          Popularidad relativa dentro de productos favoritos.
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}