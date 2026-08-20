"use client";

import { useEffect, useMemo, useState } from "react";

type ProductOption = {
  _id: string;
  title?: string;
  category?: string;
  price?: number;
  mainImage?: string;
};

type Props = {
  currentProductId?: string;
  pairedProducts: string[];
  setPairedProducts: (value: string[]) => void;
};

export default function ProductPairingFields({
  currentProductId,
  pairedProducts,
  setPairedProducts,
}: Props) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);

        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || cancelled) return;

        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProducts = useMemo(() => {
    return pairedProducts
      .map((id) => products.find((product) => product._id === id))
      .filter(Boolean) as ProductOption[];
  }, [pairedProducts, products]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter((product) => {
        if (product._id === currentProductId) return false;
        if (pairedProducts.includes(product._id)) return false;

        const searchable = [
          product.title,
          product.category,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .slice(0, 6);
  }, [search, products, pairedProducts, currentProductId]);

  function addProduct(id: string) {
    if (pairedProducts.includes(id)) return;
    if (pairedProducts.length >= 4) return;

    setPairedProducts([...pairedProducts, id]);
    setSearch("");
  }

  function removeProduct(id: string) {
    setPairedProducts(pairedProducts.filter((item) => item !== id));
  }

  return (
    <div className="md:col-span-2">
      <div className="rounded-[24px] border border-[#cfeaf6] bg-white p-5">
        <div className="mb-4">
          <h3 className="text-lg font-extrabold text-[#16324a]">
            Productos que combinan
          </h3>

          <p className="mt-1 text-xs font-semibold leading-5 text-[#4b6b80]">
            Relaciona este producto con otros que puedan venderse o alquilarse juntos.
            Máximo 4 productos.
          </p>
        </div>

        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            disabled={pairedProducts.length >= 4}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-[#f8fdff] px-4 py-4 text-sm font-semibold text-[#16324a] outline-none transition placeholder:text-[#8aa4b4] focus:border-[#19b7c9] disabled:cursor-not-allowed disabled:opacity-60"
          />

          {search.trim() && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[22px] border border-[#cfeaf6] bg-white shadow-[0_16px_40px_rgba(22,50,74,0.14)]">
              {loading ? (
                <div className="p-4 text-sm font-semibold text-[#4b6b80]">
                  Cargando productos...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-sm font-semibold text-[#4b6b80]">
                  No se encontraron productos.
                </div>
              ) : (
                results.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => addProduct(product._id)}
                    className="flex w-full items-center gap-3 border-b border-[#eef7fa] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f1fbfd]"
                  >
                    <img
                      src={product.mainImage || "/placeholder-product.png"}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-[#16324a]">
                        {product.title || "Producto"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#4b6b80]">
                        {product.category || "Sin categoría"} · Bs{" "}
                        {Number(product.price || 0)}
                      </p>
                    </div>

                    <span className="rounded-xl bg-[#e9fbff] px-3 py-2 text-xs font-extrabold text-[#19b7c9]">
                      Agregar
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {selectedProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 rounded-[18px] border border-[#cfeaf6] bg-[#f8fdff] p-3"
              >
                <img
                  src={product.mainImage || "/placeholder-product.png"}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#16324a]">
                    {product.title || "Producto"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#4b6b80]">
                    {product.category || "Producto"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeProduct(product._id)}
                  className="rounded-xl border border-[#f2c7c7] bg-white px-3 py-2 text-xs font-extrabold text-[#c94b4b] transition hover:bg-[#fff5f5]"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs font-bold text-[#4b6b80]">
          {pairedProducts.length} / 4 emparejados
        </p>
      </div>
    </div>
  );
}