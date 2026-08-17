"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  productId: string;
  productTitle: string;
};

export default function ProductAdminActions({
  productId,
  productTitle,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el producto "${productTitle}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo eliminar el producto.");
        return;
      }

      router.refresh();
    } catch {
      alert("Ocurrió un error eliminando el producto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--danger-bg-hover)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--danger)] transition hover:bg-[var(--danger-bg)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiTrash2 />
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}