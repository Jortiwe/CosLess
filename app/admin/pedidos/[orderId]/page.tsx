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

  return (
    <main className="min-h-screen bg-[#eef9ff] px-5 py-8 text-[#16324a] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">
              Pedido {order.orderCode}
            </h1>
            <p className="mt-2 text-[#4b6b80]">
              Revisa y actualiza la información del pedido.
            </p>
          </div>

          <AdminBackButton href="/admin/pedidos" label="Volver a pedidos" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-[#cfeaf6] bg-[#f7fdff] p-6 shadow-[0_10px_30px_rgba(22,50,74,0.05)]">
            <h2 className="text-2xl font-extrabold">Resumen del pedido</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Cliente
                </p>
                <p className="mt-2 text-lg font-bold">{order.customerName}</p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Teléfono
                </p>
                <p className="mt-2 text-lg font-bold">{order.customerPhone}</p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Correo
                </p>
                <p className="mt-2 text-lg font-bold">
                  {order.customerEmail || "Sin correo"}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Fecha
                </p>
                <p className="mt-2 text-lg font-bold">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Envío
                </p>
                <p className="mt-2 text-lg font-bold">
                  {order.shippingDepartment} / {order.shippingCity}
                </p>
                <p className="mt-1 text-sm text-[#4b6b80]">
                  Zona: {order.shippingZone}
                </p>
                <p className="mt-1 text-sm text-[#4b6b80]">
                  Tipo: {order.shippingType}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f8798]">
                  Totales
                </p>
                <p className="mt-2 text-sm text-[#4b6b80]">
                  Subtotal: <span className="font-bold">{formatBs(order.subtotal)}</span>
                </p>
                <p className="mt-1 text-sm text-[#4b6b80]">
                  Envío: <span className="font-bold">{formatBs(order.shippingCost)}</span>
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#19b7c9]">
                  Total: {formatBs(order.total)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-white p-5">
              <h3 className="text-xl font-extrabold">Productos</h3>

              <div className="mt-4 space-y-3">
                {order.items.map(
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
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#edf7fb] bg-[#fbfeff] px-4 py-4"
                    >
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="mt-1 text-sm text-[#4b6b80]">
                          Cantidad: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#19b7c9]">
                          {formatBs(item.price)}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-white p-5">
              <h3 className="text-xl font-extrabold">Mensaje de WhatsApp</h3>
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#f7fdff] p-4 text-sm leading-7 text-[#4b6b80]">
                {order.whatsappMessage}
              </pre>
            </div>
          </section>

          <OrderEditForm order={order} />
        </div>
      </div>
    </main>
  );
}