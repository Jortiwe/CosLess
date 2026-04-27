"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductType = {
  _id?: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  stock?: number;
  mainImage?: string;
  images?: string[];
  description?: string;
  isFeatured?: boolean;
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

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(product?.title || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [category, setCategory] = useState(product?.category || "cosplays");
  const [status, setStatus] = useState(product?.status || "stock");
  const [price, setPrice] = useState(String(product?.price ?? 0));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [mainImage, setMainImage] = useState(product?.mainImage || "");
  const [images, setImages] = useState((product?.images || []).join("\n"));
  const [description, setDescription] = useState(product?.description || "");
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.isFeatured));
  const [isActive, setIsActive] = useState(
    product?.isActive === undefined ? true : Boolean(product.isActive)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage("");

      const payload = {
        title,
        slug: slug || makeSlug(title),
        category,
        status,
        price: Number(price),
        stock: Number(stock),
        mainImage,
        images: images
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        description,
        isFeatured,
        isActive,
      };

      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${product?._id}`;

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
    <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
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
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          >
            <option value="cosplays">Cosplays</option>
            <option value="pelucas">Pelucas</option>
            <option value="lentes">Lentes</option>
            <option value="mallas">Mallas</option>
            <option value="accesorios">Accesorios</option>
            <option value="preventa">Preventa</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          >
            <option value="stock">Stock</option>
            <option value="preventa">Preventa</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Precio</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Imagen principal</label>
          <input
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
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
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Descripción</label>
          <textarea
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

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

      {message && (
        <div className="mt-5 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-sm font-semibold">
          {message}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
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