"use client";

import Image from "next/image";
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
};

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
        <div className="rounded-[10px] bg-[#f7fdff] px-4 pb-5 pt-4 shadow-2xl sm:px-5 sm:pb-6 sm:pt-5 md:px-6 md:pb-7 md:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex h-[58px] w-full items-center border-[2px] border-[#262626] bg-white px-4 sm:h-[62px] sm:px-5 md:h-[66px]">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar"
                  className="w-full bg-transparent text-[1rem] text-[#1f1f1f] outline-none placeholder:text-[#707070] sm:text-[1.05rem] md:text-[1.1rem]"
                />

                <button
                  type="button"
                  aria-label="Buscar"
                  onClick={handleGoToResults}
                  className="ml-2 flex h-9 w-9 items-center justify-center text-[#3a3a3a] transition duration-200 hover:scale-110 sm:h-10 sm:w-10"
                >
                  <FiSearch className="text-[1.5rem] sm:text-[1.6rem]" />
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Cerrar buscador"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-[#2b2b2b] transition duration-200 hover:scale-110"
            >
              <FiX className="text-[1.8rem]" />
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[6px] bg-white">
            {!normalizedQuery ? (
              <div className="px-6 py-8 text-[1rem] text-[#5e7381]">
                Busca por nombre, categoría o descripción.
              </div>
            ) : loading ? (
              <div className="px-6 py-8 text-[1rem] text-[#5e7381]">
                Buscando...
              </div>
            ) : (
              <div>
                {exactMatches.length > 0 && (
                  <div>
                    <div className="border-b border-[#e5eef3] px-6 py-4 text-[0.82rem] uppercase tracking-[0.24em] text-[#6d7e89]">
                      Coincidencias directas
                    </div>

                    <div className="divide-y divide-[#edf3f7]">
                      {exactMatches.map((product) => (
                        <Link
                          key={product._id}
                          href={`/producto/${product.slug}`}
                          onClick={onClose}
                          className="flex w-full items-start gap-4 px-6 py-5 text-left transition duration-200 hover:bg-[#f4fbff]"
                        >
                          <Image
                            src={product.mainImage}
                            alt={product.title}
                            width={70}
                            height={70}
                            className="h-[70px] w-[70px] shrink-0 rounded-xl object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-[1.05rem] leading-7 text-[#243c50]">
                              {product.title}
                            </p>
                            <p className="mt-1 text-sm text-[#6b7f8d]">
                              {product.category}
                            </p>
                            <p className="mt-2 text-[0.97rem] font-bold text-[#19b7c9]">
                              {formatBs(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {relatedMatches.length > 0 && (
                  <div>
                    <div className="border-b border-t border-[#e5eef3] px-6 py-4 text-[0.82rem] uppercase tracking-[0.24em] text-[#6d7e89]">
                      Relacionados
                    </div>

                    <div className="divide-y divide-[#edf3f7]">
                      {relatedMatches.map((product) => (
                        <Link
                          key={product._id}
                          href={`/producto/${product.slug}`}
                          onClick={onClose}
                          className="flex w-full items-start gap-4 px-6 py-5 text-left transition duration-200 hover:bg-[#f4fbff]"
                        >
                          <Image
                            src={product.mainImage}
                            alt={product.title}
                            width={70}
                            height={70}
                            className="h-[70px] w-[70px] shrink-0 rounded-xl object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-[1.05rem] leading-7 text-[#243c50]">
                              {product.title}
                            </p>
                            <p className="mt-1 text-sm text-[#6b7f8d]">
                              {product.category}
                            </p>
                            <p className="mt-2 text-[0.97rem] font-bold text-[#19b7c9]">
                              {formatBs(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {exactMatches.length === 0 && relatedMatches.length === 0 && (
                  <div className="px-6 py-8 text-[1rem] text-[#5e7381]">
                    No se encontraron resultados para “{query}”.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoToResults}
                  className="flex w-full items-center justify-between border-t border-[#e5eef3] px-6 py-5 text-left text-[1rem] text-[#243c50] transition duration-200 hover:bg-[#f4fbff]"
                >
                  <span>Buscar “{query}”</span>
                  <span className="text-[1.6rem] font-semibold leading-none text-[#19b7c9]">
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