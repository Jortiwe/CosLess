"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminToolbar() {
  const router = useRouter();
  const [loading, setLoading] = useState<"logout" | "store" | null>(null);

  async function handleLogout() {
    try {
      setLoading("logout");

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function handleGoStore() {
    setLoading("store");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleGoStore}
        disabled={loading !== null}
        className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] disabled:opacity-70"
      >
        {loading === "store" ? "Abriendo..." : "Ver tienda"}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loading !== null}
        className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-red-300 hover:text-red-500 disabled:opacity-70"
      >
        {loading === "logout" ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </div>
  );
}