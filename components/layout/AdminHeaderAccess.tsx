"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionResponse = {
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export default function AdminHeaderAccess() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        const data: SessionResponse = await res.json();

        if (!cancelled) {
          setIsAdmin(!!data.isAdmin);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setReady(true);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="hidden rounded-2xl border border-[#bfefff] bg-[#eaf8ff] px-4 py-2 text-sm font-bold text-[#19b7c9] transition hover:border-[#19b7c9] hover:bg-white lg:inline-flex"
    >
      Panel admin
    </Link>
  );
}