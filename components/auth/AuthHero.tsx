"use client";

import Image from "next/image";

type AuthHeroProps = {
  mode: "login" | "register";
};

export default function AuthHero({ mode }: AuthHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#bfe3f3] bg-[#7dcff2] lg:h-[760px] min-h-[320px]">
      {/* Imagen */}
      <div className="absolute inset-0 overflow-hidden rounded-[32px]">
        <Image
          src="/images/auth/cosless-login-hero.png"
          alt="CosLess cosplay hero"
          fill
          priority
          className="
            object-cover
            object-center
            scale-[1.045]
            sm:scale-[1.035]
            lg:scale-[1.02]
          "
        />
      </div>

      {/* Capa suave encima para mejorar lectura */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(125,207,242,0.10)_0%,rgba(125,207,242,0.04)_35%,rgba(125,207,242,0.08)_100%)]" />

      {/* Texto encima de la imagen */}
      <div className="absolute left-5 top-5 z-10 max-w-[82%] sm:left-7 sm:top-7 lg:left-8 lg:top-8">
        <h2 className="text-[40px] font-extrabold leading-[0.95] text-[#16324a] drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)] sm:text-[52px] lg:text-[64px] xl:text-[72px]">
  {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
</h2>

<p className="mt-3 max-w-[420px] text-[16px] leading-8 text-[#2f5874] drop-shadow-[0_1px_8px_rgba(255,255,255,0.28)] sm:text-[18px] lg:mt-4 lg:text-[20px]">
  {mode === "login"
    ? "Accede rápidamente a tu cuenta, tus favoritos y tu carrito."
    : "Regístrate para guardar tus productos, favoritos y pedidos."}
</p>
      </div>
    </div>
  );
}