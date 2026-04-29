import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { connectDB } from "../../lib/mongodb";
import User from "../../models/User";
import {
  FiHeart,
  FiLogOut,
  FiMail,
  FiShoppingBag,
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
      <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
        <Header />

        <section className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#cfeaf6] bg-white p-6 text-center shadow-[0_12px_35px_rgba(22,50,74,0.06)] sm:p-8">
            <span className="inline-flex items-center rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
              Mi perfil
            </span>

            <h1 className="mt-5 text-[2rem] font-extrabold leading-tight text-[#16324a] sm:text-[2.5rem]">
              Necesitas iniciar sesión
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#4b6b80]">
              Para ver tu perfil, primero inicia sesión o crea una cuenta.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/account"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#19b7c9] px-6 text-sm font-bold text-white transition hover:bg-[#0ea5b7]"
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
  const isAdmin =
    user.role === "admin" ||
    user.role === "superadmin" ||
    user.role === "superadministrador";

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_12px_35px_rgba(22,50,74,0.06)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#dff4ff] px-4 py-2 text-sm font-semibold text-[#19b7c9]">
                Mi perfil
              </span>

              <h1 className="mt-5 text-[2.3rem] font-extrabold leading-tight text-[#16324a] sm:text-[3rem] lg:text-[3.4rem]">
                Hola, {displayName}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4b6b80]">
                Aquí podrás revisar tus datos, pedidos, favoritos y opciones de
                tu cuenta.
              </p>
            </div>

            <a
              href="/api/auth/logout"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ef3347] px-7 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(239,51,71,0.18)] transition hover:bg-[#d62839]"
            >
              <FiLogOut />
              Cerrar sesión
            </a>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_24px_rgba(22,50,74,0.04)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiUser className="text-[1.35rem]" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#68839a]">
                Nickname
              </p>
              <p className="mt-2 break-words text-lg font-extrabold text-[#16324a]">
                {user.nickname || "Sin nickname"}
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_24px_rgba(22,50,74,0.04)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiMail className="text-[1.35rem]" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#68839a]">
                Correo
              </p>
              <p className="mt-2 break-words text-lg font-extrabold text-[#16324a]">
                {user.email || "Sin correo"}
              </p>
            </div>

            <Link
              href="/account/orders"
              className="rounded-[28px] bg-white p-6 shadow-[0_8px_24px_rgba(22,50,74,0.04)] transition hover:-translate-y-1 hover:text-[#19b7c9]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiShoppingBag className="text-[1.35rem]" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#68839a]">
                Pedidos
              </p>
              <p className="mt-2 text-lg font-extrabold">Ver historial</p>
            </Link>

            <Link
              href="/favoritos"
              className="rounded-[28px] bg-white p-6 shadow-[0_8px_24px_rgba(22,50,74,0.04)] transition hover:-translate-y-1 hover:text-[#19b7c9]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
                <FiHeart className="text-[1.35rem]" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#68839a]">
                Favoritos
              </p>
              <p className="mt-2 text-lg font-extrabold">Ver favoritos</p>
            </Link>
          </div>

          {isAdmin && (
            <div className="mt-7">
              <Link
                href="/admin"
                className="flex items-center gap-5 rounded-[28px] border border-[#bfefff] bg-[#eaf8ff] p-6 transition hover:border-[#19b7c9] hover:bg-white"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#19b7c9]">
                  <FiUser className="text-[1.45rem]" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[#16324a]">
                    Panel admin
                  </h2>
                  <p className="mt-1 text-sm text-[#4b6b80]">
                    Ir al panel de gestión principal.
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}