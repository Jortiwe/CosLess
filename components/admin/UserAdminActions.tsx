"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  userId: string;
  userName: string;
};

export default function UserAdminActions({ userId, userName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo eliminar el usuario.");
        return;
      }

      router.refresh();
    } catch {
      alert("Ocurrió un error eliminando el usuario.");
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