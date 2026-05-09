"use client";

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
    "inline-block text-[14px] text-[#4b6b80] transition duration-200 hover:text-[#19b7c9] hover:underline hover:underline-offset-4 sm:text-[15px]";

  const socialClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-[#cfeaf6] bg-white text-[#16324a] transition duration-200 hover:-translate-y-1 hover:scale-110 hover:border-[#19b7c9] hover:text-[#19b7c9] sm:h-11 sm:w-11";

  return (
    <footer
      ref={footerRef}
      className={`mt-14 overflow-hidden border-t border-[#cfeaf6] bg-[#f7fdff] transition-all duration-700 ease-out sm:mt-16 xl:mt-20 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="h-2 w-full bg-gradient-to-r from-[#dff4ff] via-[#eef9ff] to-[#d9f7ff] sm:h-3" />

      <div className="mx-auto w-full max-w-[1700px] px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-11 lg:px-12 xl:px-20 xl:py-12 2xl:px-24">
        {/* MOBILE / TABLET */}
        <div className="xl:hidden">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[2rem] font-extrabold tracking-wide text-[#19b7c9] sm:text-[2.2rem]">
                CosLess
              </h3>

              <p className="mt-2 max-w-[230px] text-[14px] leading-6 text-[#4b6b80] sm:max-w-[420px] sm:text-[16px] sm:leading-8">
                Tienda online de cosplay en Bolivia.
              </p>
            </div>

            <Link
              href="/novedades"
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#cfeaf6] bg-white px-3 py-3 text-[12px] font-extrabold text-[#16324a] shadow-[0_10px_24px_rgba(22,50,74,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#19b7c9] hover:text-[#19b7c9] sm:px-5 sm:text-[13px]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf8ff] text-[#19b7c9] transition group-hover:bg-[#19b7c9] group-hover:text-white">
                <FiBell className="text-[1rem]" />
              </span>

              <span className="leading-tight">
                Novedades
                <span className="block text-[10px] font-bold text-[#6f8798] group-hover:text-[#19b7c9] sm:text-[11px]">
                  Ver noticias
                </span>
              </span>
            </Link>
          </div>

          <div className="mb-7 flex flex-wrap justify-center gap-2 sm:mb-8 sm:gap-3">
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

            <a href={TIKTOK_URL} aria-label="TikTok" className={socialClass}>
              <FaTiktok className="text-[0.9rem]" />
            </a>

            <a href={YOUTUBE_URL} aria-label="YouTube" className={socialClass}>
              <FaYoutube className="text-[0.95rem]" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-7 gap-y-7 sm:gap-x-10">
            <div className="min-w-0 pl-1 sm:pl-2">
              <h4 className="text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-[#16324a]">
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
              <h4 className="text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-[#16324a]">
                Contacto
              </h4>

              <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                <a
                  href={WHATSAPP_ORDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-left text-[14px] text-[#4b6b80] transition duration-200 hover:text-[#19b7c9] sm:text-[15px]"
                >
                  <FaWhatsapp className="mt-1 shrink-0 text-[0.9rem]" />
                  <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                    WhatsApp
                  </span>
                </a>

                <a
                  href={EMAIL_URL}
                  className="flex items-start gap-2 text-left text-[14px] text-[#4b6b80] transition duration-200 hover:text-[#19b7c9] sm:text-[15px]"
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
                  className="flex items-start gap-2 text-left text-[14px] text-[#4b6b80] transition duration-200 hover:text-[#19b7c9] sm:text-[15px]"
                >
                  <FiHelpCircle className="mt-1 shrink-0 text-[0.9rem]" />
                  <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                    Ayuda
                  </span>
                </a>

                <a
                  href={WHATSAPP_HELP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-2xl bg-[#19b7c9] px-4 py-3 text-[12px] font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#0ea5b7] sm:text-sm"
                >
                  Escribir
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden gap-12 xl:grid xl:grid-cols-4">
          <div>
            <h3 className="text-[2rem] font-extrabold tracking-wide text-[#19b7c9]">
              CosLess
            </h3>

            <p className="mt-4 max-w-sm text-[17px] leading-8 text-[#4b6b80]">
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

              <a
                href={INSTAGRAM_URL}
                aria-label="Instagram"
                className={socialClass}
              >
                <FaInstagram className="text-[1rem]" />
              </a>

              <a href={TIKTOK_URL} aria-label="TikTok" className={socialClass}>
                <FaTiktok className="text-[0.95rem]" />
              </a>

              <a
                href={YOUTUBE_URL}
                aria-label="YouTube"
                className={socialClass}
              >
                <FaYoutube className="text-[1rem]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[#16324a]">
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
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[#16324a]">
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

          <div>
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[#16324a]">
              Contacto
            </h4>

            <div className="mt-6 space-y-5">
              <a
                href={WHATSAPP_ORDER_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-left text-[15px] text-[#4b6b80] transition duration-200 hover:scale-[1.03] hover:text-[#19b7c9]"
              >
                <FaWhatsapp className="text-[1rem]" />
                <span className="hover:underline hover:underline-offset-4">
                  Pedidos por WhatsApp
                </span>
              </a>

              <a
                href={EMAIL_URL}
                className="flex items-center gap-3 text-left text-[15px] text-[#4b6b80] transition duration-200 hover:scale-[1.03] hover:text-[#19b7c9]"
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
                className="flex items-center gap-3 text-left text-[15px] text-[#4b6b80] transition duration-200 hover:scale-[1.03] hover:text-[#19b7c9]"
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
              className="mt-7 inline-flex rounded-2xl bg-[#19b7c9] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#0ea5b7]"
            >
              Escribir al WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-[#d9eef7] pt-5 sm:mt-12 sm:pt-6 md:mt-14">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-[13px] text-[#5f7f93] sm:text-[14px] md:flex-row md:text-left">
            <p className="transition duration-200 hover:text-[#19b7c9]">
              © 2026 CosLess.
            </p>
            <p className="transition duration-200 hover:text-[#19b7c9]">
              Tienda cosplay en desarrollo.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}