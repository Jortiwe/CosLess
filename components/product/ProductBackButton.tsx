"use client";

import { useRouter } from "next/navigation";

type ProductBackButtonProps = {
  fallbackHref?: string;
};

export default function ProductBackButton({
  fallbackHref = "/productos",
}: ProductBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="group relative inline-flex items-center text-sm font-extrabold text-[#16324a] transition hover:text-[#19b7c9]"
    >
      <span className="mr-1">←</span>
      Atrás
      <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#19b7c9] transition-all duration-300 group-hover:w-full" />
    </button>
  );
}