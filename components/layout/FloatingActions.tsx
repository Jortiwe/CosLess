"use client";

import { useEffect, useState } from "react";
import { FaChevronUp, FaCommentDots } from "react-icons/fa";

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 420);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-14 sm:bottom-6 sm:right-6">
      <button
        type="button"
        aria-label="Subir arriba"
        onClick={scrollToTop}
        className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#19b7c9] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0ea5b7] ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <FaChevronUp className="text-[0.8rem]" />
      </button>

      <button
        type="button"
        aria-label="Abrir chat"
        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#19b7c9] text-white shadow-xl transition duration-200 hover:scale-110 hover:bg-[#0ea5b7] sm:h-[68px] sm:w-[68px]"
      >
        <FaCommentDots className="text-[1.3rem]" />
      </button>
    </div>
  );
}