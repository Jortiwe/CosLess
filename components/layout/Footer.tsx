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
import { FiMail, FiHelpCircle } from "react-icons/fi";

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
  encodeURIComponent(
    "Hola, quiero hacer una consulta sobre la tienda CosLess."
  );

const FACEBOOK_URL =
  "https://m.me/jorge.alvarez.742658?ref=" +
  encodeURIComponent("Hola, quiero consultar sobre la tienda CosLess.");

const INSTAGRAM_URL = "#";
const TIKTOK_URL = "#";
const YOUTUBE_URL = "#";

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
    "inline-block text-[14px] sm:text-[15px] text-[#4b6b80] transition duration-200 hover:scale-105 hover:text-[#19b7c9] hover:underline hover:underline-offset-4";

  const socialClass =
    "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#cfeaf6] bg-white text-[#16324a] transition duration-200 hover:-translate-y-1 hover:scale-110 hover:border-[#19b7c9] hover:text-[#19b7c9]";

  return (
    <footer
      ref={footerRef}
      className={`mt-14 overflow-hidden border-t border-[#cfeaf6] bg-[#f7fdff] transition-all duration-700 ease-out sm:mt-16 xl:mt-20 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="h-2 w-full bg-gradient-to-r from-[#dff4ff] via-[#eef9ff] to-[#d9f7ff] sm:h-3" />

      <div className="mx-auto w-full max-w-[1700px] px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-11 lg:px-12 xl:px-20 xl:py-12 2xl:px-24">
        <div className="mb-7 block text-center sm:mb-8 xl:hidden">
          <h3 className="text-[2rem] font-extrabold tracking-wide text-[#19b7c9] sm:text-[2.2rem]">
            CosLess
          </h3>
          <p className="mx-auto mt-3 max-w-[95%] text-[15px] leading-7 text-[#4b6b80] sm:mt-4 sm:max-w-[90%] sm:text-[16px] sm:leading-8">
            Tienda de cosplays, pelucas, lentes, mallas y accesorios.
          </p>
        </div>

        {/* escritorio grande */}
        <div className="hidden gap-12 xl:grid xl:grid-cols-4">
          <div>
            <h3 className="text-[2rem] font-extrabold tracking-wide text-[#19b7c9]">
              CosLess
            </h3>
            <p className="mt-4 max-w-sm text-[17px] leading-8 text-[#4b6b80]">
              Tienda de cosplays, pelucas, lentes, mallas y accesorios.
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

              <a href={YOUTUBE_URL} aria-label="YouTube" className={socialClass}>
                <FaYoutube className="text-[1rem]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[#16324a]">
              Categorías
            </h4>

            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/buscar?q=cosplays" className={linkClass}>
                  Cosplays
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=pelucas" className={linkClass}>
                  Pelucas
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=lentes" className={linkClass}>
                  Lentes
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=mallas" className={linkClass}>
                  Mallas
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=accesorios" className={linkClass}>
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=preventa" className={linkClass}>
                  Preventa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[#16324a]">
              Noticias y actualizaciones
            </h4>

            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/novedades" className={linkClass}>
                  Novedades
                </Link>
              </li>
              <li>
                <Link href="/proximos-ingresos" className={linkClass}>
                  Próximos ingresos
                </Link>
              </li>
              <li>
                <Link href="/nuevos-cosplays" className={linkClass}>
                  Nuevos cosplays
                </Link>
              </li>
              <li>
                <Link href="/productos-destacados" className={linkClass}>
                  Productos destacados
                </Link>
              </li>
              <li>
                <Link href="/promociones" className={linkClass}>
                  Promociones
                </Link>
              </li>
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

        {/* tablet y móvil */}
        <div className="grid grid-cols-2 gap-x-7 gap-y-4 sm:gap-x-10 sm:gap-y-6 xl:hidden">
          <div className="min-w-0 pl-1 sm:pl-2">
            <h4 className="text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-[#16324a]">
              Categorías
            </h4>

            <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              <li>
                <Link href="/buscar?q=cosplays" className={linkClass}>
                  Cosplays
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=pelucas" className={linkClass}>
                  Pelucas
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=lentes" className={linkClass}>
                  Lentes
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=mallas" className={linkClass}>
                  Mallas
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=accesorios" className={linkClass}>
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/buscar?q=preventa" className={linkClass}>
                  Preventa
                </Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-[#16324a]">
              Contacto
            </h4>

            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              <a
                href={WHATSAPP_ORDER_URL}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-start gap-2 text-left text-[13px] text-[#4b6b80] transition duration-200 hover:scale-[1.03] hover:text-[#19b7c9] sm:text-[15px]"
              >
                <FaWhatsapp className="mt-1 shrink-0 text-[0.9rem] sm:text-[0.95rem]" />
                <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                  Pedidos por WhatsApp
                </span>
              </a>

              <a
                href={EMAIL_URL}
                className="flex w-full items-start gap-2 text-left text-[13px] text-[#4b6b80] transition duration-200 hover:scale-[1.03] hover:text-[#19b7c9] sm:text-[15px]"
              >
                <FiMail className="mt-1 shrink-0 text-[0.9rem] sm:text-[0.95rem]" />
                <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                  Correo electrónico
                </span>
              </a>

              <a
                href={WHATSAPP_HELP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-start gap-2 text-left text-[13px] text-[#4b6b80] transition duration-200 hover:scale-[1.03] hover:text-[#19b7c9] sm:text-[15px]"
              >
                <FiHelpCircle className="mt-1 shrink-0 text-[0.9rem] sm:text-[0.95rem]" />
                <span className="break-words leading-6 hover:underline hover:underline-offset-4">
                  Centro de ayuda
                </span>
              </a>
            </div>

            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full max-w-[220px] justify-center rounded-2xl bg-[#19b7c9] px-4 py-3 text-[13px] font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#0ea5b7] sm:mt-6 sm:text-sm"
            >
              Escribir al WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3 xl:hidden">
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

          <a href={INSTAGRAM_URL} aria-label="Instagram" className={socialClass}>
            <FaInstagram className="text-[0.95rem]" />
          </a>

          <a href={TIKTOK_URL} aria-label="TikTok" className={socialClass}>
            <FaTiktok className="text-[0.9rem]" />
          </a>

          <a href={YOUTUBE_URL} aria-label="YouTube" className={socialClass}>
            <FaYoutube className="text-[0.95rem]" />
          </a>
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