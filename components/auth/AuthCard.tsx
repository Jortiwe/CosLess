"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaGoogle, FaInstagram } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";

type Mode = "login" | "register";
type FieldState = "neutral" | "valid" | "invalid";

type AuthCardProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

function getFieldState(value: string, valid: boolean, touched: boolean) {
  if (!touched && !value.trim()) return "neutral";
  return valid ? "valid" : "invalid";
}

function getInputClass(state: FieldState) {
  const base =
    "w-full rounded-[18px] border bg-[var(--surface)] px-4 py-3 text-[15px] text-[var(--text)] outline-none transition duration-200 placeholder:text-[var(--text-muted)]";

  if (state === "valid") {
    return `${base} border-[var(--success)] focus:border-[var(--success)] focus:ring-2 focus:ring-[var(--success-bg)]`;
  }

  if (state === "invalid") {
    return `${base} border-[var(--danger)] focus:border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger-bg)]`;
  }

  return `${base} border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--surface-soft)]`;
}

function FloatingMessage({
  show,
  type,
  children,
}: {
  show: boolean;
  type: "valid" | "invalid" | "info";
  children: ReactNode;
}) {
  if (!show) return null;

  const classes =
    type === "valid"
      ? "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
      : type === "invalid"
      ? "border-[var(--danger-bg-hover)] bg-[var(--danger-bg)] text-[var(--danger)]"
      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]";

  return (
    <span
      className={`pointer-events-none absolute right-3 top-full z-20 mt-1 rounded-full border px-3 py-1 text-[11px] font-extrabold shadow-[0_8px_20px_var(--shadow-strong)] ${classes}`}
    >
      {children}
    </span>
  );
}

