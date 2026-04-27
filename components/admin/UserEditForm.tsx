"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserType = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
};

export default function UserEditForm({ user }: { user: UserType }) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [nickname, setNickname] = useState(user.nickname || "");
  const [role, setRole] = useState(user.role || "user");
  const [isActive, setIsActive] = useState(user.isActive !== false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          nickname,
          role,
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "No se pudo actualizar el usuario.");
        return;
      }

      setMessage("Usuario actualizado correctamente.");
      router.refresh();
    } catch {
      setMessage("Ocurrió un error actualizando el usuario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Nombre completo</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Correo</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          >
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="font-semibold">Usuario activo</span>
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
          onClick={handleSave}
          disabled={loading}
          className="rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-bold text-white disabled:opacity-70"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </section>
  );
}