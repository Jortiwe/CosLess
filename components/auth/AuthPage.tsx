"use client";

import { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import AuthHero from "./AuthHero";
import AuthCard from "./AuthCard";
import AuthMobileHero from "./AuthMobileHero";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header />

      <div className="lg:hidden">
        <section className="relative min-h-[calc(100vh-86px)] overflow-hidden bg-[var(--surface-soft)]">
          <AuthMobileHero />

          <div className="relative z-10 mx-auto w-full max-w-[430px] px-4 pb-10 pt-[180px]">
            <AuthCard mode={mode} onModeChange={setMode} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </section>
      </div>

      <section className="relative hidden min-h-[calc(100vh-104px)] overflow-hidden lg:block">
        <AuthHero mode={mode} />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] w-full max-w-[1840px] items-center justify-end px-5 py-5 xl:px-8 2xl:px-10">
          <div className="w-full max-w-[590px] xl:max-w-[620px] 2xl:max-w-[650px]">
            <AuthCard mode={mode} onModeChange={setMode} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}