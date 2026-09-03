import Link from "next/link";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import PrintReportButton from "../../../../components/admin/PrintReportButton";

export const dynamic = "force-dynamic";

type UserItem = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
};

function roleLabel(role?: string) {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Admin";
  return "Cliente";
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function UsersReportPage() {
  await connectDB();

  const rawUsers = await User.find().sort({ createdAt: -1 }).lean();
  const users = JSON.parse(JSON.stringify(rawUsers)) as UserItem[];

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const customers = users.filter((user) => user.role === "customer").length;
  const admins = users.filter((user) => user.role === "admin").length;
  const superadmins = users.filter((user) => user.role === "superadmin").length;

  const today = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-8 text-[var(--text)] print:bg-[var(--cos-white)] print:px-0 print:py-0">
      <div className="mx-auto max-w-[1200px] print:max-w-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin/usuarios"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            ← Volver a usuarios
          </Link>

          <PrintReportButton />
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_14px_40px_var(--shadow)] print:rounded-none print:border-0 print:shadow-none">
          <header className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-8 py-7 print:bg-[var(--cos-white)]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-[2.3rem] font-black leading-none tracking-wide text-[var(--primary)]">
                  CosLess
                </div>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-soft)]">
                  Cosplay Store
                </p>

                <h1 className="mt-7 text-3xl font-black text-[var(--text)]">
                  Reporte de usuarios
                </h1>

                <p className="mt-2 text-sm font-semibold text-[var(--text-soft)]">
                  Listado general de clientes y administradores registrados en
                  el sistema.
                </p>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-right">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Fecha
                </p>

                <p className="mt-1 text-sm font-black text-[var(--text)]">
                  {today}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Usuarios
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--primary)]">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--success-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--success)]">
                Activos
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--success)]">
                {activeUsers}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--danger-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--danger)]">
                Inactivos
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--danger)]">
                {inactiveUsers}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Clientes
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--text-muted)]">
                {customers}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-soft)]">
                Admins
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--primary)]">
                {admins}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--featured-bg)] px-4 py-4">
              <p className="text-xs font-bold text-[var(--featured)]">
                Superadmins
              </p>
              <p className="mt-1 text-2xl font-black text-[var(--featured)]">
                {superadmins}
              </p>
            </div>
          </section>

          <section className="px-8 pb-8">
            <div className="overflow-hidden rounded-[24px] border border-[var(--border-soft)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--surface-soft)] text-[var(--text)]">
                  <tr>
                    <th className="px-4 py-3 font-black">Nombre</th>
                    <th className="px-4 py-3 font-black">Correo</th>
                    <th className="px-4 py-3 font-black">Nickname</th>
                    <th className="px-4 py-3 font-black">Rol</th>
                    <th className="px-4 py-3 font-black">Estado</th>
                    <th className="px-4 py-3 font-black">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center font-bold text-[var(--text-soft)]"
                      >
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t border-[var(--border-soft)]"
                      >
                        <td className="px-4 py-3 font-bold text-[var(--text)]">
                          {user.fullName || "Sin nombre"}
                        </td>

                        <td className="px-4 py-3 text-[var(--text-soft)]">
                          {user.email || "Sin correo"}
                        </td>

                        <td className="px-4 py-3 text-[var(--text-soft)]">
                          {user.nickname || "Sin nickname"}
                        </td>

                        <td className="px-4 py-3 font-bold text-[var(--primary)]">
                          {roleLabel(user.role)}
                        </td>

                        <td className="px-4 py-3 text-[var(--text-soft)]">
                          {user.isActive ? "Activo" : "Inactivo"}
                        </td>

                        <td className="px-4 py-3 text-[var(--text-soft)]">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-8 py-5 text-center print:bg-[var(--cos-white)]">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Reporte generado por CosLess · Sistema interno de administración
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}