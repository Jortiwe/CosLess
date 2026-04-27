const categories = [
  "Cosplays",
  "Pelucas",
  "Lentes",
  "Mallas",
  "Accesorios",
  "Preventa",
];

export default function Categories() {
  return (
    <section className="mt-14">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#16324a]">Categorías</h2>
        <p className="mt-2 text-sm text-[#4b6b80]">
          Explora los tipos de productos disponibles en la tienda.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category}
            className="rounded-3xl border border-[#cfeaf6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-28 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#5f8aa0]">
              {category}
            </div>

            <h3 className="text-xl font-semibold text-[#16324a]">{category}</h3>

            <p className="mt-2 text-sm leading-6 text-[#4b6b80]">
              Ver productos de la categoría {category.toLowerCase()}.
            </p>

            <button className="mt-5 rounded-2xl bg-[#19b7c9] px-4 py-2 text-sm font-medium text-white">
              Ver categoría
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}