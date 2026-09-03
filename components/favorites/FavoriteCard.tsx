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
    <article className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_24px_var(--shadow)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_var(--shadow-strong)]">
      <div className="flex aspect-[4/3] items-center justify-center bg-[var(--surface-soft)]">
        <div className="text-center text-[var(--text-muted)]">
          <FiHeart className="mx-auto text-[2rem]" />
          <p className="mt-3 text-sm">Imagen del producto</p>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
            {category}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
              status === "stock"
                ? "bg-[var(--success-bg)] text-[var(--success)]"
                : "bg-[var(--warning-bg)] text-[var(--warning)]"
            }`}
          >
            {status === "stock" ? "En stock" : "Preventa"}
          </span>
        </div>

        <h3 className="text-xl font-extrabold leading-8 text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-3 text-lg font-bold text-[var(--primary)]">{price}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white transition duration-200 hover:scale-[1.02] hover:bg-[var(--primary-dark)]"
          >
            <FiShoppingBag />
            Añadir
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)] transition duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <FiTrash2 />
            Quitar
          </button>
        </div>
      </div>
    </article>
  );
}