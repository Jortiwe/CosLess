"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FiMail, FiHelpCircle, FiBell } from "react-icons/fi";
import { COSLESS_IMAGES } from "../../lib/coslessImages";

const PHONE_NUMBER = "59160769356";
const EMAIL = "horuhe3421310@gmail.com";

const WHATSAPP_ORDER_URL =
  `https://wa.me/${PHONE_NUMBER}?text=` +
  encodeURIComponent(
    "Hola, quiero hacer un pedido en CosLess. ¿Podrían ayudarme con disponibilidad y precios?"
  );

const WHATSAPP_HELP_URL =
  `https://wa.me/${PHONE_NUMBER}?text=` +
  encodeURIComponent(
    "Hola, necesito ayuda con la tienda CosLess. Quiero consultar sobre productos, pedidos o preventas."
  );

const EMAIL_URL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("Consulta desde CosLess") +
  "&body=" +
  encodeURIComponent("Hola, quiero hacer una consulta sobre la tienda CosLess.");

const FACEBOOK_URL =
  "https://m.me/jorge.alvarez.742658?ref=" +
  encodeURIComponent("Hola, quiero consultar sobre la tienda CosLess.");

const INSTAGRAM_URL = "#";
const TIKTOK_URL = "#";
const YOUTUBE_URL = "#";

const categoryLinks = [
  { label: "Cosplays", href: "/categoria/cosplays" },
  { label: "Pelucas", href: "/categoria/pelucas" },
  { label: "Lentes", href: "/categoria/lentes" },
  { label: "Mallas", href: "/categoria/mallas" },
  { label: "Accesorios", href: "/categoria/accesorios" },
  { label: "Preventa", href: "/categoria/preventa" },
];

