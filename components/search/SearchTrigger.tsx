"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import SearchOverlay from "./SearchOverlay";

type SearchTriggerProps = {
  className?: string;
};

export default function SearchTrigger({
  className = "",
}: SearchTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir buscador"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <FiSearch className="text-[1.35rem] transition duration-200 group-hover:text-[#19b7c9] sm:text-[1.45rem]" />
      </button>

      <SearchOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}