import Image from "next/image";

type AuthHeroProps = {
  mode: "login" | "register";
};

export default function AuthHero({ mode }: AuthHeroProps) {
  const title = mode === "login" ? "Inicia sesión" : "Crea tu cuenta";
  const description =
    mode === "login"
      ? "Accede rápidamente a tu cuenta, tus favoritos y tu carrito."
      : "Regístrate para guardar tus productos, favoritos y pedidos.";

  return (
    <div className="relative hidden overflow-hidden rounded-[34px] bg-[var(--surface-soft)] lg:block">
      <div className="relative aspect-[1/1.02] min-h-[760px] w-full overflow-hidden rounded-[34px]">
        <Image
          src="/images/auth/cosless-login-hero.png"
          alt="CosLess hero"
          fill
          priority
          sizes="(max-width: 1280px) 50vw, 760px"
          className="object-cover object-center scale-[1.1]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,244,250,0.34)_0%,rgba(243,244,250,0.14)_28%,rgba(243,244,250,0.06)_55%,rgba(243,244,250,0.08)_100%)]" />

        <div className="absolute left-9 top-10 z-10 max-w-[420px] xl:left-10 xl:top-11 xl:max-w-[440px]">
          <h2 className="text-[68px] font-black leading-[0.92] tracking-[-0.045em] text-[var(--primary-dark)] xl:text-[74px]">
            {title}
          </h2>

          <p className="mt-4 max-w-[360px] text-[18px] leading-[1.5] text-[var(--text-soft)] xl:text-[19px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}