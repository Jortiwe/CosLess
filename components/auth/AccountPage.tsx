"use client";

import { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import AuthHero from "./AuthHero";
import AuthCard from "./AuthCard";

type Mode = "login" | "register";

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <main className="min-h-screen bg-[#eef9ff] text-[#16324a]">
      <Header />

      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[1fr_1.08fr]">
          <AuthHero mode={mode} />
          <AuthCard mode={mode} onModeChange={setMode} />
        </div>
      </section>

      <Footer />
    </main>
  );
}