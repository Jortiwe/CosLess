import { notFound } from "next/navigation";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import AdminBackButton from "../../../../components/admin/AdminBackButton";
import OrderEditForm from "../../../../components/admin/OrderEditForm";

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

function formatDate(dateValue?: string | Date) {
  if (!dateValue) return "Sin fecha";

  const date = new Date(dateValue);

  return date.toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] py-3 last:border-b-0">
      <p className="shrink-0 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="min-w-0 break-words text-right text-sm font-extrabold text-[var(--text)] sm:text-base">
        {value || "Sin dato"}
      </p>
    </div>
  );
}

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;

  await connectDB();

  const rawOrder = await Order.findById(orderId).lean();

  if (!rawOrder) {
    notFound();
  }

  const order = JSON.parse(JSON.stringify(rawOrder));
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <AdminBackButton href="/admin/pedidos" label="Volver a pedidos" />

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] shadow-[0_8px_20px_var(--shadow)]">
                Pedido
              </span>

              <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
                {order.orderCode || "Sin código"}
              </h1>
            </div>

            <div className="shrink-0 rounded-2xl bg-[var(--surface)] px-4 py-3 text-right shadow-[0_8px_20px_var(--shadow)]">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Total
              </p>

              <p className="mt-1 text-lg font-black text-[var(--primary)] sm:text-xl">
                {formatBs(order.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-5">
            <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                    Cliente
                  </span>

                  <h2 className="mt-3 text-xl font-extrabold text-[var(--text)] sm:text-2xl">
                    Datos principales
                  </h2>
                </div>
              </div>

              <div className="rounded-[24px] bg-[var(--surface-soft)] px-4">
                <InfoRow label="Nombre" value={order.customerName} />
                <InfoRow label="Teléfono" value={order.customerPhone} />
                <InfoRow
                  label="Correo"
                  value={order.customerEmail || "Sin correo"}
                />
                <InfoRow label="Fecha" value={formatDate(order.createdAt)} />
              </div>
            </div>

            <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                  Entrega
                </span>

                <h2 className="mt-3 text-xl font-extrabold text-[var(--text)] sm:text-2xl">
                  Envío y totales
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] bg-[var(--surface-soft)] px-4">
                  <InfoRow
                    label="Depto."
                    value={order.shippingDepartment || "Sin departamento"}
                  />
                  <InfoRow
                    label="Ciudad"
                    value={order.shippingCity || "Sin ciudad"}
                  />
                  <InfoRow
                    label="Zona"
                    value={order.shippingZone || "Sin zona"}
                  />
                  <InfoRow
                    label="Tipo"
                    value={order.shippingType || "Sin tipo"}
                  />
                </div>

                <div className="rounded-[24px] bg-[var(--surface-soft)] px-4">
                  <InfoRow label="Subtotal" value={formatBs(order.subtotal)} />
                  <InfoRow label="Envío" value={formatBs(order.shippingCost)} />

                  <div className="flex items-center justify-between gap-4 py-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Total
                    </p>

                    <p className="text-xl font-black text-[var(--primary)]">
                      {formatBs(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                    Productos
                  </span>

                  <h2 className="mt-3 text-xl font-extrabold text-[var(--text)] sm:text-2xl">
                    Lista del pedido
                  </h2>
                </div>

                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-extrabold text-[var(--primary)]">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-5 text-sm font-semibold text-[var(--text-soft)]">
                    No hay productos en este pedido.
                  </div>
                ) : (
                  items.map(
                    (
                      item: {
                        productId: string;
                        title: string;
                        quantity: number;
                        price: number;
                      },
                      index: number
                    ) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-4 transition hover:border-[var(--primary)] hover:bg-[var(--surface)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-extrabold text-[var(--text)]">
                              {item.title}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">
                              Cantidad: {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-right font-black text-[var(--primary)]">
                            {formatBs(item.price)}
                          </p>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:rounded-[32px] sm:p-6">
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--primary)]">
                  WhatsApp
                </span>

                <h2 className="mt-3 text-xl font-extrabold text-[var(--text)] sm:text-2xl">
                  Mensaje generado
                </h2>
              </div>

              <pre className="max-h-[240px] overflow-y-auto whitespace-pre-wrap break-words rounded-[24px] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--text-soft)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-[360px]">
                {order.whatsappMessage || "Sin mensaje generado."}
              </pre>
            </div>
          </section>

          <div className="xl:sticky xl:top-6 xl:h-fit">
            <OrderEditForm order={order} />
          </div>
        </div>
      </div>
    </main>
  );
}