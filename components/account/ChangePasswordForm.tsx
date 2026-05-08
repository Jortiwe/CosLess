"use client";

import { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

function getPasswordScore(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

function getStrengthText(score: number) {
  if (score <= 1) return "Débil";
  if (score <= 3) return "Media";
  return "Fuerte";
}

function getStrengthColor(score: number) {
  if (score <= 1) return "bg-red-400";
  if (score <= 3) return "bg-amber-400";
  return "bg-emerald-500";
}

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const passwordScore = useMemo(
    () => getPasswordScore(newPassword),
    [newPassword]
  );

  const rules = [
    {
      label: "Mínimo 8 caracteres",
      valid: newPassword.length >= 8,
    },
    {
      label: "Una letra mayúscula",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Una letra minúscula",
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: "Un número",
      valid: /[0-9]/.test(newPassword),
    },
    {
      label: "Las contraseñas coinciden",
      valid: newPassword.length > 0 && newPassword === confirmPassword,
    },
  ];

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessageType("error");
      setMessage("Completa todos los campos.");
      return;
    }

    if (newPassword.length < 8) {
      setMessageType("error");
      setMessage("La nueva contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (currentPassword === newPassword) {
      setMessageType("error");
      setMessage("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/account/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(data.error || "No se pudo cambiar la contraseña.");
        return;
      }

      setMessageType("success");
      setMessage("Contraseña actualizada correctamente.");
      resetForm();
    } catch {
      setMessageType("error");
      setMessage("Ocurrió un error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-7 overflow-hidden rounded-[32px] border border-[#cfeaf6] bg-white shadow-[0_12px_35px_rgba(22,50,74,0.06)]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 bg-[#f7fdff] px-5 py-5 text-left transition hover:bg-[#eef9ff] sm:px-7"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf8ff] text-[#19b7c9]">
            <FiShield className="text-[1.35rem]" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#16324a]">
              Cambiar contraseña
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#4b6b80]">
              Actualiza tu contraseña de acceso.
            </p>
          </div>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#16324a] shadow-sm transition">
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 border-t border-[#e5f3fa] px-5 py-6 sm:px-7"
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Contraseña actual
                </label>

                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a98aa]" />

                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-[#f9fdff] pl-11 pr-12 text-[#16324a] outline-none transition focus:border-[#19b7c9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)]"
                    placeholder="Tu contraseña actual"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a98aa] transition hover:text-[#19b7c9]"
                  >
                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <FiKey className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a98aa]" />

                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-[#f9fdff] pl-11 pr-12 text-[#16324a] outline-none transition focus:border-[#19b7c9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)]"
                    placeholder="Nueva contraseña"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a98aa] transition hover:text-[#19b7c9]"
                  >
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <FiCheckCircle className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a98aa]" />

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-[#cfeaf6] bg-[#f9fdff] pl-11 pr-12 text-[#16324a] outline-none transition focus:border-[#19b7c9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,183,201,0.12)]"
                    placeholder="Repite la nueva contraseña"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a98aa] transition hover:text-[#19b7c9]"
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e5f3fa] bg-[#f9fdff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-[#16324a]">
                  Seguridad: {getStrengthText(passwordScore)}
                </p>

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Validación en tiempo real
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5f3fa]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getStrengthColor(
                    passwordScore
                  )}`}
                  style={{ width: `${Math.max(8, passwordScore * 20)}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {rules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition-all duration-300 ${
                      rule.valid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white text-[#6f8798]"
                    }`}
                  >
                    {rule.valid ? (
                      <FiCheckCircle className="shrink-0" />
                    ) : (
                      <FiXCircle className="shrink-0" />
                    )}

                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {message && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  messageType === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#19b7c9] px-7 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(25,183,201,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}