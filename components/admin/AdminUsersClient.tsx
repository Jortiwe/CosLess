"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import UserAdminActions from "./UserAdminActions";

type UserItem = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
};

type AdminUsersClientProps = {
  users: UserItem[];
  canDeleteUsers: boolean;
};

function roleLabel(role?: string) {
  if (role === "superadmin") return "SUPERADMIN";
  if (role === "admin") return "ADMIN";
  return "CUSTOMER";
}

function roleVisualClass(role?: string) {
  if (role === "superadmin") {
    return "bg-[var(--featured-bg)] text-[var(--featured)]";
  }

  if (role === "admin") {
    return "bg-[var(--surface-soft)] text-[var(--primary)]";
  }

  return "bg-[var(--surface-soft)] text-[var(--text-muted)]";
}

export default function AdminUsersClient({
  users,
  canDeleteUsers,
}: AdminUsersClientProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      const searchableText = [
        user.fullName,
        user.email,
        user.nickname,
        roleLabel(user.role),
        user.isActive ? "activo" : "inactivo",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [users, search]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
            Gestión de usuarios
          </h1>

          <p className="mt-2 hidden text-[var(--text-soft)] sm:block">
            Lista de clientes y administradores del sistema.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/admin/usuarios/reporte"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Reporte</span>
              <span className="hidden sm:inline">Reporte PDF</span>
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_26px_var(--shadow)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario..."
              className="h-12 w-full rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)] sm:h-14"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[var(--text-muted)]">
            <span>
              {filteredUsers.length} de {users.length} usuarios
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[var(--primary)] transition hover:text-[var(--primary-dark)]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="rounded-[24px] bg-[var(--surface)] px-4 py-6 text-sm font-semibold text-[var(--text-soft)]">
                No hay usuarios que coincidan con la búsqueda.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <article
                  key={user._id}
                  className="rounded-[24px] border border-transparent bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[0_12px_26px_var(--shadow-strong)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 text-[1rem] font-extrabold leading-5 text-[var(--text)] sm:text-xl sm:leading-7">
                        {user.fullName || "Sin nombre"}
                      </h2>

                      <p className="mt-2 break-all text-sm text-[var(--text-soft)]">
                        {user.email || "Sin correo"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--text-muted)] sm:text-sm">
                        Nickname: {user.nickname || "Sin nickname"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] sm:text-xs ${roleVisualClass(
                          user.role
                        )}`}
                      >
                        {roleLabel(user.role)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] sm:text-xs ${
                          user.isActive
                            ? "bg-[var(--success-bg)] text-[var(--success)]"
                            : "bg-[var(--danger-bg)] text-[var(--danger)]"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <Link
                      href={`/admin/usuarios/${user._id}`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-xs font-extrabold text-white transition hover:bg-[var(--primary-dark)] sm:w-auto sm:text-sm"
                    >
                      Ver / Editar
                    </Link>

                    {canDeleteUsers && (
                      <div className="sm:[&_button]:!w-auto [&_button]:!h-11 [&_button]:!w-full [&_button]:!rounded-2xl [&_button]:!text-xs [&_button]:!font-extrabold sm:[&_button]:!text-sm">
                        <UserAdminActions
                          userId={user._id}
                          userName={user.fullName || user.email || "Sin nombre"}
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}