const updateLinks = [
  { label: "Novedades", href: "/novedades" },
  { label: "Próximos ingresos", href: "/categoria/preventa" },
  { label: "Nuevos cosplays", href: "/productos?section=nuevos-cosplays" },
  { label: "Productos destacados", href: "/productos?section=destacados" },
  { label: "Promociones", href: "/productos?section=ofertas" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = footerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const linkClass =
    "inline-block text-[14px] text-[var(--text-soft)] transition duration-200 hover:text-[var(--primary)] hover:underline hover:underline-offset-4 sm:text-[15px]";

  const socialClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition duration-200 hover:-translate-y-1 hover:scale-110 hover:border-[var(--primary)] hover:text-[var(--primary)] sm:h-11 sm:w-11";

  return (
    <footer
      ref={footerRef}
      className={`relative mt-14 overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] transition-all duration-700 ease-out sm:mt-16 xl:mt-20 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="h-2 w-full bg-gradient-to-r from-[var(--cos-soft)] via-[var(--bg)] to-[var(--primary-light)] sm:h-3" />

      <div className="pointer-events-none absolute right-0 top-0 z-0 h-72 w-72 rounded-full bg-[var(--primary-light)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 z-0 h-60 w-60 rounded-full bg-[var(--cos-soft)]/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-11 lg:px-12 xl:px-20 xl:py-12 2xl:px-24">
        {/* MOBILE / TABLET */}
        <div className="xl:hidden">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 text-center">
              <h3 className="text-[2rem] font-extrabold tracking-wide text-[var(--primary)] sm:text-[2.2rem]">
                CosLess
              </h3>

              <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-6 text-[var(--text-soft)] sm:max-w-[420px] sm:text-[16px] sm:leading-8">
                Tienda online de cosplay en Bolivia.
              </p>
            </div>

            <Link
              href="/novedades"
              className="group mt-1 inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-[12px] font-extrabold text-[var(--text)] shadow-[0_10px_24px_var(--shadow)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)] sm:px-5 sm:text-[13px]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                <FiBell className="text-[1rem]" />
              </span>

              <span className="leading-tight">Novedades</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-7 gap-y-7 sm:gap-x-10">
            <div className="min-w-0 pl-1 sm:pl-2">
              <h4 className="text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-[var(--text)]">
                Categorías
              </h4>

              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {categoryLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-[var(--text)]">
                Contacto
              </h4>

              <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                <a
                  href={WHATSAPP_ORDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-left text-[14px] text-[var(--text-soft)] transition duration-200 hover:text-[var(--primary)] sm:text-[15px]"
                >
                  <FaWhatsapp className="mt-1 shrink-0 text-[0.9rem]" />
                  <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                    WhatsApp
                  </span>
                </a>

                <a
                  href={EMAIL_URL}
                  className="flex items-start gap-2 text-left text-[14px] text-[var(--text-soft)] transition duration-200 hover:text-[var(--primary)] sm:text-[15px]"
                >
                  <FiMail className="mt-1 shrink-0 text-[0.9rem]" />
                  <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                    Correo
                  </span>
                </a>

                <a
                  href={WHATSAPP_HELP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-left text-[14px] text-[var(--text-soft)] transition duration-200 hover:text-[var(--primary)] sm:text-[15px]"
                >
                  <FiHelpCircle className="mt-1 shrink-0 text-[0.9rem]" />
                  <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                    Ayuda
                  </span>
                </a>

                <div className="mt-4 grid w-fit grid-cols-3 gap-2">
                  <a
                    href={WHATSAPP_HELP_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className={socialClass}
                  >
                    <FaWhatsapp className="text-[0.95rem]" />
                  </a>

                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className={socialClass}
                  >
                    <FaFacebookF className="text-[0.9rem]" />
                  </a>

                  <a
                    href={INSTAGRAM_URL}
                    aria-label="Instagram"
                    className={socialClass}
                  >
                    <FaInstagram className="text-[0.95rem]" />
                  </a>

                  <a
                    href={TIKTOK_URL}
                    aria-label="TikTok"
                    className={socialClass}
                  >
                    <FaTiktok className="text-[0.9rem]" />
                  </a>

                  <a
                    href={YOUTUBE_URL}
                    aria-label="YouTube"
                    className={socialClass}
                  >
                    <FaYoutube className="text-[0.95rem]" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none mt-5 flex justify-center sm:mt-6">
            <Image
              src={COSLESS_IMAGES.characters.bot}
              alt=""
              aria-hidden="true"
              width={130}
              height={130}
              className="w-[82px] select-none object-contain opacity-90 drop-shadow-[0_14px_22px_rgba(16,38,90,0.14)] sm:w-[96px]"
            />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden gap-12 xl:grid xl:grid-cols-[1fr_0.85fr_1fr_1.15fr]">
          <div>
            <h3 className="text-[2rem] font-extrabold tracking-wide text-[var(--primary)]">
              CosLess
            </h3>

            <p className="mt-4 max-w-sm text-[17px] leading-8 text-[var(--text-soft)]">
              Cosplays, pelucas, lentes, mallas, accesorios, renta y preventas.
              Cotiza rápido por WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_HELP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className={socialClass}
              >
                <FaWhatsapp className="text-[1rem]" />
              </a>

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className={socialClass}
              >
                <FaFacebookF className="text-[0.95rem]" />
              </a>

              <a href={INSTAGRAM_URL} aria-label="Instagram" className={socialClass}>
                <FaInstagram className="text-[1rem]" />
              </a>

              <a href={TIKTOK_URL} aria-label="TikTok" className={socialClass}>
                <FaTiktok className="text-[0.95rem]" />
              </a>

              <a href={YOUTUBE_URL} aria-label="YouTube" className={socialClass}>
                <FaYoutube className="text-[1rem]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
              Categorías
            </h4>

            <ul className="mt-6 space-y-4">
              {categoryLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
              Noticias y actualizaciones
            </h4>

            <ul className="mt-6 space-y-4">
              {updateLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[270px] pr-[120px]">
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
              Contacto
            </h4>

            <div className="mt-6 space-y-5">
              <a
                href={WHATSAPP_ORDER_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-left text-[15px] text-[var(--text-soft)] transition duration-200 hover:scale-[1.03] hover:text-[var(--primary)]"
              >
                <FaWhatsapp className="text-[1rem]" />
                <span className="hover:underline hover:underline-offset-4">
                  Pedidos por WhatsApp
                </span>
              </a>

              <a
                href={EMAIL_URL}
                className="flex items-center gap-3 text-left text-[15px] text-[var(--text-soft)] transition duration-200 hover:scale-[1.03] hover:text-[var(--primary)]"
              >
                <FiMail className="text-[1rem]" />
                <span className="hover:underline hover:underline-offset-4">
                  {EMAIL}
                </span>
              </a>

              <a
                href={WHATSAPP_HELP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-left text-[15px] text-[var(--text-soft)] transition duration-200 hover:scale-[1.03] hover:text-[var(--primary)]"
              >
                <FiHelpCircle className="text-[1rem]" />
                <span className="hover:underline hover:underline-offset-4">
                  Centro de ayuda
                </span>
              </a>
            </div>

            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[var(--primary-dark)]"
            >
              Escribir al WhatsApp
            </a>

            <Image
              src={COSLESS_IMAGES.characters.bot}
              alt=""
              aria-hidden="true"
              width={150}
              height={150}
              className="pointer-events-none absolute bottom-0 right-0 w-[112px] select-none object-contain opacity-90 drop-shadow-[0_18px_28px_rgba(16,38,90,0.16)] 2xl:w-[126px]"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-5 sm:mt-10 sm:pt-6 md:mt-12">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-[13px] text-[var(--text-muted)] sm:text-[14px] md:flex-row md:text-left">
            <p className="transition duration-200 hover:text-[var(--primary)]">
              © 2026 CosLess.
            </p>

            <p className="transition duration-200 hover:text-[var(--primary)]">
              Tienda cosplay en desarrollo.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}