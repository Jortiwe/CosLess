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
  } | null;
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

export default async function AdminFavoritesPage() {
  await connectDB();

  const rawFavorites = await Favorite.find()
    .populate("productId")
    .populate("userId")
    .sort({ createdAt: -1 })
    .lean();

  const favorites = JSON.parse(JSON.stringify(rawFavorites)) as FavoriteItem[];

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestión de favoritos</h1>
            <p className="mt-2 text-[#4b6b80]">
              Revisa qué productos guardan más los usuarios.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <div className="rounded-2xl bg-white px-4 py-6 text-sm text-[#4b6b80]">
                No hay favoritos todavía.
              </div>
            ) : (
              favorites.map((fav) => (
                <article
                  key={fav._id}
                  className="rounded-[24px] bg-white p-5"
                >
                  <p className="font-bold">
                    Usuario: {fav.userId?.fullName || "Sin usuario"}
                  </p>

                  <p className="mt-2 text-sm text-[#4b6b80]">
                    Correo: {fav.userId?.email || "Sin correo"}
                  </p>

                  <p className="mt-2 text-sm text-[#4b6b80]">
                    Producto: {fav.productId?.title || "Producto eliminado"}
                  </p>

                  <p className="mt-2 text-sm text-[#4b6b80]">
                    Categoría: {fav.productId?.category || "Sin categoría"}
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#19b7c9]">
                    Precio: {formatBs(fav.productId?.price)}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}