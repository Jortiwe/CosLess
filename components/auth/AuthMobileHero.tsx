import Image from "next/image";

export default function AuthMobileHero() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden lg:hidden">
      <Image
        src="/images/auth/cosless-login-mobile-v4.png"
        alt="CosLess hero móvil"
        fill
        priority
        sizes="430px"
        className="object-cover object-top"
      />

      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[var(--bg)]/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[var(--surface-soft)]/70 to-[var(--bg)]" />
    </div>
  );
}