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

          <div className="relative z-10 mx-auto w-full max-w-[430px] px-4 pt-[180px] pb-10">
            <AuthCard mode={mode} onModeChange={setMode} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </section>
      </div>

      <section className="mx-auto hidden w-full max-w-[1500px] px-5 py-6 lg:block xl:px-8">
        <div className="grid items-start gap-8 xl:grid-cols-[760px_minmax(0,1fr)]">
          <div className="min-w-0">
            <AuthHero mode={mode} />
          </div>

          <div className="min-w-0">
            <AuthCard mode={mode} onModeChange={setMode} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}