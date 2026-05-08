"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
  orderCode?: string;
};

export default function DeleteOrderButton({ orderId, orderCode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el pedido ${
        orderCode || ""
      }? Si ya descontó stock, se devolverá automáticamente.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo eliminar el pedido.");
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
      className="inline-flex rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}