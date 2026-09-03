"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  newsId: string;
  title?: string;
};

export default function DeleteNewsButton({ newsId, title }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la novedad "${
        title || "Sin título"
      }"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(data?.error || "No se pudo eliminar la novedad.");
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
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--danger-bg-hover)] bg-[var(--danger-bg)] px-4 py-2 text-sm font-extrabold text-[var(--danger)] transition hover:bg-[var(--danger-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiTrash2 />
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}