"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRole = "admin" | "customer";

type UserType = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
};

function normalizeInitialRole(role?: string): UserRole {
  if (role === "admin") return "admin";
  return "customer";
}

export default function UserEditForm({ user }: { user: UserType }) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [nickname, setNickname] = useState(user.nickname || "");
  const [role, setRole] = useState<UserRole>(normalizeInitialRole(user.role));
  const [isActive, setIsActive] = useState(user.isActive !== false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

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
        setMessageType("error");
        setMessage(data.error || "No se pudo actualizar el usuario.");
        return;
      }

      setMessageType("success");
      setMessage("Usuario actualizado correctamente.");
      router.refresh();
    } catch {
      setMessageType("error");
      setMessage("Ocurrió un error actualizando el usuario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_var(--shadow)]">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-[var(--text)]">
            Nombre completo
          </label>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--text)]">
            Correo
          </label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--text)]">
            Nickname
          </label>

          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--text)]">
            Rol
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
          >
            <option value="customer">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-4 text-[var(--text)]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />

          <span className="font-semibold">Usuario activo</span>
        </label>
      </div>

      {message && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-4 text-sm font-semibold ${
            messageType === "success"
              ? "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]"
              : "border-[var(--danger-bg-hover)] bg-[var(--danger-bg)] text-[var(--danger)]"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-[var(--cos-white)] transition hover:bg-[var(--primary-dark)] disabled:opacity-70"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </section>
  );
}