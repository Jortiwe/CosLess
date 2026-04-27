import Link from "next/link";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import AdminBackButton from "../../../components/admin/AdminBackButton";

type UserItem = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
};

export default async function AdminUsersPage() {
  await connectDB();

  const rawUsers = await User.find().sort({ createdAt: -1 }).lean();
  const users = JSON.parse(JSON.stringify(rawUsers)) as UserItem[];

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Gestión de usuarios</h1>
            <p className="mt-2 text-[#4b6b80]">
              Lista de clientes y administradores del sistema.
            </p>
          </div>

          <AdminBackButton />
        </div>

        <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="rounded-2xl bg-white px-4 py-6 text-sm text-[#4b6b80]">
                No hay usuarios todavía.
              </div>
            ) : (
              users.map((user) => (
                <article
                  key={user._id}
                  className="rounded-[24px] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold">
                        {user.fullName || "Sin nombre"}
                      </h2>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        {user.email || "Sin correo"}
                      </p>

                      <p className="mt-2 text-sm text-[#4b6b80]">
                        Nickname: {user.nickname || "Sin nickname"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#19b7c9]">
                        {user.role || "Sin rol"}
                      </span>

                      <span className="rounded-full bg-[#f2f8fb] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6f8798]">
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/usuarios/${user._id}`}
                      className="rounded-xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white"
                    >
                      Editar
                    </Link>

                    <Link
                      href={`/admin/usuarios/${user._id}`}
                      className="rounded-xl border border-[#cfeaf6] bg-white px-4 py-2 text-sm font-bold text-[#16324a]"
                    >
                      Ver detalle
                    </Link>
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