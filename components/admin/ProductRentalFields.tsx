"use client";

type Props = {
  isRentable: boolean;
  setIsRentable: (value: boolean) => void;

  rentalPrice: string;
  setRentalPrice: (value: string) => void;

  rentalDeposit: string;
  setRentalDeposit: (value: string) => void;

  rentalDays: string;
  setRentalDays: (value: string) => void;

  rentalAvailable: boolean;
  setRentalAvailable: (value: boolean) => void;

  salePrice: string;
};

export default function ProductRentalFields({
  isRentable,
  setIsRentable,
  rentalPrice,
  setRentalPrice,
  rentalDeposit,
  setRentalDeposit,
  rentalDays,
  setRentalDays,
  rentalAvailable,
  setRentalAvailable,
  salePrice,
}: Props) {
  return (
    <div className="md:col-span-2">
      <div className="overflow-hidden rounded-[24px] border border-[#9fdce8] bg-[linear-gradient(135deg,#ffffff_0%,#effcff_100%)] shadow-[0_10px_28px_rgba(25,183,201,0.08)]">
        <div className="flex flex-col gap-3 border-b border-[#cfeaf6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full bg-[#19b7c9] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white">
                Alquiler
              </span>

              <h3 className="text-lg font-extrabold text-[#16324a]">
                  Datos de alquiler
              </h3>
            </div>

            <p className="mt-2 text-xs font-semibold leading-5 text-[#4b6b80]">
              Define el precio y las condiciones básicas para alquilar este producto.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={isRentable}
              onChange={(e) => setIsRentable(e.target.checked)}
              className="h-4 w-4 accent-[#19b7c9]"
            />

            <span className="text-sm font-bold text-[#16324a]">
              Permitir alquiler
            </span>
          </label>
        </div>

        {isRentable && (
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Precio de alquiler
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#19b7c9]">
                    Bs
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    className="w-full rounded-2xl border border-[#cfeaf6] bg-white py-4 pl-11 pr-4 outline-none transition focus:border-[#19b7c9]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Garantía / depósito
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#19b7c9]">
                    Bs
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rentalDeposit}
                    onChange={(e) => setRentalDeposit(e.target.value)}
                    className="w-full rounded-2xl border border-[#cfeaf6] bg-white py-4 pl-11 pr-4 outline-none transition focus:border-[#19b7c9]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Días incluidos
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={rentalDays}
                  onChange={(e) => setRentalDays(e.target.value)}
                  className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Disponibilidad
                </label>

                <label
                  className={`flex min-h-[58px] cursor-pointer items-center gap-3 rounded-2xl border px-4 transition ${
                    rentalAvailable
                      ? "border-[#9fdce8] bg-[#e9fbff]"
                      : "border-[#cfeaf6] bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rentalAvailable}
                    onChange={(e) => setRentalAvailable(e.target.checked)}
                    className="h-4 w-4 accent-[#19b7c9]"
                  />

                  <div>
                    <p className="text-sm font-bold text-[#16324a]">
                      {rentalAvailable ? "Disponible" : "No disponible"}
                    </p>

                    <p className="text-[0.7rem] font-semibold text-[#4b6b80]">
                      Para alquiler
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#e9fbff] px-4 py-3 text-xs font-semibold leading-5 text-[#4b6b80]">
              Este producto podrá venderse por{" "}
              <strong className="text-[#16324a]">
                Bs {Number(salePrice || 0)}
              </strong>{" "}
              y alquilarse por{" "}
              <strong className="text-[#16324a]">
                Bs {Number(rentalPrice || 0)}
              </strong>{" "}
              durante{" "}
              <strong className="text-[#16324a]">
                {Math.max(1, Number(rentalDays || 1))} día
                {Number(rentalDays) === 1 ? "" : "s"}
              </strong>
              .
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
