"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORY_LIST } from "../../lib/categories";

type ProductType = {
  _id?: string;
  title?: string;
  slug?: string;
  category?: string;
  categories?: string[];
  status?: string;
  price?: number;
  costPrice?: number;
  oldPrice?: number;
  stock?: number;
  mainImage?: string;
  images?: string[];
  description?: string;
  isFeatured?: boolean;
  isOffer?: boolean;
  isWeeklyNew?: boolean;
  isActive?: boolean;
};

type Props = {
  mode: "create" | "edit";
  product?: ProductType;
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

function getInitialCategories(product?: ProductType) {
  const primaryCategory = normalizeCategory(product?.category || "cosplays");

  const savedCategories = Array.isArray(product?.categories)
    ? product.categories.map(normalizeCategory).filter(Boolean)
    : [];

  const categories = Array.from(
    new Set([primaryCategory, ...savedCategories].filter(Boolean))
  );

  return categories.length > 0 ? categories : ["cosplays"];
}

function getCategoryTitle(slug: string) {
  return CATEGORY_LIST.find((category) => category.slug === slug)?.title || slug;
}

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(product?.title || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [categories, setCategories] = useState<string[]>(
    getInitialCategories(product)
  );
  const [status, setStatus] = useState(product?.status || "stock");
  const [price, setPrice] = useState(String(product?.price ?? 0));
  const [costPrice, setCostPrice] = useState(
    String(product?.costPrice ?? 0)
  );
  const [oldPrice, setOldPrice] = useState(String(product?.oldPrice ?? 0));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [mainImage, setMainImage] = useState(product?.mainImage || "");
  const [images, setImages] = useState((product?.images || []).join("\n"));
  const [description, setDescription] = useState(product?.description || "");
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.isFeatured));
  const [isOffer, setIsOffer] = useState(Boolean(product?.isOffer));
  const [isWeeklyNew, setIsWeeklyNew] = useState(Boolean(product?.isWeeklyNew));
  const [isActive, setIsActive] = useState(
    product?.isActive === undefined ? true : Boolean(product.isActive)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateCategory(index: number, value: string) {
    setCategories((prev) => {
      const next = [...prev];
      next[index] = normalizeCategory(value);

      const cleanNext = Array.from(new Set(next.filter(Boolean)));

      return cleanNext.length > 0 ? cleanNext : ["cosplays"];
    });
  }

  function addCategoryField() {
    setCategories((prev) => {
      const usedCategories = new Set(prev);
      const nextCategory = CATEGORY_LIST.find(
        (category) => !usedCategories.has(category.slug)
      );

      if (!nextCategory) return prev;

      return [...prev, nextCategory.slug];
    });
  }

  function removeCategoryField(index: number) {
    setCategories((prev) => {
      if (prev.length === 1) return prev;

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage("");

      const cleanCategories = Array.from(
        new Set(categories.map(normalizeCategory).filter(Boolean))
      );

      const primaryCategory = cleanCategories[0] || "cosplays";

      const payload = {
        title,
        slug: slug || makeSlug(title),
        category: primaryCategory,
        categories: cleanCategories,
        status,
        price: Number(price),
        costPrice: Number(costPrice),
        oldPrice: Number(oldPrice),
        stock: Number(stock),
        mainImage,
        images: images
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        description,
        isFeatured,
        isOffer,
        isWeeklyNew,
        isActive,
      };

      const url =
        mode === "create" ? "/api/products" : `/api/products/${product?._id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "No se pudo guardar el producto.");
        return;
      }

      setMessage(
        mode === "create"
          ? "Producto creado correctamente."
          : "Producto actualizado correctamente."
      );

      if (mode === "create") {
        router.push(`/admin/productos/${data.product._id}`);
        router.refresh();
        return;
      }

      router.refresh();
    } catch {
      setMessage("Ocurrió un error guardando el producto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_30px_var(--shadow)] sm:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Nombre</label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);

              if (!product?.slug) {
                setSlug(makeSlug(e.target.value));
              }
            }}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          >
            <option value="stock">Stock</option>
            <option value="preventa">Preventa</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="block text-sm font-bold">Categoría</label>
              <p className="mt-1 text-xs font-semibold text-[var(--text-soft)]">
                El producto puede tener una categoría principal y categorías
                adicionales.
              </p>
            </div>

            <button
              type="button"
              onClick={addCategoryField}
              disabled={categories.length >= CATEGORY_LIST.length}
              className="inline-flex w-fit items-center justify-center rounded-full border border-[var(--primary)] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Agregar
            </button>
          </div>

          <div className="grid gap-3">
            {categories.map((category, index) => (
              <div
                key={`${category}-${index}`}
                className="rounded-2xl border border-[var(--border)] bg-white p-3 sm:p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                    {index === 0 ? "Principal" : `Extra ${index}`}
                  </span>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeCategoryField(index)}
                      className="text-xs font-bold text-[var(--danger)] transition hover:opacity-75"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <select
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-[var(--text)] outline-none"
                >
                  {CATEGORY_LIST.map((categoryOption) => (
                    <option
                      key={categoryOption.slug}
                      value={categoryOption.slug}
                    >
                      {categoryOption.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {categories.length > 1 && (
            <div className="mt-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-xs font-semibold text-[var(--text-soft)]">
              Este producto aparecerá en:{" "}
              <span className="font-extrabold text-[var(--text)]">
                {categories.map(getCategoryTitle).join(", ")}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Precio actual</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Costo producto
          </label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
            placeholder="Ej: 25"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Precio anterior
          </label>
          <input
            type="number"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
            placeholder="Opcional para ofertas"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">
            Imagen principal
          </label>
          <input
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">
            Imágenes adicionales
          </label>
          <textarea
            rows={5}
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="Una URL por línea"
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Descripción</label>
          <textarea
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <p className="mb-3 text-sm font-bold text-[var(--text)]">
            Secciones de la tienda
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
              />
              <span className="font-semibold">Oferta</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isWeeklyNew}
                onChange={(e) => setIsWeeklyNew(e.target.checked)}
              />
              <span className="font-semibold">Nuevo semanal</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span className="font-semibold">Producto destacado</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="font-semibold">Producto activo</span>
            </label>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold">
          {message}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
        >
          {loading
            ? "Guardando..."
            : mode === "create"
            ? "Crear producto"
            : "Guardar cambios"}
        </button>
      </div>
    </section>
  );
}