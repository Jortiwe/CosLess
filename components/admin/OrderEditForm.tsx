"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderType = {
  _id: string;
  orderCode: string;
  status: string;
  notes?: string;
  customerPhone: string;
  whatsappMessage: string;
};

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "contacted", label: "Contactado" },
  { value: "paid", label: "Pagado" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function OrderEditForm({ order }: { order: OrderType }) {
  const router = useRouter();

  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const whatsappUrl = `https://api.whatsapp.com/send?phone=591${order.customerPhone}&text=${encodeURIComponent(
    order.whatsappMessage || `Hola, te escribimos por tu pedido ${order.orderCode}`
  )}`;

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "No se pudo actualizar el pedido.");
        return;
      }

      setMessage("Pedido actualizado correctamente.");
      router.refresh();
    } catch {
      setMessage("Ocurrió un error actualizando el pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_var(--shadow)]">
      <h2 className="text-2xl font-extrabold text-[var(--text)]">
        Editar pedido
      </h2>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--text)]">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
          >
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--text)]">
            Nota interna
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]"
            placeholder="Escribe aquí una nota interna del pedido"
          />
        </div>

        {message && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-semibold text-[var(--text)]">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--cos-white)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[var(--primary)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--surface-soft)]"
          >
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}