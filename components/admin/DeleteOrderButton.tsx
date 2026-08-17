"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  orderId: string;
  orderCode?: string;
};

export default function DeleteOrderButton({ orderId, orderCode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el pedido "${
        orderCode || "sin código"
      }"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(data?.error || "No se pudo eliminar el pedido.");
        return;
      }

      router.refresh();
    } catch {
      alert("Ocurrió un error eliminando el pedido.");
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