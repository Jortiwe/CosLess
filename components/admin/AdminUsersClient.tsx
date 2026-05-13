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
  if (role === "superadmin") return "bg-[#f2eaff] text-[#7c3aed]";
  if (role === "admin") return "bg-[#eaf8ff] text-[#19b7c9]";
  return "bg-[#f2f8fb] text-[#6f8798]";
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
    <main className="min-h-screen bg-[#eef9ff] px-4 py-6 text-[#16324a] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#16324a] sm:text-4xl">
            Gestión de usuarios
          </h1>

          <p className="mt-2 hidden text-[#4b6b80] sm:block">
            Lista de clientes y administradores del sistema.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-3 text-xs font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/admin/usuarios/reporte"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#cfeaf6] bg-white px-3 text-xs font-extrabold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9] sm:h-12 sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Reporte</span>
              <span className="hidden sm:inline">Reporte PDF</span>
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-[26px] border border-[#cfeaf6] bg-white p-3 shadow-[0_10px_26px_rgba(22,50,74,0.05)] sm:rounded-[30px] sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a98aa]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario..."
              className="h-12 w-full rounded-[20px] border border-[#cfeaf6] bg-[#f7fdff] pl-11 pr-4 text-sm font-semibold text-[#16324a] outline-none transition placeholder:text-[#8ba4b3] focus:border-[#19b7c9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)] sm:h-14"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs font-extrabold text-[#7a96a7]">
            <span>
              {filteredUsers.length} de {users.length} usuarios
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[#19b7c9] transition hover:text-[#0ea5b7]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <section className="rounded-[30px] border border-[#cfeaf6] bg-[#f7fdff] p-4 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:rounded-[32px] sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="rounded-[24px] bg-white px-4 py-6 text-sm font-semibold text-[#4b6b80]">
                No hay usuarios que coincidan con la búsqueda.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <article
                  key={user._id}
                  className="rounded-[24px] border border-transparent bg-white p-4 shadow-[0_8px_22px_rgba(22,50,74,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#19b7c9] hover:shadow-[0_12px_26px_rgba(22,50,74,0.08)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 text-[1rem] font-extrabold leading-5 text-[#16324a] sm:text-xl sm:leading-7">
                        {user.fullName || "Sin nombre"}
                      </h2>

                      <p className="mt-2 break-all text-sm text-[#4b6b80]">
                        {user.email || "Sin correo"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#6f8798] sm:text-sm">
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
                            ? "bg-[#e6f6ed] text-[#16824c]"
                            : "bg-[#fff0f2] text-[#d62839]"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <Link
                      href={`/admin/usuarios/${user._id}`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#19b7c9] px-4 text-xs font-extrabold text-white transition hover:bg-[#0ea5b7] sm:w-auto sm:text-sm"
                    >
                      Ver / Editar
                    </Link>

                    {canDeleteUsers && (
                      <div className="sm:[&_button]:!w-auto [&_button]:!h-11 [&_button]:!w-full [&_button]:!rounded-2xl [&_button]:!text-xs [&_button]:!font-extrabold sm:[&_button]:!text-sm">
                        <UserAdminActions
                          userId={user._id}
                          userName={
                            user.fullName || user.email || "Sin nombre"
                          }
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