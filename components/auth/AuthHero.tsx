type AuthHeroProps = {
  mode: "login" | "register";
};

export default function AuthHero({ mode }: AuthHeroProps) {
  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-[32px] border border-[#cfeaf6] bg-gradient-to-br from-[#9bdcff] via-[#74c9f3] to-[#29b8cd]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />

      <div className="relative flex h-full flex-col justify-between p-8 lg:p-10 xl:p-12">
        <div>
          <div className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            CosLess
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold text-white backdrop-blur">
                C
              </div>

              <div>
                <p className="text-3xl font-extrabold tracking-wide text-white xl:text-4xl">
                  CosLess
                </p>
                <p className="mt-1 text-sm uppercase tracking-[0.28em] text-white/80">
                  Cosplay Store
                </p>
              </div>
            </div>

            <div className="mt-10 max-w-[430px]">
              <h2 className="text-5xl font-extrabold leading-[1.05] text-white xl:text-6xl">
                {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
              </h2>

              <p className="mt-5 text-lg leading-8 text-white/90">
                {mode === "login"
                  ? "Accede rápidamente a tu cuenta, tus favoritos y tu carrito."
                  : "Regístrate para guardar tus productos, favoritos y pedidos."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-start">
          <div className="rounded-[26px] border border-white/25 bg-white/12 px-6 py-4 backdrop-blur-md">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Tienda cosplay
            </p>
            <p className="mt-2 text-sm text-white/90">
              Acceso rápido y experiencia visual simple.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}