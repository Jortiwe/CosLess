"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  newsId: string;
  title?: string;
};

export default function DeleteNewsButton({ newsId, title }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la novedad ${title || ""}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/news/${newsId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo eliminar la novedad.");
        return;
      }

      router.refresh();
    } catch {
      alert("Ocurrió un error eliminando la novedad.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-70"
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}