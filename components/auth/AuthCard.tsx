"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaGoogle, FaInstagram } from "react-icons/fa";

type Mode = "login" | "register";

type AuthCardProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export default function AuthCard({ mode, onModeChange }: AuthCardProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevMessage, setShowDevMessage] = useState(false);

  const socialBase =
    "flex items-center justify-center gap-3 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 text-sm font-semibold text-[#16324a] transition duration-200 hover:-translate-y-0.5 hover:border-[#19b7c9] hover:text-[#19b7c9]";

  const inputBase =
    "w-full rounded-2xl border border-[#cfeaf6] bg-white px-5 py-3.5 text-[15px] text-[#16324a] outline-none transition duration-200 placeholder:text-[#6f8798] focus:border-[#19b7c9] focus:ring-2 focus:ring-[#bfefff]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    try {
      setLoading(true);

      if (mode === "login") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "No se pudo iniciar sesión.");
        }

        router.push(data.redirectTo || "/account");
        router.refresh();
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo crear la cuenta.");
      }

      setSuccessText("Cuenta creada correctamente.");
      router.push(data.redirectTo || "/account");
      router.refresh();
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Ocurrió un error."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSocialClick() {
    setShowDevMessage(true);
  }

  return (
    <div className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_35px_rgba(22,50,74,0.08)] xl:p-7">
      {showDevMessage && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-[#bfefff] bg-[#eaf8ff] px-4 py-3">
          <div>
            <p className="text-sm font-bold text-[#16324a]">Login rápido</p>
            <p className="mt-1 text-sm text-[#4b6b80]">
              Esta opción está en desarrollo por ahora.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDevMessage(false)}
            className="rounded-xl px-2 py-1 text-sm font-bold text-[#19b7c9] transition hover:bg-white"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex rounded-2xl bg-[#eaf8ff] p-1">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-[#19b7c9] text-white shadow"
              : "text-[#4b6b80] hover:text-[#16324a]"
          }`}
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={() => onModeChange("register")}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            mode === "register"
              ? "bg-[#19b7c9] text-white shadow"
              : "text-[#4b6b80] hover:text-[#16324a]"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <div className="mt-5">
        <h1 className="text-4xl font-extrabold text-[#16324a]">
          {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
        </h1>

        <p className="mt-3 text-base leading-7 text-[#4b6b80]">
          {mode === "login"
            ? "Entra a tu cuenta para ver tus pedidos, favoritos y perfil."
            : "Regístrate con correo y contraseña para guardar tu historial y tus favoritos."}
        </p>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#d9eef7]" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f8798]">
          O continúa con redes
        </span>
        <div className="h-px flex-1 bg-[#d9eef7]" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button type="button" className={socialBase} onClick={handleSocialClick}>
          <FaGoogle className="text-[1rem]" />
          <span>Google</span>
        </button>

        <button type="button" className={socialBase} onClick={handleSocialClick}>
          <FaFacebookF className="text-[0.95rem]" />
          <span>Facebook</span>
        </button>

        <button type="button" className={socialBase} onClick={handleSocialClick}>
          <FaInstagram className="text-[1rem]" />
          <span>Instagram</span>
        </button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16324a]">
                Nickname
              </label>
              <input
                type="text"
                placeholder="Tu nickname"
                className={inputBase}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16324a]">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                className={inputBase}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#16324a]">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            className={inputBase}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#16324a]">
            Contraseña
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              className={`${inputBase} pr-14`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6f8798] transition hover:text-[#19b7c9]"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        {mode === "login" && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 text-sm text-[#4b6b80]">
              <input type="checkbox" className="h-4 w-4 accent-[#19b7c9]" />
              Recuérdame
            </label>

            <button
              type="button"
              className="text-sm font-semibold text-[#19b7c9] underline underline-offset-4"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {errorText && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorText}
          </div>
        )}

        {successText && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successText}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-2xl bg-[#19b7c9] px-5 py-4 text-base font-bold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading
            ? mode === "login"
              ? "Entrando..."
              : "Creando cuenta..."
            : mode === "login"
            ? "Iniciar sesión"
            : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}