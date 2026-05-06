import { Suspense } from "react";
import CheckoutPage from "../../components/checkout/CheckoutPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
          <div className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-[#cfeaf6] bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#19b7c9]">
                Cargando checkout...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}