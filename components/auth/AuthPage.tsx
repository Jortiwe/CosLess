"use client";

import { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import AuthHero from "./AuthHero";
import AuthCard from "./AuthCard";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        <div className="grid gap-5 lg:min-h-[calc(100vh-220px)] lg:grid-cols-[0.95fr_1.05fr] xl:gap-6">
          <div className="hidden lg:block">
            <AuthHero mode={mode} />
          </div>

          <div className="flex items-start">
            <div className="w-full">
              <AuthCard mode={mode} onModeChange={setMode} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}