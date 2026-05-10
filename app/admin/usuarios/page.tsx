import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import AdminBackButton from "../../../components/admin/AdminBackButton";
import UserAdminActions from "../../../components/admin/UserAdminActions";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

type TokenPayload = {
  userId?: string;
  email?: string;
  role?: string;
};

type UserItem = {
  _id: string;
  fullName?: string;
  email?: string;
  nickname?: string;
  role?: string;
  isActive?: boolean;
};

function roleLabel(role?: string) {
  if (role === "superadmin") return "SUPERADMIN";
  if (role === "admin") return "ADMIN";
  return "CUSTOMER";
}

async function getCurrentUserRole() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cosless_token")?.value;

    if (!token) return "customer";

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    await connectDB();

    if (decoded.userId) {
      const currentUser = await User.findById(decoded.userId).lean();
      return String(currentUser?.role || decoded.role || "customer");
    }

    if (decoded.email) {
      const currentUser = await User.findOne({
        email: decoded.email.toLowerCase().trim(),
      }).lean();

      return String(currentUser?.role || decoded.role || "customer");
    }

    return String(decoded.role || "customer");
  } catch {
    return "customer";
  }
}

export default async function AdminUsersPage() {
  await connectDB();

  const [rawUsers, currentRole] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    getCurrentUserRole(),
  ]);

  const users = JSON.parse(JSON.stringify(rawUsers)) as UserItem[];
  const canDeleteUsers = currentRole === "superadmin";

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

          <div className="flex flex-wrap gap-3">
            <AdminBackButton />

            <Link
              href="/admin/usuarios/reporte"
              className="rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3 text-sm font-bold text-[#16324a] transition hover:border-[#19b7c9] hover:text-[#19b7c9]"
            >
              Reporte PDF
            </Link>
          </div>
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
                  className="rounded-[24px] bg-white p-5 shadow-[0_8px_22px_rgba(22,50,74,0.04)]"
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
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                          user.role === "superadmin"
                            ? "bg-[#f2eaff] text-[#7c3aed]"
                            : user.role === "admin"
                            ? "bg-[#eaf8ff] text-[#19b7c9]"
                            : "bg-[#f2f8fb] text-[#6f8798]"
                        }`}
                      >
                        {roleLabel(user.role)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                          user.isActive
                            ? "bg-[#e6f6ed] text-[#16824c]"
                            : "bg-[#fff0f2] text-[#d62839]"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/usuarios/${user._id}`}
                      className="rounded-xl bg-[#19b7c9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
                    >
                      Ver / Editar
                    </Link>

                    {canDeleteUsers && (
                      <UserAdminActions
                        userId={user._id}
                        userName={user.fullName || user.email || "Sin nombre"}
                      />
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