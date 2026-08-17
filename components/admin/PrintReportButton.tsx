"use client";

import { FiPrinter } from "react-icons/fi";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--cos-white)] shadow-[0_10px_24px_var(--shadow-strong)] transition hover:bg-[var(--primary-dark)]"
    >
      <FiPrinter />
      Imprimir / Guardar PDF
    </button>
  );
}