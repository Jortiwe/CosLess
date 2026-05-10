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
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-[1200px] print:max-w-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin/usuarios"
            className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
          >
            ← Volver a usuarios
          </Link>

          <PrintReportButton />
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#cfeaf6] bg-white shadow-[0_14px_40px_rgba(22,50,74,0.08)] print:rounded-none print:border-0 print:shadow-none">
          <header className="border-b border-[#d9eef7] bg-[#f7fdff] px-8 py-7 print:bg-white">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-[2.3rem] font-black leading-none tracking-wide text-[#19b7c9]">
                  CosLess
                </div>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-[#4b6b80]">
                  Cosplay Store
                </p>

                <h1 className="mt-7 text-3xl font-black text-[#16324a]">
                  Reporte de usuarios
                </h1>

                <p className="mt-2 text-sm font-semibold text-[#4b6b80]">
                  Listado general de clientes y administradores registrados en
                  el sistema.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#cfeaf6] bg-white px-5 py-4 text-right">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f8798]">
                  Fecha
                </p>

                <p className="mt-1 text-sm font-black text-[#16324a]">
                  {today}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] bg-[#eaf8ff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Usuarios</p>
              <p className="mt-1 text-2xl font-black text-[#19b7c9]">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#e6f6ed] px-4 py-4">
              <p className="text-xs font-bold text-[#326b4d]">Activos</p>
              <p className="mt-1 text-2xl font-black text-[#16824c]">
                {activeUsers}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#fff0f2] px-4 py-4">
              <p className="text-xs font-bold text-[#9d3040]">Inactivos</p>
              <p className="mt-1 text-2xl font-black text-[#d62839]">
                {inactiveUsers}
              </p>
            </div>
          </section>

          <section className="grid gap-4 px-8 pb-6 sm:grid-cols-3 print:grid-cols-3">
            <div className="rounded-[22px] bg-[#f8fdff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Clientes</p>
              <p className="mt-1 text-2xl font-black text-[#6f8798]">
                {customers}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#eaf8ff] px-4 py-4">
              <p className="text-xs font-bold text-[#4b6b80]">Admins</p>
              <p className="mt-1 text-2xl font-black text-[#19b7c9]">
                {admins}
              </p>
            </div>

            <div className="rounded-[22px] bg-[#f2eaff] px-4 py-4">
              <p className="text-xs font-bold text-[#5d36a5]">Superadmins</p>
              <p className="mt-1 text-2xl font-black text-[#7c3aed]">
                {superadmins}
              </p>
            </div>
          </section>

          <section className="px-8 pb-8">
            <div className="overflow-hidden rounded-[24px] border border-[#d9eef7]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#eaf8ff] text-[#16324a]">
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
                        className="px-4 py-6 text-center font-bold text-[#4b6b80]"
                      >
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t border-[#e5f3fa]"
                      >
                        <td className="px-4 py-3 font-bold text-[#16324a]">
                          {user.fullName || "Sin nombre"}
                        </td>

                        <td className="px-4 py-3 text-[#4b6b80]">
                          {user.email || "Sin correo"}
                        </td>

                        <td className="px-4 py-3 text-[#4b6b80]">
                          {user.nickname || "Sin nickname"}
                        </td>

                        <td className="px-4 py-3 font-bold text-[#19b7c9]">
                          {roleLabel(user.role)}
                        </td>

                        <td className="px-4 py-3">
                          {user.isActive ? "Activo" : "Inactivo"}
                        </td>

                        <td className="px-4 py-3 text-[#4b6b80]">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="border-t border-[#d9eef7] bg-[#f7fdff] px-8 py-5 text-center print:bg-white">
            <p className="text-xs font-semibold text-[#6f8798]">
              Reporte generado por CosLess · Sistema interno de administración
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}