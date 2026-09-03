import Link from "next/link";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShoppingBag,
  FiLogOut,
  FiHeart,
} from "react-icons/fi";

type AccountSessionViewProps = {
  user: {
    userId: string;
    email: string;
    role: string;
    nickname: string;
    fullName: string;
    isAdmin: boolean;
  };
};

export default function AccountSessionView({
  user,
}: AccountSessionViewProps) {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <section className="mx-auto w-full max-w-[1450px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_var(--shadow)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-bold text-[var(--primary)]">
                Mi perfil
              </span>

              <h1 className="mt-4 text-4xl font-extrabold text-[var(--text)] sm:text-5xl">
                Hola, {user.nickname || user.fullName || "usuario"}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--text-soft)]">
                Aquí podrás revisar tus datos, pedidos, favoritos y opciones de
                tu cuenta.
              </p>
            </div>

            <a
              href="/api/auth/logout"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--danger)] px-6 py-4 text-sm font-bold text-white transition hover:opacity-90"
            >
              <FiLogOut />
              Cerrar sesión
            </a>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] bg-[var(--surface)] p-5 shadow-[0_8px_22px_var(--shadow)]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <FiUser className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Nickname
              </p>
              <p className="mt-2 text-xl font-extrabold text-[var(--text)]">
                {user.nickname || "Sin nickname"}
              </p>
            </div>

            <div className="rounded-[28px] bg-[var(--surface)] p-5 shadow-[0_8px_22px_var(--shadow)]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <FiMail className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Correo
              </p>
              <p className="mt-2 break-all text-base font-bold text-[var(--text)]">
                {user.email}
              </p>
            </div>

            <div className="rounded-[28px] bg-[var(--surface)] p-5 shadow-[0_8px_22px_var(--shadow)]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <FiShoppingBag className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Pedidos
              </p>
              <Link
                href="/account/orders"
                className="mt-2 inline-flex text-base font-extrabold text-[var(--text)] transition hover:text-[var(--primary)]"
              >
                Ver historial
              </Link>
            </div>

            <div className="rounded-[28px] bg-[var(--surface)] p-5 shadow-[0_8px_22px_var(--shadow)]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <FiHeart className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Favoritos
              </p>
              <Link
                href="/favoritos"
                className="mt-2 inline-flex text-base font-extrabold text-[var(--text)] transition hover:text-[var(--primary)]"
              >
                Ver favoritos
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href="/account/password"
              className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                  <FiLock className="text-[1.3rem]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text)]">
                    Cambiar contraseña
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-soft)]">
                    Actualiza tu contraseña de forma segura.
                  </p>
                </div>
              </div>
            </Link>

            {user.isAdmin && (
              <Link
                href="/admin"
                className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-6 transition hover:border-[var(--primary)] hover:bg-[var(--surface)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                    <FiUser className="text-[1.3rem]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text)]">
                      Panel admin
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-soft)]">
                      Ir al panel de control administrativo.
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}