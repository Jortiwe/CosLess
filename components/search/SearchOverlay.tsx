"use client";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchProduct = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  category: string;
  description?: string;
  mainImage: string;
  categories?: string[];
  isRentable?: boolean;
  rentalAvailable?: boolean;
};

function isRentalProduct(product: SearchProduct) {
  const categories = (product.categories || []).map((item) => item.toLowerCase());
  const category = product.category.toLowerCase();
  return product.isRentable === true || category === "alquiler" || category === "renta" || categories.includes("alquiler") || categories.includes("renta");
}

function formatBs(value?: number) {
  if (typeof value !== "number") return "Bs0";
  return `Bs${value}`;
}

export default function SearchOverlay({
  isOpen,
  onClose,
}: SearchOverlayProps) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [exactMatches, setExactMatches] = useState<SearchProduct[]>([]);
  const [relatedMatches, setRelatedMatches] = useState<SearchProduct[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Enter" && query.trim()) {
        handleGoToResults();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setExactMatches([]);
      setRelatedMatches([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const currentQuery = query.trim();

    if (!isOpen || !currentQuery) {
      setExactMatches([]);
      setRelatedMatches([]);
      return;
    }

    const controller = new AbortController();

    const runSearch = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/search?q=${encodeURIComponent(currentQuery)}`,
          { signal: controller.signal }
        );

        const data = await res.json();

        if (!res.ok) {
          setExactMatches([]);
          setRelatedMatches([]);
          return;
        }

        setExactMatches(data.exactMatches || []);
        setRelatedMatches(data.relatedMatches || []);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setExactMatches([]);
          setRelatedMatches([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(runSearch, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, isOpen]);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  function handleGoToResults() {
    const value = query.trim();
    if (!value) return;

    onClose();
    router.push(`/buscar?q=${encodeURIComponent(value)}`);
  }

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Cerrar buscador"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/45"
      />

      <div className="relative z-[10000] mx-auto mt-4 w-[94%] max-w-[1420px] sm:mt-6 md:mt-10">
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 pb-5 pt-4 shadow-2xl sm:px-5 sm:pb-6 sm:pt-5 md:px-6 md:pb-7 md:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex h-[58px] w-full items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 sm:h-[62px] sm:px-5 md:h-[66px]">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar"
                  className="w-full bg-transparent text-[1rem] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] sm:text-[1.05rem] md:text-[1.1rem]"
                />

                <button
                  type="button"
                  aria-label="Buscar"
                  onClick={handleGoToResults}
                  className="ml-2 flex h-9 w-9 items-center justify-center text-[var(--text)] transition duration-200 hover:scale-110 hover:text-[var(--primary)] sm:h-10 sm:w-10"
                >
                  <FiSearch className="text-[1.5rem] sm:text-[1.6rem]" />
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Cerrar buscador"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--text)] transition duration-200 hover:scale-110 hover:text-[var(--primary)]"
            >
              <FiX className="text-[1.8rem]" />
            </button>
          </div>

          <div className="mt-5 max-h-[calc(100vh-150px)] overflow-y-auto overscroll-contain rounded-[14px] bg-[var(--surface)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-[calc(100vh-170px)] md:max-h-[calc(100vh-190px)]">
            {!normalizedQuery ? (
              <div className="px-6 py-8 text-[1rem] text-[var(--text-soft)]">
                Busca por nombre, categoría o descripción.
              </div>
            ) : loading ? (
              <div className="px-6 py-8 text-[1rem] text-[var(--text-soft)]">
                Buscando...
              </div>
            ) : (
              <div>
                {exactMatches.length > 0 && (
                  <div>
                    <div className="border-b border-[var(--border-soft)] px-4 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:px-6 sm:text-[0.82rem] sm:tracking-[0.24em]">
                      Coincidencias directas
                    </div>

                    <div className="divide-y divide-[var(--border-soft)]">
                      {exactMatches.map((product) => (
                        <Link
                          key={product._id}
                          href={`/producto/${product.slug}`}
                          onClick={onClose}
                          className="flex w-full items-start gap-3 px-4 py-5 text-left transition duration-200 hover:bg-[var(--surface-soft)] sm:gap-4 sm:px-6"
                        >
                          <img
  src={product.mainImage || "/placeholder-product.png"}
  alt={product.title}
  className="h-[70px] w-[70px] shrink-0 rounded-xl object-cover"
  onError={(event) => {
    event.currentTarget.src = "/placeholder-product.png";
  }}
/>

                          <div className="min-w-0 flex-1">
                            <p className="text-[1.05rem] leading-7 text-[var(--text)]">
                              {product.title}
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-soft)]">
                              {product.category}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <p className="text-[0.97rem] font-bold text-[var(--primary)]">
                                {formatBs(product.price)}
                              </p>
                              {isRentalProduct(product) && (
                                <span className="rounded-full bg-[#eef0ff] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#5661c9]">
                                  Alquiler
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {relatedMatches.length > 0 && (
                  <div>
                    <div className="border-b border-t border-[var(--border-soft)] px-4 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:px-6 sm:text-[0.82rem] sm:tracking-[0.24em]">
                      Relacionados
                    </div>

                    <div className="divide-y divide-[var(--border-soft)]">
                      {relatedMatches.map((product) => (
                        <Link
                          key={product._id}
                          href={`/producto/${product.slug}`}
                          onClick={onClose}
                          className="flex w-full items-start gap-3 px-4 py-5 text-left transition duration-200 hover:bg-[var(--surface-soft)] sm:gap-4 sm:px-6"
                        >
                          <img
  src={product.mainImage || "/placeholder-product.png"}
  alt={product.title}
  className="h-[70px] w-[70px] shrink-0 rounded-xl object-cover"
  onError={(event) => {
    event.currentTarget.src = "/placeholder-product.png";
  }}
/>

                          <div className="min-w-0 flex-1">
                            <p className="text-[1.05rem] leading-7 text-[var(--text)]">
                              {product.title}
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-soft)]">
                              {product.category}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <p className="text-[0.97rem] font-bold text-[var(--primary)]">
                                {formatBs(product.price)}
                              </p>
                              {isRentalProduct(product) && (
                                <span className="rounded-full bg-[#eef0ff] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#5661c9]">
                                  Alquiler
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {exactMatches.length === 0 && relatedMatches.length === 0 && (
                  <div className="px-6 py-8 text-[1rem] text-[var(--text-soft)]">
                    No se encontraron resultados para “{query}”.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoToResults}
                  className="flex w-full items-center justify-between border-t border-[var(--border-soft)] px-6 py-5 text-left text-[1rem] text-[var(--text)] transition duration-200 hover:bg-[var(--surface-soft)]"
                >
                  <span>Buscar “{query}”</span>
                  <span className="text-[1.6rem] font-semibold leading-none text-[var(--primary)]">
                    →
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
