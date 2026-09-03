"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CATEGORY_LIST } from "../../lib/categories";
import ProductRentalFields from "./ProductRentalFields";
import ProductPairingFields from "./ProductPairingFields";

type ProductType = {
  _id?: string;
  title?: string;
  slug?: string;

  category?: string;
  categories?: string[];

  status?: string;

  price?: number;
  costPrice?: number;
  oldPrice?: number;
  stock?: number;
  inventoryLots?: Array<{ quantity?: number; remaining?: number; costPrice?: number }>;

  isRentable?: boolean;
  rentalPrice?: number;
  rentalDeposit?: number;
  rentalDays?: number;
  rentalAvailable?: boolean;
  rentalOnly?: boolean;

  pairedProducts?: string[];
  groupProducts?: string[];

  mainImage?: string;
  images?: string[];

  description?: string;

  isFeatured?: boolean;
  isOffer?: boolean;
  isWeeklyNew?: boolean;
  isActive?: boolean;
};

type Props = {
  mode: "create" | "edit";
  product?: ProductType;
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

function getInitialCategories(product?: ProductType) {
  const primaryCategory = normalizeCategory(
    product?.category || "cosplays"
  );

  const savedCategories = Array.isArray(product?.categories)
    ? product.categories.map(normalizeCategory).filter(Boolean)
    : [];

  const categories = Array.from(
    new Set([primaryCategory, ...savedCategories].filter(Boolean))
  );

  return categories.length > 0 ? categories : ["cosplays"];
}

function getInitialPairedProducts(product?: ProductType) {
  if (!Array.isArray(product?.pairedProducts)) {
    return [];
  }

  return product.pairedProducts
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}
function getInitialStockLots(product?: ProductType) {
  const savedLots = Array.isArray(product?.inventoryLots)
    ? product.inventoryLots
        .filter((lot) => Number(lot?.remaining ?? lot?.quantity ?? 0) > 0)
        .map((lot) => `${Number(lot.remaining ?? lot.quantity ?? 0)} @ ${Number(lot.costPrice || 0)}`)
    : [];

  if (savedLots.length > 0) return savedLots.join("\n");
  const currentStock = Number(product?.stock || 0);
  return currentStock > 0 ? `${currentStock} @ ${Number(product?.costPrice || 0)}` : "";
}

function parseStockLots(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [quantityText, costText] = line.split("@").map((item) => item.trim());
    const quantity = Math.floor(Number(quantityText || 0));
    return { quantity, remaining: quantity, costPrice: Number(costText || 0) };
  });
}

