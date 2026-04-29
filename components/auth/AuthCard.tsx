"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaGoogle, FaInstagram } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

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

  const inputBase =
    "w-full rounded-[18px] border border-[#cfeaf6] bg-white px-4 py-3 text-[15px] text-[#16324a] outline-none transition duration-200 placeholder:text-[#6f8798] focus:border-[#19b7c9] focus:ring-2 focus:ring-[#bfefff]";

  const socialBase =
    "flex items-center justify-center gap-2 rounded-[18px] border border-[#cfeaf6] bg-white text-[#16324a] transition duration-200 hover:-translate-y-0.5 hover:border-[#19b7c9] hover:text-[#19b7c9]";

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

  function renderSocialBlock(isMobile: boolean) {
    return (
      <div className={isMobile ? "pt-2" : "pt-1"}>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#d9eef7]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f8798]">
            O continúa con redes
          </span>
          <div className="h-px flex-1 bg-[#d9eef7]" />
        </div>

        {isMobile ? (
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleSocialClick}
              className={`${socialBase} h-12 text-[1.05rem]`}
            >
              <FaGoogle />
            </button>

            <button
              type="button"
              onClick={handleSocialClick}
              className={`${socialBase} h-12 text-[1.05rem]`}
            >
              <FaFacebookF />
            </button>

            <button
              type="button"
              onClick={handleSocialClick}
              className={`${socialBase} h-12 text-[1.05rem]`}
            >
              <FaInstagram />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleSocialClick}
              className={`${socialBase} px-4 py-3 text-sm font-semibold`}
            >
              <FaGoogle className="text-[1rem]" />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleSocialClick}
              className={`${socialBase} px-4 py-3 text-sm font-semibold`}
            >
              <FaFacebookF className="text-[0.95rem]" />
              <span>Facebook</span>
            </button>

            <button
              type="button"
              onClick={handleSocialClick}
              className={`${socialBase} px-4 py-3 text-sm font-semibold`}
            >
              <FaInstagram className="text-[1rem]" />
              <span>Instagram</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderFormContent(isMobile: boolean) {
    return (
      <>
        {showDevMessage && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-[#bfefff] bg-[#eaf8ff] px-4 py-3">
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

        <h1
          className={
            isMobile
              ? "text-[25px] font-extrabold leading-none tracking-[-0.045em] text-[#16324a]"
              : "text-[58px] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#16324a]"
          }
        >
          {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
        </h1>

        <form
          className={isMobile ? "mt-5 space-y-4" : "mt-6 space-y-4"}
          onSubmit={handleSubmit}
        >
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
                className={`${inputBase} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#6f8798] transition hover:text-[#19b7c9]"
              >
                {showPassword ? (
                  <FiEyeOff className="text-[1.2rem]" />
                ) : (
                  <FiEye className="text-[1.2rem]" />
                )}
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
            className={
              isMobile
                ? "w-full rounded-[20px] bg-[#19b7c9] px-5 py-3.5 text-base font-bold text-white transition duration-200 hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-70"
                : "w-full rounded-2xl bg-[#19b7c9] px-5 py-3.5 text-base font-bold text-white transition duration-200 hover:scale-[1.01] hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-70"
            }
          >
            {loading
              ? mode === "login"
                ? "Entrando..."
                : "Creando cuenta..."
              : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>

          {renderSocialBlock(isMobile)}

          {isMobile && (
            <div className="pointer-events-none -mx-4 -mb-2 mt-4 h-10 bg-gradient-to-b from-transparent via-[#e9f7fd]/72 to-[#eef9ff]/95" />
          )}
        </form>
      </>
    );
  }

  return (
    <>
      {/* MÓVIL */}
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-t-[30px] border border-[#b8dceb] border-b-0 bg-[#eaf7fd]/92 backdrop-blur-[2px]">
          <div className="grid h-[62px] grid-cols-2">
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className={`border-r border-[#b8dceb] text-[15px] font-semibold transition ${
                mode === "login"
                  ? "bg-[#28b8cd] text-white"
                  : "bg-[#eaf7fd]/96 text-[#5f7890]"
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => onModeChange("register")}
              className={`text-[15px] font-semibold transition ${
                mode === "register"
                  ? "bg-[#28b8cd] text-white"
                  : "bg-[#eaf7fd]/96 text-[#5f7890]"
              }`}
            >
              Crear cuenta
            </button>
          </div>
        </div>

        <div className="rounded-b-[30px] border border-[#b8dceb] border-t-0 bg-[#eef9ff]/94 px-4 pb-6 pt-5 shadow-[0_12px_30px_rgba(20,58,93,0.08)] backdrop-blur-[2px]">
          {renderFormContent(true)}
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block">
        <div className="w-full rounded-[34px] border border-[#cfeaf6] bg-[#f7fcff] p-8">
          <div className="rounded-full bg-[#e2f3fb] p-2">
  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => onModeChange("login")}
      className={`h-[58px] rounded-full text-[16px] font-semibold transition-all xl:h-[60px] xl:text-[17px] ${
        mode === "login"
          ? "bg-[#26b8cb] text-white shadow-[0_8px_20px_rgba(38,184,203,0.18)]"
          : "bg-transparent text-[#5f7890]"
      }`}
    >
      Iniciar sesión
    </button>

    <button
      type="button"
      onClick={() => onModeChange("register")}
      className={`h-[58px] rounded-full text-[16px] font-semibold transition-all xl:h-[60px] xl:text-[17px] ${
        mode === "register"
          ? "bg-[#26b8cb] text-white shadow-[0_8px_20px_rgba(38,184,203,0.18)]"
          : "bg-transparent text-[#5f7890]"
      }`}
    >
      Crear cuenta
    </button>
  </div>
</div>

          {renderFormContent(false)}
        </div>
      </div>
    </>
  );
}