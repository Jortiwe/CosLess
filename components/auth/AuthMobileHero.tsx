import Image from "next/image";
import { COSLESS_IMAGES } from "../../lib/coslessImages";

export default function AuthMobileHero() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden lg:hidden">
      <Image
        src={COSLESS_IMAGES.auth.loginMobile}
        alt="CosLess hero móvil"
        fill
        priority
        sizes="(max-width: 640px) 100vw, 430px"
        className="object-cover object-top"
      />

      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[var(--bg)]/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[var(--surface-soft)]/70 to-[var(--bg)]" />
    </div>
  );
}