export default function ProductForm({
  mode,
  product,
}: Props) {
  const router = useRouter();

  const initialCategories = getInitialCategories(product);

  const initiallyRentable =
    Boolean(product?.isRentable) ||
    initialCategories.includes("alquiler");

  const [title, setTitle] = useState(
    product?.title || ""
  );

  const [slug, setSlug] = useState(
    product?.slug || ""
  );

  const [categories, setCategories] =
    useState<string[]>(initialCategories);

  const [status, setStatus] = useState(
    product?.status || "stock"
  );

  // =========================
  // VENTA
  // =========================

  const [price, setPrice] = useState(
    String(product?.price ?? 0)
  );

  const [costPrice, setCostPrice] = useState(
    String(product?.costPrice ?? 0)
  );

  const [oldPrice, setOldPrice] = useState(
    String(product?.oldPrice ?? 0)
  );

  const [stock, setStock] = useState(
    String(product?.stock ?? 0)
  );

  const [stockToAdd, setStockToAdd] = useState("0");
  const [stockLots, setStockLots] = useState(getInitialStockLots(product));

  // =========================
  // ALQUILER
  // =========================

  const [isRentable, setIsRentable] =
    useState(initiallyRentable);
  const [rentalOnly, setRentalOnly] = useState(Boolean(product?.rentalOnly));

  const [rentalPrice, setRentalPrice] = useState(
    String(product?.rentalPrice ?? 0)
  );

  const [rentalDeposit, setRentalDeposit] =
    useState(
      String(product?.rentalDeposit ?? 0)
    );

  const [rentalDays, setRentalDays] = useState(
    String(product?.rentalDays ?? 1)
  );

  const [
    rentalAvailable,
    setRentalAvailable,
  ] = useState(
    product?.rentalAvailable === undefined
      ? true
      : Boolean(product.rentalAvailable)
  );

  // =========================
  // PRODUCTOS EMPAREJADOS
  // =========================

  const [
    pairedProducts,
    setPairedProducts,
  ] = useState<string[]>(
    getInitialPairedProducts(product)
  );
  const [groupProducts, setGroupProducts] = useState<string[]>(product?.groupProducts || []);

  // =========================
  // CONTENIDO
  // =========================

  const [mainImage, setMainImage] = useState(
    product?.mainImage || ""
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadMainImage(file: File) {
    setUploadError("");
    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo subir la imagen.");
      const currentMainImage = mainImage.trim();
      const hasRealMainImage =
        currentMainImage &&
        currentMainImage !== "/placeholder-product.png";

      if (!hasRealMainImage) {
        setMainImage(result.url);
      } else {
        const currentImages = images
          .split("\n")
          .map((image) => image.trim())
          .filter(
            (image) => image && image !== "/placeholder-product.png"
          );

        if (currentImages.length >= 5) {
          throw new Error("Solo puedes añadir 5 imágenes adicionales.");
        }

        setImages([...currentImages, result.url].join("\n"));
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }

  const [images, setImages] = useState(
    (product?.images || []).join("\n")
  );

  const [description, setDescription] =
    useState(product?.description || "");

  // =========================
  // SECCIONES
  // =========================

  const [isFeatured, setIsFeatured] =
    useState(Boolean(product?.isFeatured));

  const [isOffer, setIsOffer] = useState(
    Boolean(product?.isOffer)
  );

  const [isWeeklyNew, setIsWeeklyNew] =
    useState(Boolean(product?.isWeeklyNew));

  const [isActive, setIsActive] = useState(
    product?.isActive === undefined
      ? true
      : Boolean(product.isActive)
  );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // =========================
  // CATEGORÍAS
  // =========================

  function updateCategory(
    index: number,
    value: string
  ) {
    const normalizedValue =
      normalizeCategory(value);

    setCategories((prev) => {
      const next = [...prev];

      const alreadyExists = next.some(
        (item, itemIndex) =>
          itemIndex !== index &&
          item === normalizedValue
      );

      if (alreadyExists) {
        return prev;
      }

      const previousValue = next[index];

      next[index] = normalizedValue;

      const cleanNext =
        next.filter(Boolean);

      if (
        previousValue === "alquiler" &&
        normalizedValue !== "alquiler" &&
        !cleanNext.includes("alquiler")
      ) {
        setIsRentable(false);
      }

      if (
        normalizedValue === "alquiler"
      ) {
        setIsRentable(true);
        setRentalAvailable(true);
      }

      return cleanNext;
    });
  }

  function addCategory() {
    setCategories((prev) => {
      const availableCategory =
        CATEGORY_LIST.find(
          (category) =>
            !prev.includes(category.slug)
        );

      if (!availableCategory) {
        return prev;
      }

      const next = [
        ...prev,
        availableCategory.slug,
      ];

      if (
        availableCategory.slug ===
        "alquiler"
      ) {
        setIsRentable(true);
        setRentalAvailable(true);
      }

      return next;
    });
  }

  function removeCategory(index: number) {
    if (index === 0) return;

    setCategories((prev) => {
      const removedCategory =
        prev[index];

      const next = prev.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

      if (
        removedCategory ===
          "alquiler" &&
        !next.includes("alquiler")
      ) {
        setIsRentable(false);
      }

      return next;
    });
  }

  // =========================
  // GUARDAR
  // =========================

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage("");

      if (!title.trim()) {
        setMessage(
          "Debes ingresar el nombre del producto."
        );
        return;
      }

      const cleanCategories =
        Array.from(
          new Set(
            categories
              .map(normalizeCategory)
              .filter(Boolean)
          )
        );

      const primaryCategory =
        cleanCategories[0] ||
        "cosplays";

      const productIsRentable =
        isRentable &&
        cleanCategories.includes(
          "alquiler"
        );

      if (
        productIsRentable &&
        Number(rentalPrice) <= 0
      ) {
        setMessage(
          "Ingresa un precio de alquiler mayor a 0."
        );
        return;
      }

      if (
        productIsRentable &&
        Number(rentalDays) < 1
      ) {
        setMessage(
          "Los días incluidos en el alquiler deben ser al menos 1."
        );
        return;
      }

      const parsedStockLots = mode === "edit" ? parseStockLots(stockLots) : [];
      const lotsAreValid = parsedStockLots.every(
        (lot) => lot.quantity > 0 && lot.costPrice >= 0 && Number.isFinite(lot.costPrice)
      );
      const lotsTotal = parsedStockLots.reduce((total, lot) => total + lot.quantity, 0);

      if (mode === "edit" && (!lotsAreValid || lotsTotal !== Number(stock || 0))) {
        setMessage("Revisa los lotes: cada línea debe ser cantidad @ costo y la suma debe coincidir con el stock actual.");
        return;
      }

      const payload = {
        title: title.trim(),

        slug:
          slug.trim() ||
          makeSlug(title),

        category:
          primaryCategory,

        categories:
          cleanCategories,

        status,

        // VENTA
        price: Number(price),
        costPrice: Number(costPrice),
        oldPrice: Number(oldPrice),
        stock: Number(stock),
        stockToAdd: mode === "edit" ? Number(stockToAdd) : 0,
        inventoryLots: parsedStockLots,

        // ALQUILER
        isRentable:
          productIsRentable,
        rentalOnly: productIsRentable && rentalOnly,

        rentalPrice:
          productIsRentable
            ? Number(rentalPrice)
            : 0,

        rentalDeposit:
          productIsRentable
            ? Number(rentalDeposit)
            : 0,

        rentalDays:
          productIsRentable
            ? Math.max(
                1,
                Number(rentalDays)
              )
            : 1,

        rentalAvailable:
          productIsRentable
            ? rentalAvailable
            : false,

        // EMPAREJADOS
        pairedProducts,
        groupProducts,

        // IMÁGENES
        mainImage,

        images: images
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

        description,

        // SECCIONES
        isFeatured,
        isOffer,
        isWeeklyNew,
        isActive,
      };

      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${product?._id}`;

      const method =
        mode === "create"
          ? "POST"
          : "PATCH";

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "No se pudo guardar el producto."
        );
        return;
      }

      setMessage(
        mode === "create"
          ? "Producto creado correctamente."
          : "Producto actualizado correctamente."
      );

      if (mode === "create") {
        router.push(
          `/admin/productos/${data.product._id}`
        );

        router.refresh();

        return;
      }

      setStock(String(data.product?.stock ?? stock));
      setStockToAdd("0");
      setStockLots(
        Array.isArray(data.product?.inventoryLots)
          ? data.product.inventoryLots
              .filter((lot: { remaining?: number; quantity?: number }) => Number(lot.remaining ?? lot.quantity ?? 0) > 0)
              .map((lot: { remaining?: number; quantity?: number; costPrice?: number }) => `${Number(lot.remaining ?? lot.quantity ?? 0)} @ ${Number(lot.costPrice || 0)}`)
              .join("\n")
          : stockLots
      );

      router.refresh();
    } catch {
      setMessage(
        "Ocurrió un error guardando el producto."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-[26px] border border-[#cfeaf6] bg-[#f7fdff] p-4 shadow-[0_10px_30px_rgba(22,50,74,0.05)] sm:rounded-[32px] sm:p-6">
      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        {/* ========================= */}
        {/* NOMBRE */}
        {/* ========================= */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Nombre
          </label>

          <input
            value={title}
            onChange={(e) => {
              setTitle(
                e.target.value
              );

              if (!product?.slug) {
                setSlug(
                  makeSlug(
                    e.target.value
                  )
                );
              }
            }}
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-[#16324a] outline-none transition focus:border-[#19b7c9]"
          />
        </div>

        {/* ========================= */}
        {/* SLUG */}
        {/* ========================= */}

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Slug
          </label>

          <input
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-[#16324a] outline-none transition focus:border-[#19b7c9]"
          />
        </div>

        {/* ========================= */}
        {/* ESTADO */}
        {/* ========================= */}

        <div>
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Estado
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-[#16324a] outline-none transition focus:border-[#19b7c9]"
          >
            <option value="stock">
              Stock
            </option>

            <option value="preventa">
              Preventa
            </option>
          </select>
        </div>

        {/* ========================= */}
        {/* CATEGORÍAS */}
        {/* ========================= */}

        <div className="md:col-span-2">
          <div className="mb-3">
            <label className="block text-sm font-bold text-[#16324a]">
              Categoría
            </label>

            <p className="mt-1 text-xs font-semibold text-[#4b6b80]">
              Elige primero la categoría principal.
              Agrega categorías adicionales únicamente
              cuando este producto deba aparecer en más
              de una sección.
            </p>
          </div>

          <div className="space-y-3">
            {/* PRINCIPAL */}

            <div className="rounded-[22px] border border-[#cfeaf6] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#16324a]">
                    Categoría principal
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#4b6b80]">
                    Esta será la categoría principal del producto.
                  </p>
                </div>

                <span className="rounded-full bg-[#e9fbff] px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#19b7c9]">
                  Principal
                </span>
              </div>

              <select
                value={
                  categories[0] ||
                  "cosplays"
                }
                onChange={(e) =>
                  updateCategory(
                    0,
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 font-semibold text-[#16324a] outline-none transition focus:border-[#19b7c9]"
              >
                {CATEGORY_LIST.map(
                  (categoryOption) => (
                    <option
                      key={
                        categoryOption.slug
                      }
                      value={
                        categoryOption.slug
                      }
                      disabled={categories
                        .slice(1)
                        .includes(
                          categoryOption.slug
                        )}
                    >
                      {
                        categoryOption.title
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ADICIONALES */}

            {categories
              .slice(1)
              .map(
                (
                  categoryValue,
                  extraIndex
                ) => {
                  const realIndex =
                    extraIndex + 1;

                  return (
                    <div
                      key={`${categoryValue}-${realIndex}`}
                      className="rounded-[22px] border border-[#cfeaf6] bg-[#f8fdff] p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-[#16324a]">
                            Categoría adicional{" "}
                            {realIndex}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-[#4b6b80]">
                            El producto también aparecerá
                            en esta categoría.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeCategory(
                              realIndex
                            )
                          }
                          className="rounded-xl border border-[#f2c7c7] bg-white px-3 py-2 text-xs font-extrabold text-[#c94b4b] transition hover:bg-[#fff5f5]"
                        >
                          Quitar
                        </button>
                      </div>

                      <select
                        value={
                          categoryValue
                        }
                        onChange={(e) =>
                          updateCategory(
                            realIndex,
                            e.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 font-semibold text-[#16324a] outline-none transition focus:border-[#19b7c9]"
                      >
                        {CATEGORY_LIST.map(
                          (categoryOption) => {
                            const selectedElsewhere =
                              categories.some(
                                (
                                  item,
                                  itemIndex
                                ) =>
                                  itemIndex !==
                                    realIndex &&
                                  item ===
                                    categoryOption.slug
                              );

                            return (
                              <option
                                key={
                                  categoryOption.slug
                                }
                                value={
                                  categoryOption.slug
                                }
                                disabled={
                                  selectedElsewhere
                                }
                              >
                                {
                                  categoryOption.title
                                }
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  );
                }
              )}

            {categories.length <
              CATEGORY_LIST.length && (
              <button
                type="button"
                onClick={
                  addCategory
                }
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#9fdce8] bg-white px-5 text-sm font-extrabold text-[#19b7c9] transition hover:border-[#19b7c9] hover:bg-[#e9fbff]"
              >
                + Agregar categoría
              </button>
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* VENTA */}
        {/* ========================= */}

        <div className="mt-2 md:col-span-2">
          <div className="rounded-[24px] border border-[#cfeaf6] bg-white p-5">
            <div className="mb-5">
              <h3 className="text-lg font-extrabold text-[#16324a]">
                Venta
              </h3>

              <p className="mt-1 text-xs font-semibold text-[#4b6b80]">
                Información usada para la venta normal
                del producto.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Precio de venta
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  {mode === "edit" ? "Costo del nuevo lote" : "Precio de costo"}
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) =>
                    setCostPrice(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Precio anterior
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={oldPrice}
                  onChange={(e) =>
                    setOldPrice(
                      e.target.value
                    )
                  }
                  placeholder="Opcional"
                  className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  {mode === "edit" ? "Stock actual" : "Stock inicial"}
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value
                    )
                  }
                  readOnly={mode === "edit"}
                  className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
                />
              </div>

              {mode === "edit" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#16324a]">
                    Añadir al stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stockToAdd}
                    onChange={(e) => setStockToAdd(e.target.value)}
                    className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
                  />
                </div>
              )}
            </div>

            {mode === "edit" && (
              <div className="mt-4 rounded-2xl border border-[#cfeaf6] bg-[#f7fdff] p-4">
                <label className="mb-2 block text-sm font-bold text-[#16324a]">
                  Lotes actuales
                </label>
                <textarea
                  rows={3}
                  value={stockLots}
                  onChange={(e) => setStockLots(e.target.value)}
                  placeholder="3 @ 30\n2 @ 35"
                  className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-3 font-medium text-[#16324a] outline-none transition focus:border-[#19b7c9]"
                />
                <p className="mt-2 text-xs font-semibold text-[#4b6b80]">
                  Una línea por lote: cantidad @ costo unitario. Úsalo para corregir inventario anterior.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* ALQUILER */}
        {/* ========================= */}

        {categories.includes(
          "alquiler"
        ) && (
          <ProductRentalFields
            isRentable={isRentable}
            setIsRentable={setIsRentable}
            rentalPrice={rentalPrice}
            setRentalPrice={setRentalPrice}
            rentalDeposit={rentalDeposit}
            setRentalDeposit={
              setRentalDeposit
            }
            rentalDays={rentalDays}
            setRentalDays={setRentalDays}
            rentalAvailable={
              rentalAvailable
            }
            setRentalAvailable={
              setRentalAvailable
            }
            salePrice={price}
            rentalOnly={rentalOnly}
            setRentalOnly={setRentalOnly}
          />
        )}

        {/* ========================= */}
        {/* IMAGEN PRINCIPAL */}
        {/* ========================= */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Imagen principal
          </label>

          <input
            value={mainImage}
            onChange={(e) =>
              setMainImage(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
          />

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) void uploadMainImage(file);
            }}
            className="mt-3 rounded-2xl border-2 border-dashed border-[#9fdce8] bg-[#f8fdff] px-4 py-5 text-center"
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadMainImage(file);
                event.currentTarget.value = "";
              }}
            />
            <p className="text-sm font-semibold text-[#4b6b80]">
              Arrastra una imagen aquí o selecciónala desde tu equipo
            </p>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="mt-3 rounded-xl bg-[#19b7c9] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {uploadingImage ? "Subiendo..." : "Seleccionar imagen"}
            </button>
            {uploadError && <p className="mt-2 text-xs font-bold text-red-600">{uploadError}</p>}
          </div>
        </div>

        {/* ========================= */}
        {/* IMÁGENES ADICIONALES */}
        {/* ========================= */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Imágenes adicionales
          </label>

          <textarea
            rows={5}
            value={images}
            onChange={(e) =>
              setImages(
                e.target.value
              )
            }
            placeholder="Una URL por línea"
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
          />

          <p className="mt-2 text-xs font-semibold text-[#4b6b80]">
            Máximo 5 imágenes adicionales.
          </p>
        </div>

        {/* ========================= */}
        {/* DESCRIPCIÓN */}
        {/* ========================= */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-[#16324a]">
            Descripción
          </label>

          <textarea
            rows={7}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 outline-none transition focus:border-[#19b7c9]"
          />
        </div>

        {/* ========================= */}
        {/* PRODUCTOS QUE COMBINAN */}
        {/* ========================= */}

        <ProductPairingFields
          currentProductId={product?._id}
          pairedProducts={
            pairedProducts
          }
          title="Piezas del conjunto"
          description="Relaciona piezas que forman parte del mismo conjunto."
          maxProducts={4}
          setPairedProducts={
            setPairedProducts
          }
        />
        <ProductPairingFields
          currentProductId={product?._id}
          pairedProducts={groupProducts}
          setPairedProducts={setGroupProducts}
          title="Grupo o colección"
          description="Relaciona productos de la misma marca, color o colección."
          maxProducts={20}
        />

        {/* ========================= */}
        {/* SECCIONES */}
        {/* ========================= */}

        <div className="md:col-span-2">
          <p className="mb-3 text-sm font-bold text-[#16324a]">
            Secciones de la tienda
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isOffer}
                onChange={(e) =>
                  setIsOffer(
                    e.target.checked
                  )
                }
              />

              <span className="font-semibold">
                Oferta
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isWeeklyNew}
                onChange={(e) =>
                  setIsWeeklyNew(
                    e.target.checked
                  )
                }
              />

              <span className="font-semibold">
                Nuevo semanal
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) =>
                  setIsFeatured(
                    e.target.checked
                  )
                }
              />

              <span className="font-semibold">
                Producto destacado
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(
                    e.target.checked
                  )
                }
              />

              <span className="font-semibold">
                Producto activo
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* MENSAJE */}
      {/* ========================= */}

      {message && (
        <div className="mt-5 rounded-2xl border border-[#cfeaf6] bg-white px-4 py-4 text-sm font-semibold text-[#16324a]">
          {message}
        </div>
      )}

      {/* ========================= */}
      {/* GUARDAR */}
      {/* ========================= */}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#129aac] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading
            ? "Guardando..."
            : mode === "create"
              ? "Crear producto"
              : "Guardar cambios"}
        </button>
      </div>
    </section>
  );
}
