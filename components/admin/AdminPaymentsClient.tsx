"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type PaymentProduct = {
  _id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  mainImage?: string;
};

type PaymentLiquidation = {
  _id: string;
  productId: string;
  productTitle: string;
  productSlug?: string;
  publishedPrice: number;
  finalSalePrice: number;
  productCost: number;
  capitalProvider: "admin1" | "admin2";
  admin1Percentage: number;
  admin2Percentage: number;
  netProfit: number;
  admin1Amount: number;
  admin2Amount: number;
  paidToAdmin1: number;
  paidToAdmin2: number;
  balanceAdmin1: number;
  balanceAdmin2: number;
  status: "pendiente" | "parcial" | "liquidado";
  notes?: string;
};

type Draft = {
  finalSalePrice: string;
  productCost: string;
  capitalProvider: "admin1" | "admin2";
  paidToAdmin1: string;
  paidToAdmin2: string;
  notes: string;
};

type Props = {
  products: PaymentProduct[];
  liquidations: PaymentLiquidation[];
};

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value.toFixed(2)}`;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getProductIdFromLiquidation(liquidation: PaymentLiquidation) {
  return String(liquidation.productId);
}

function getSafeImage(src?: string) {
  if (!src) return "/placeholder-product.png";

  const value = src.trim();

  return value || "/placeholder-product.png";
}

function calculatePreview(draft: Draft) {
  const finalSalePrice = Number(draft.finalSalePrice || 0);
  const productCost = Number(draft.productCost || 0);
  const paidToAdmin1 = Number(draft.paidToAdmin1 || 0);
  const paidToAdmin2 = Number(draft.paidToAdmin2 || 0);

  const netProfit = roundMoney(finalSalePrice - productCost);
  const distributableProfit = Math.max(netProfit, 0);

  const admin1Percentage = draft.capitalProvider === "admin1" ? 70 : 30;
  const admin2Percentage = draft.capitalProvider === "admin2" ? 70 : 30;

  const admin1Profit = roundMoney(distributableProfit * (admin1Percentage / 100));
  const admin2Profit = roundMoney(distributableProfit * (admin2Percentage / 100));

  const admin1CapitalReturn =
    draft.capitalProvider === "admin1" ? productCost : 0;

  const admin2CapitalReturn =
    draft.capitalProvider === "admin2" ? productCost : 0;

  const admin1Amount = roundMoney(admin1CapitalReturn + admin1Profit);
  const admin2Amount = roundMoney(admin2CapitalReturn + admin2Profit);

  const balanceAdmin1 = roundMoney(Math.max(admin1Amount - paidToAdmin1, 0));
  const balanceAdmin2 = roundMoney(Math.max(admin2Amount - paidToAdmin2, 0));

  const status =
    balanceAdmin1 === 0 && balanceAdmin2 === 0
      ? "liquidado"
      : paidToAdmin1 > 0 || paidToAdmin2 > 0
      ? "parcial"
      : "pendiente";

  return {
    netProfit,
    admin1Percentage,
    admin2Percentage,
    admin1Amount,
    admin2Amount,
    balanceAdmin1,
    balanceAdmin2,
    status,
  };
}

function statusLabel(status: string) {
  if (status === "liquidado") return "Liquidado";
  if (status === "parcial") return "Pago parcial";
  return "Pendiente";
}

function statusClass(status: string) {
  if (status === "liquidado") {
    return "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]";
  }

  if (status === "parcial") {
    return "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]";
  }

  return "bg-[var(--surface-soft)] text-[var(--primary)] border-[var(--border)]";
}

export default function AdminPaymentsClient({
  products,
  liquidations,
}: Props) {
  const [currentLiquidations, setCurrentLiquidations] =
    useState<PaymentLiquidation[]>(liquidations);

  const [loadingId, setLoadingId] = useState("");
  const [message, setMessage] = useState("");

  const liquidationMap = useMemo(() => {
    const map = new Map<string, PaymentLiquidation>();

    currentLiquidations.forEach((liquidation) => {
      map.set(getProductIdFromLiquidation(liquidation), liquidation);
    });

    return map;
  }, [currentLiquidations]);

  const initialDrafts = useMemo(() => {
    const result: Record<string, Draft> = {};

    products.forEach((product) => {
      const liquidation = liquidationMap.get(product._id);

      result[product._id] = {
        finalSalePrice: String(
          liquidation?.finalSalePrice ?? product.price ?? 0
        ),
        productCost: String(liquidation?.productCost ?? product.costPrice ?? 0),
        capitalProvider: liquidation?.capitalProvider || "admin1",
        paidToAdmin1: String(liquidation?.paidToAdmin1 ?? 0),
        paidToAdmin2: String(liquidation?.paidToAdmin2 ?? 0),
        notes: liquidation?.notes || "",
      };
    });

    return result;
  }, [products, liquidationMap]);

  const [drafts, setDrafts] = useState<Record<string, Draft>>(initialDrafts);

  const totals = useMemo(() => {
    return currentLiquidations.reduce(
      (acc, item) => {
        acc.sales += item.finalSalePrice || 0;
        acc.profit += item.netProfit || 0;
        acc.admin1Balance += item.balanceAdmin1 || 0;
        acc.admin2Balance += item.balanceAdmin2 || 0;

        if (item.status !== "liquidado") {
          acc.pending += 1;
        }

        return acc;
      },
      {
        sales: 0,
        profit: 0,
        admin1Balance: 0,
        admin2Balance: 0,
        pending: 0,
      }
    );
  }, [currentLiquidations]);

  function updateDraft(productId: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  }

  async function saveLiquidation(product: PaymentProduct) {
    try {
      setMessage("");
      setLoadingId(product._id);

      const draft = drafts[product._id];
      const existing = liquidationMap.get(product._id);

      const url = existing
        ? `/api/liquidations/${existing._id}`
        : "/api/liquidations";

      const method = existing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          finalSalePrice: Number(draft.finalSalePrice || 0),
          productCost: Number(draft.productCost || 0),
          capitalProvider: draft.capitalProvider,
          paidToAdmin1: Number(draft.paidToAdmin1 || 0),
          paidToAdmin2: Number(draft.paidToAdmin2 || 0),
          notes: draft.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo guardar la liquidación.");
        return;
      }

      setCurrentLiquidations((prev) => {
        const updated = data.liquidation as PaymentLiquidation;
        const exists = prev.some((item) => item._id === updated._id);

        if (exists) {
          return prev.map((item) => (item._id === updated._id ? updated : item));
        }

        return [updated, ...prev];
      });

      setMessage("Liquidación guardada correctamente.");
    } catch {
      setMessage("Ocurrió un error guardando la liquidación.");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--text)] sm:text-4xl">
            Liquidaciones
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-[var(--text-soft)] sm:text-base">
            Calcula ganancias, reparto 70/30 y saldos pendientes entre Admin 1 y Admin 2.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              ← Panel admin
            </Link>

            <Link
              href="/admin/productos"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-12 sm:px-5 sm:text-sm"
            >
              Ver productos
            </Link>
          </div>
        </div>

        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Ventas
            </p>
            <p className="mt-3 text-2xl font-black text-[var(--primary)]">
              {formatBs(totals.sales)}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Ganancia
            </p>
            <p className="mt-3 text-2xl font-black text-[var(--primary)]">
              {formatBs(totals.profit)}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Saldo Admin 2
            </p>
            <p className="mt-3 text-2xl font-black text-[var(--primary)]">
              {formatBs(totals.admin2Balance)}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_var(--shadow)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Pendientes
            </p>
            <p className="mt-3 text-2xl font-black text-[var(--primary)]">
              {totals.pending}
            </p>
          </div>
        </section>

        {message && (
          <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm font-bold text-[var(--text)]">
            {message}
          </div>
        )}

        <section className="space-y-4">
          {products.length === 0 ? (
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center shadow-[0_10px_30px_var(--shadow)]">
              <h2 className="text-2xl font-extrabold text-[var(--text)]">
                No hay productos sin stock todavía
              </h2>

              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Cuando un producto llegue a stock 0, aparecerá aquí para calcular su liquidación.
              </p>
            </div>
          ) : (
            products.map((product) => {
              const draft = drafts[product._id];
              const preview = calculatePreview(draft);
              const existing = liquidationMap.get(product._id);

              return (
                <article
                  key={product._id}
                  className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                    <div>
                      <div className="aspect-square overflow-hidden rounded-[24px] bg-[var(--surface-soft)]">
                        <img
                          src={getSafeImage(product.mainImage)}
                          alt={product.title || "Producto"}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = "/placeholder-product.png";
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusClass(
                            existing?.status || preview.status
                          )}`}
                        >
                          {statusLabel(existing?.status || preview.status)}
                        </span>

                        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-extrabold text-[var(--primary)]">
                          Stock {product.stock ?? 0}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-[var(--text)]">
                        {product.title || "Producto"}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">
                        Precio publicado:{" "}
                        <span className="font-extrabold text-[var(--primary)]">
                          {formatBs(product.price)}
                        </span>
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Precio final vendido
                          </label>
                          <input
                            type="number"
                            value={draft.finalSalePrice}
                            onChange={(e) =>
                              updateDraft(
                                product._id,
                                "finalSalePrice",
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Costo producto
                          </label>
                          <input
                            type="number"
                            value={draft.productCost}
                            onChange={(e) =>
                              updateDraft(
                                product._id,
                                "productCost",
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Capital
                          </label>
                          <select
                            value={draft.capitalProvider}
                            onChange={(e) =>
                              updateDraft(
                                product._id,
                                "capitalProvider",
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                          >
                            <option value="admin1">Admin 1 puso capital</option>
                            <option value="admin2">Admin 2 puso capital</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Ganancia real
                          </label>
                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 font-black text-[var(--primary)]">
                            {formatBs(preview.netProfit)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Admin 1
                          </p>

                          <p className="mt-2 text-xl font-black text-[var(--text)]">
                            {formatBs(preview.admin1Amount)}
                          </p>

                          <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">
                            Porcentaje ganancia: {preview.admin1Percentage}%
                          </p>

                          <label className="mt-4 mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Pagado a Admin 1
                          </label>

                          <input
                            type="number"
                            value={draft.paidToAdmin1}
                            onChange={(e) =>
                              updateDraft(
                                product._id,
                                "paidToAdmin1",
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                          />

                          <p className="mt-3 text-sm font-extrabold text-[var(--primary)]">
                            Saldo: {formatBs(preview.balanceAdmin1)}
                          </p>
                        </div>

                        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Admin 2
                          </p>

                          <p className="mt-2 text-xl font-black text-[var(--text)]">
                            {formatBs(preview.admin2Amount)}
                          </p>

                          <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">
                            Porcentaje ganancia: {preview.admin2Percentage}%
                          </p>

                          <label className="mt-4 mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            Pagado a Admin 2
                          </label>

                          <input
                            type="number"
                            value={draft.paidToAdmin2}
                            onChange={(e) =>
                              updateDraft(
                                product._id,
                                "paidToAdmin2",
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-bold text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                          />

                          <p className="mt-3 text-sm font-extrabold text-[var(--primary)]">
                            Saldo: {formatBs(preview.balanceAdmin2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Nota
                        </label>

                        <textarea
                          rows={3}
                          value={draft.notes}
                          onChange={(e) =>
                            updateDraft(product._id, "notes", e.target.value)
                          }
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]"
                          placeholder="Ej: Se vendió con descuento a 120 Bs."
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => saveLiquidation(product)}
                          disabled={loadingId === product._id}
                          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--primary)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)] disabled:opacity-60"
                        >
                          {loadingId === product._id
                            ? "Guardando..."
                            : existing
                            ? "Guardar cambios"
                            : "Crear liquidación"}
                        </button>

                        {product.slug && (
                          <Link
                            href={`/producto/${product.slug}`}
                            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 text-sm font-extrabold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          >
                            Ver producto
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}