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
  if (score <= 1) return "bg-[var(--danger)]";
  if (score <= 3) return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
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
    <section className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_26px_var(--shadow)]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex min-h-[126px] w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[var(--surface-soft)] sm:px-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
            <FiShield className="text-[1.35rem]" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[var(--text)]">
              Cambiar contraseña
            </h2>

            <p className="mt-1 text-sm text-[var(--text-soft)]">
              Actualiza tu contraseña de acceso.
            </p>
          </div>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--text)] shadow-sm transition">
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
            className="grid gap-5 border-t border-[var(--border-soft)] px-5 py-6 sm:px-6"
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text)]">
                  Contraseña actual
                </label>

                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-12 text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)]"
                    placeholder="Tu contraseña actual"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
                  >
                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text)]">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <FiKey className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-12 text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)]"
                    placeholder="Nueva contraseña"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
                  >
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text)]">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <FiCheckCircle className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-12 text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_var(--shadow)]"
                    placeholder="Repite la nueva contraseña"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-[var(--text)]">
                  Seguridad: {getStrengthText(passwordScore)}
                </p>

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Validación en tiempo real
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border-soft)]">
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
                        ? "bg-[var(--success-bg)] text-[var(--success)]"
                        : "bg-[var(--surface)] text-[var(--text-muted)]"
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
                    ? "border border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
                    : "border border-[var(--danger-bg-hover)] bg-[var(--danger-bg)] text-[var(--danger)]"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-7 text-sm font-extrabold text-white shadow-[0_12px_28px_var(--shadow-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}