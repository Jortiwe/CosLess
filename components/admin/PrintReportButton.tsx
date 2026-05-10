"use client";

import { FiPrinter } from "react-icons/fi";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-2xl bg-[#19b7c9] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(25,183,201,0.18)] transition hover:bg-[#0ea5b7]"
    >
      <FiPrinter />
      Imprimir / Guardar PDF
    </button>
  );
}