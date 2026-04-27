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
    <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
      <h2 className="text-2xl font-extrabold">Editar pedido</h2>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
          >
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Nota interna
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none"
            placeholder="Escribe aquí una nota interna del pedido"
          />
        </div>

        {message && (
          <div className="rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-sm font-semibold text-[#16324a]">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-2xl bg-[#19b7c9] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0ea5b7] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[#19b7c9] bg-white px-5 py-3 text-sm font-bold text-[#19b7c9] transition hover:bg-[#eaf8ff]"
          >
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}