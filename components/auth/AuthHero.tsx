import Image from "next/image";

type AuthHeroProps = {
  mode: "login" | "register";
};

const heroImages = {
  login: {
    src: "/images/auth/cosless-login-hero.png",
    alt: "CosLess iniciar sesión",
  },
  register: {
    src: "/images/auth/cosless-register-hero.png",
    alt: "CosLess crear cuenta",
  },
};

export default function AuthHero({ mode }: AuthHeroProps) {
  const hero = heroImages[mode];

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      <div key={hero.src} className="cosless-hero-sweep absolute inset-0">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="(min-width: 1536px) 62vw, (min-width: 1024px) 58vw, 100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,244,250,0.01)_0%,rgba(243,244,250,0.01)_46%,rgba(243,244,250,0.08)_68%,rgba(243,244,250,0.18)_100%)]" />
      </div>

      <style jsx global>{`
        @keyframes coslessHeroEnter {
          0% {
            opacity: 0.65;
            transform: scale(1.015);
            filter: blur(2px);
          }

          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes coslessHeroSweep {
          0% {
            transform: translateX(-130%) skewX(-12deg);
            opacity: 0;
          }

          18% {
            opacity: 1;
          }

          100% {
            transform: translateX(130%) skewX(-12deg);
            opacity: 0;
          }
        }

        .cosless-hero-sweep {
          animation: coslessHeroEnter 360ms ease-out both;
        }

        .cosless-hero-sweep::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 28%,
            rgba(255, 255, 255, 0.58) 48%,
            rgba(175, 201, 238, 0.22) 62%,
            transparent 100%
          );
          transform: translateX(-130%) skewX(-12deg);
          animation: coslessHeroSweep 520ms ease-out both;
        }
      `}</style>
    </div>
  );
}