export default function AuthCard({ mode, onModeChange }: AuthCardProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState({
    nickname: false,
    fullName: false,
    email: false,
    password: false,
  });

  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevMessage, setShowDevMessage] = useState(false);

  const nicknameValid = mode === "login" || nickname.trim().length >= 3;
  const fullNameValid = mode === "login" || fullName.trim().length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid =
    mode === "login" ? password.trim().length > 0 : password.length >= 8;

  const nicknameState = getFieldState(
    nickname,
    nicknameValid,
    touched.nickname
  );

  const fullNameState = getFieldState(
    fullName,
    fullNameValid,
    touched.fullName
  );

  const emailState = getFieldState(email, emailValid, touched.email);

  const passwordState = getFieldState(
    password,
    passwordValid,
    touched.password
  );

  const socialBase =
    "flex items-center justify-center gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)]";

  const cardTitle =
    mode === "login" ? "Bienvenido de nuevo" : "Completa tus datos";

  function markTouched(field: keyof typeof touched) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    setTouched({
      nickname: true,
      fullName: true,
      email: true,
      password: true,
    });

    if (mode === "register" && !nicknameValid) {
      setErrorText("El nickname debe tener mínimo 3 caracteres.");
      return;
    }

    if (mode === "register" && !fullNameValid) {
      setErrorText("Escribe tu nombre completo.");
      return;
    }

    if (!emailValid) {
      setErrorText("Escribe un correo electrónico válido.");
      return;
    }

    if (!passwordValid) {
      setErrorText(
        mode === "login"
          ? "Escribe tu contraseña."
          : "La contraseña debe tener mínimo 8 caracteres."
      );
      return;
    }

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
          <div className="h-px flex-1 bg-[var(--border-soft)]" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            O continúa con redes
          </span>

          <div className="h-px flex-1 bg-[var(--border-soft)]" />
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
          <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[var(--text)]">
                Login rápido
              </p>

              <p className="mt-1 text-sm text-[var(--text-soft)]">
                Esta opción está en desarrollo por ahora.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDevMessage(false)}
              className="rounded-xl px-2 py-1 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--surface)]"
            >
              ✕
            </button>
          </div>
        )}

        <h1
          className={
            isMobile
              ? "text-[25px] font-extrabold leading-none tracking-[-0.045em] text-[var(--text)]"
              : "text-[42px] font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--text)] xl:text-[46px] 2xl:text-[50px]"
          }
        >
          {cardTitle}
        </h1>

        <form
          className={
            isMobile
              ? "mt-5 space-y-4"
              : mode === "register"
              ? "mt-4 space-y-2.5"
              : "mt-5 space-y-3"
          }
          onSubmit={handleSubmit}
        >
          {mode === "register" && (
            <>
              <div className="relative">
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                  Nickname
                </label>

                <input
                  type="text"
                  placeholder="Tu nickname"
                  className={getInputClass(nicknameState)}
                  value={nickname}
                  onBlur={() => markTouched("nickname")}
                  onChange={(e) => setNickname(e.target.value)}
                />

                <FloatingMessage
                  show={nicknameState === "valid"}
                  type="valid"
                >
                  Correcto
                </FloatingMessage>

                <FloatingMessage
                  show={nicknameState === "invalid"}
                  type="invalid"
                >
                  Mínimo 3 caracteres
                </FloatingMessage>
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                  Nombre completo
                </label>

                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  className={getInputClass(fullNameState)}
                  value={fullName}
                  onBlur={() => markTouched("fullName")}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <FloatingMessage
                  show={fullNameState === "valid"}
                  type="valid"
                >
                  Correcto
                </FloatingMessage>

                <FloatingMessage
                  show={fullNameState === "invalid"}
                  type="invalid"
                >
                  Escribe tu nombre
                </FloatingMessage>
              </div>
            </>
          )}

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className={getInputClass(emailState)}
              value={email}
              onBlur={() => markTouched("email")}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FloatingMessage show={emailState === "valid"} type="valid">
              Correo válido
            </FloatingMessage>

            <FloatingMessage show={emailState === "invalid"} type="invalid">
              Formato inválido
            </FloatingMessage>
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                className={`${getInputClass(passwordState)} pr-12`}
                value={password}
                onBlur={() => markTouched("password")}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[var(--text-muted)] transition hover:text-[var(--primary)]"
              >
                {showPassword ? (
                  <FiEyeOff className="text-[1.2rem]" />
                ) : (
                  <FiEye className="text-[1.2rem]" />
                )}
              </button>
            </div>

            <FloatingMessage show={passwordState === "valid"} type="valid">
              {mode === "login" ? "Lista" : "Contraseña válida"}
            </FloatingMessage>

            <FloatingMessage show={passwordState === "invalid"} type="invalid">
              {mode === "login" ? "Requerida" : "Mínimo 8 caracteres"}
            </FloatingMessage>
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Recuérdame
              </label>

              <button
                type="button"
                className="text-sm font-semibold text-[var(--primary)] underline underline-offset-4"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {errorText && (
            <div className="rounded-2xl border border-[var(--danger-bg-hover)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
              {errorText}
            </div>
          )}

          {successText && (
            <div className="rounded-2xl border border-[var(--success)] bg-[var(--success-bg)] px-4 py-3 text-sm font-medium text-[var(--success)]">
              {successText}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={
              isMobile
                ? "w-full rounded-[20px] bg-[var(--primary)] px-5 py-3.5 text-base font-bold text-white transition duration-200 hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                : "w-full rounded-2xl bg-[var(--primary)] px-5 py-3.5 text-base font-bold text-white transition duration-200 hover:scale-[1.01] hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
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
            <div className="pointer-events-none -mx-4 -mb-2 mt-4 h-10 bg-gradient-to-b from-transparent via-[var(--surface-soft)] to-[var(--bg)]" />
          )}
        </form>
      </>
    );
  }

  return (
    <>
      {/* MÓVIL */}
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-t-[30px] border border-[var(--border)] border-b-0 bg-[var(--surface-soft)] backdrop-blur-[2px]">
          <div className="grid h-[62px] grid-cols-2">
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className={`border-r border-[var(--border)] text-[15px] font-semibold transition ${
                mode === "login"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => onModeChange("register")}
              className={`text-[15px] font-semibold transition ${
                mode === "register"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
              }`}
            >
              Crear cuenta
            </button>
          </div>
        </div>

        <div className="rounded-b-[30px] border border-[var(--border)] border-t-0 bg-[var(--bg)] px-4 pb-6 pt-5 shadow-[0_12px_30px_var(--shadow)] backdrop-blur-[2px]">
          {renderFormContent(true)}
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block">
        <div className="w-full rounded-[34px] border border-[var(--border)] bg-[var(--surface)]/96 p-6 shadow-[0_18px_46px_var(--shadow)] backdrop-blur-md xl:p-7 2xl:p-8">
          <div className="rounded-full bg-[var(--surface-soft)] p-1.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onModeChange("login")}
                className={`h-[50px] rounded-full text-[15px] font-semibold transition-all xl:h-[52px] xl:text-[16px] ${
                  mode === "login"
                    ? "bg-[var(--primary)] text-white shadow-[0_8px_20px_var(--shadow-strong)]"
                    : "bg-transparent text-[var(--text-muted)]"
                }`}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => onModeChange("register")}
                className={`h-[50px] rounded-full text-[15px] font-semibold transition-all xl:h-[52px] xl:text-[16px] ${
                  mode === "register"
                    ? "bg-[var(--primary)] text-white shadow-[0_8px_20px_var(--shadow-strong)]"
                    : "bg-transparent text-[var(--text-muted)]"
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