"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NewsItem = {
  _id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  image?: string;
  isPublished?: boolean;
};

type Props = {
  mode: "create" | "edit";
  news?: NewsItem;
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9áéíóúñü-]/gi, "")
    .replace(/-+/g, "-");
}

export default function NewsForm({ mode, news }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(news?.title || "");
  const [slug, setSlug] = useState(news?.slug || "");
  const [summary, setSummary] = useState(news?.summary || "");
  const [content, setContent] = useState(news?.content || "");
  const [image, setImage] = useState(news?.image || "");
  const [isPublished, setIsPublished] = useState(news?.isPublished !== false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);

    if (mode === "create" && !slug) {
      setSlug(createSlug(value));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || !content.trim()) {
      setMessage("El título y el contenido son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      const url =
        mode === "edit" && news?._id ? `/api/news/${news._id}` : "/api/news";

      const response = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: slug || createSlug(title),
          summary,
          content,
          image,
          isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo guardar la novedad.");
        return;
      }

      router.push("/admin/novedades");
      router.refresh();
    } catch {
      setMessage("Ocurrió un error guardando la novedad.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]"
    >
      <div className="grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Título
          </label>
          <input
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Ej. Llegaron nuevas lentillas azules y violetas"
            className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 outline-none focus:border-[#19b7c9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Slug
          </label>
          <input
            value={slug}
            onChange={(event) => setSlug(createSlug(event.target.value))}
            placeholder="llegaron-nuevas-lentillas"
            className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 outline-none focus:border-[#19b7c9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Resumen corto
          </label>
          <input
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Texto breve que aparecerá en la lista de novedades."
            className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 outline-none focus:border-[#19b7c9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Imagen
          </label>
          <input
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="/images/news/lentillas.png o URL directa de imagen"
            className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 outline-none focus:border-[#19b7c9]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Contenido
          </label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escribe aquí la novedad completa..."
            className="min-h-[220px] w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none focus:border-[#19b7c9]"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 font-bold text-[#16324a]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          Publicar novedad
        </label>

        {message && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded-2xl bg-[#19b7c9] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#0ea5b7] disabled:opacity-70"
        >
          {loading
            ? "Guardando..."
            : mode === "edit"
            ? "Guardar cambios"
            : "Crear novedad"}
        </button>
      </div>
    </form>
  );
}