import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ChangePasswordForm from "../../components/account/ChangePasswordForm";
import { connectDB } from "../../lib/mongodb";
import User from "../../models/User";
import {
  FiClipboard,
  FiHeart,
  FiLogOut,
  FiMail,
  FiUser,
} from "react-icons/fi";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "cosless_dev_secret";

type TokenPayload = {
  email?: string;
};

type SessionUser = {
  _id: string;
  nickname?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

function getInitials(name?: string) {
  const value = String(name || "U").trim();

  if (!value) return "U";

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cosless_token")?.value;

  let user: SessionUser | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      if (decoded.email) {
        await connectDB();

        const rawUser = await User.findOne({ email: decoded.email }).lean();

        if (rawUser) {
          user = JSON.parse(JSON.stringify(rawUser)) as SessionUser;
        }
      }
    } catch {
      user = null;
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Header />

        <section className="mx-auto w-full max-w-[760px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[0_12px_32px_var(--shadow)] sm:p-8">
            <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--text)] sm:text-[2.5rem]">
              Necesitas iniciar sesión
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
              Para ver tu perfil, primero inicia sesión o crea una cuenta.
            </p>

            <div className="mt-6">
              <Link
                href="/account"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--primary)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)]"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  const displayName = user.nickname || user.fullName || "Mi cuenta";
  const initials = getInitials(displayName);
  const isAdmin = user.role === "admin";

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-start">
          <Link
            href="/"
            className="group relative inline-flex items-center text-sm font-extrabold text-[var(--text)] transition hover:text-[var(--primary)]"
          >
            <span className="mr-1">←</span>
            Inicio
            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_32px_var(--shadow)] sm:rounded-[34px] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-[var(--surface-soft)] text-xl font-black text-[var(--primary)] sm:h-20 sm:w-20 sm:text-2xl">
                {initials}
              </div>

              <div className="min-w-0">
                <h1 className="text-[1.9rem] font-extrabold leading-tight text-[var(--text)] sm:text-[2.7rem]">
                  Hola, {displayName}
                </h1>

                <p className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-[var(--text-soft)]">
                  <FiMail className="shrink-0 text-[var(--primary)]" />
                  {user.email || "Sin correo"}
                </p>
              </div>
            </div>

            <a
              href="/api/auth/logout"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--danger)] px-5 text-sm font-extrabold text-white shadow-[0_12px_28px_var(--shadow)] transition hover:opacity-90"
            >
              <FiLogOut />
              Cerrar sesión
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_26px_var(--shadow)] sm:p-6 lg:col-span-1">
            <h2 className="text-xl font-extrabold text-[var(--text)]">
              Datos de cuenta
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                    <FiUser className="text-[1.2rem]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Nickname
                    </p>

                    <p className="mt-1 break-words text-base font-extrabold text-[var(--text)]">
                      {user.nickname || "Sin nickname"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                    <FiMail className="text-[1.2rem]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Correo
                    </p>

                    <p className="mt-1 break-all text-base font-extrabold text-[var(--text)]">
                      {user.email || "Sin correo"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/account/orders"
            className="group rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_26px_var(--shadow)] transition hover:-translate-y-1 hover:border-[var(--primary)] sm:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <FiClipboard className="text-[1.25rem]" />
            </div>

            <p className="mt-5 text-lg font-extrabold text-[var(--text)] group-hover:text-[var(--primary)]">
              Pedidos
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">
              Ver historial de pedidos.
            </p>
          </Link>

          <Link
            href="/favoritos"
            className="group rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_26px_var(--shadow)] transition hover:-translate-y-1 hover:border-[var(--primary)] sm:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <FiHeart className="text-[1.25rem]" />
            </div>

            <p className="mt-5 text-lg font-extrabold text-[var(--text)] group-hover:text-[var(--primary)]">
              Favoritos
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">
              Ver productos guardados.
            </p>
          </Link>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex min-h-[126px] items-center gap-4 rounded-[30px] border border-[var(--border)] bg-[var(--surface-soft)] p-5 shadow-[0_10px_26px_var(--shadow)] transition hover:border-[var(--primary)] hover:bg-[var(--surface)] sm:p-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                <FiUser className="text-[1.35rem]" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[var(--text)]">
                  Panel admin
                </h2>

                <p className="mt-1 text-sm text-[var(--text-soft)]">
                  Ir al panel de gestión.
                </p>
              </div>
            </Link>
          )}

          <ChangePasswordForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}