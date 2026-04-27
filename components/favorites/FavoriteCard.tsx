import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";

type FavoriteCardProps = {
  title: string;
  price: string;
  category: string;
  status: "stock" | "preventa";
};

export default function FavoriteCard({
  title,
  price,
  category,
  status,
}: FavoriteCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#cfeaf6] bg-white shadow-[0_8px_24px_rgba(22,50,74,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(22,50,74,0.10)]">
      <div className="flex aspect-[4/3] items-center justify-center bg-[#eaf8ff]">
        <div className="text-center text-[#6b8799]">
          <FiHeart className="mx-auto text-[2rem]" />
          <p className="mt-3 text-sm">Imagen del producto</p>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#19b7c9]">
            {category}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
              status === "stock"
                ? "bg-[#dff7ea] text-[#16784a]"
                : "bg-[#fff3d9] text-[#9a6a00]"
            }`}
          >
            {status === "stock" ? "En stock" : "Preventa"}
          </span>
        </div>

        <h3 className="text-xl font-extrabold leading-8 text-[#16324a]">
          {title}
        </h3>

        <p className="mt-3 text-lg font-bold text-[#19b7c9]">{price}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#19b7c9] px-4 py-3 text-sm font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0ea5b7]"
          >
            <FiShoppingBag />
            Añadir
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-bold text-[#16324a] transition duration-200 hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            <FiTrash2 />
            Quitar
          </button>
        </div>
      </div>
    </article>
  );
}