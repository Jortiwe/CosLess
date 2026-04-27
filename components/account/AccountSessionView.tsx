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
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1450px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[36px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.06)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-bold text-[#19b7c9]">
                Mi perfil
              </span>

              <h1 className="mt-4 text-4xl font-extrabold text-[#16324a] sm:text-5xl">
                Hola, {user.nickname || user.fullName || "usuario"}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-8 text-[#4b6b80]">
                Aquí podrás revisar tus datos, pedidos, favoritos y opciones de
                tu cuenta.
              </p>
            </div>

            <a
              href="/api/auth/logout"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e63946] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#d62839]"
            >
              <FiLogOut />
              Cerrar sesión
            </a>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] bg-white p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiUser className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#7a909c]">
                Nickname
              </p>
              <p className="mt-2 text-xl font-extrabold text-[#16324a]">
                {user.nickname || "Sin nickname"}
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiMail className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#7a909c]">
                Correo
              </p>
              <p className="mt-2 break-all text-base font-bold text-[#16324a]">
                {user.email}
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiShoppingBag className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#7a909c]">
                Pedidos
              </p>
              <Link
                href="/account/orders"
                className="mt-2 inline-flex text-base font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
              >
                Ver historial
              </Link>
            </div>

            <div className="rounded-[28px] bg-white p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiHeart className="text-[1.35rem]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#7a909c]">
                Favoritos
              </p>
              <Link
                href="/favoritos"
                className="mt-2 inline-flex text-base font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
              >
                Ver favoritos
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href="/account/password"
              className="rounded-[28px] border border-[#cfeaf6] bg-white p-6 transition hover:border-[#19b7c9] hover:bg-[#faffff]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                  <FiLock className="text-[1.3rem]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#16324a]">
                    Cambiar contraseña
                  </h2>
                  <p className="mt-1 text-sm text-[#4b6b80]">
                    Actualiza tu contraseña de forma segura.
                  </p>
                </div>
              </div>
            </Link>

            {user.isAdmin && (
              <Link
                href="/admin"
                className="rounded-[28px] border border-[#bfefff] bg-[#eaf8ff] p-6 transition hover:border-[#19b7c9] hover:bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#19b7c9]">
                    <FiUser className="text-[1.3rem]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#16324a]">
                      Panel admin
                    </h2>
                    <p className="mt-1 text-sm text-[#4b6b80]">
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