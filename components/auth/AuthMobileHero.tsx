import Image from "next/image";

export default function AuthMobileHero() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden lg:hidden">
      <Image
        src="/images/auth/cosless-login-movil.png"
        alt="CosLess hero móvil"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* suavizado arriba */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#eef9ff]/20 to-transparent" />

      {/* degradado abajo para perder la imagen sin corte duro */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#d9f1fb]/70 to-[#eef9ff]" />
    </div>
  );
}