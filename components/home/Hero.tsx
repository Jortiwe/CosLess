"use client";

import Link from "next/link";
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { COSLESS_IMAGES } from "../../lib/coslessImages";

const AUTO_SLIDE_DELAY = 8000;
const MANUAL_PAUSE_DELAY = 15000;
const SWIPE_THRESHOLD = 45;

const slides = [
  {
    id: 1,
    image: COSLESS_IMAGES.home.hero1,
    tag: "Cosplay",
    title: "CosLess",
    href: "/productos",
  },
  {
    id: 2,
    image: COSLESS_IMAGES.home.hero2,
    tag: "Lentillas",
    title: "Lentes",
    href: "/categoria/lentes",
  },
  {
    id: 3,
    image: COSLESS_IMAGES.home.hero3,
    tag: "Accesorios",
    title: "Detalles",
    href: "/categoria/accesorios",
  },
  {
    id: 4,
    image: COSLESS_IMAGES.home.hero4,
    tag: "Alquiler",
    title: "Cosplays",
    href: "/categoria/alquiler",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  const nextAutoChangeAt = useRef(Date.now() + AUTO_SLIDE_DELAY);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastSwipeAt = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();

      if (now < nextAutoChangeAt.current) return;

      setCurrent((prev) => (prev + 1) % slides.length);
      nextAutoChangeAt.current = now + AUTO_SLIDE_DELAY;
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  function isMobileTouch() {
    return window.innerWidth < 640;
  }

  function pauseAutoAfterManualAction() {
    nextAutoChangeAt.current = Date.now() + MANUAL_PAUSE_DELAY;
  }

  function goToSlide(index: number) {
    pauseAutoAfterManualAction();
    setCurrent(index);
  }

  function prevSlide() {
    pauseAutoAfterManualAction();
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function nextSlide() {
    pauseAutoAfterManualAction();
    setCurrent((prev) => (prev + 1) % slides.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!isMobileTouch()) return;

    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (!isMobileTouch()) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
    const passedThreshold = Math.abs(diffX) > SWIPE_THRESHOLD;

    if (!isHorizontalSwipe || !passedThreshold) return;

    lastSwipeAt.current = Date.now();

    if (diffX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }

  function preventClickAfterSwipe(event: MouseEvent<HTMLDivElement>) {
    if (Date.now() - lastSwipeAt.current < 450) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  const activeSlide = slides[current];

  return (
    <section className="relative overflow-hidden rounded-[16px] bg-[var(--surface)] shadow-[0_12px_32px_var(--shadow)] sm:rounded-[20px] lg:rounded-[22px]">
      <div
        className="relative h-[300px] touch-pan-y sm:h-[390px] md:h-[450px] lg:h-[500px] xl:h-[535px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClickCapture={preventClickAfterSwipe}
      >
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
            href={slide.href}
            aria-label={slide.title}
            className={`group absolute inset-0 transition-all duration-700 ${
              index === current
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-[1400ms] ease-out group-hover:scale-[1.045]"
              style={{ backgroundImage: `url(${slide.image})` }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,38,90,0.58)_0%,rgba(16,38,90,0.22)_42%,rgba(16,38,90,0.05)_100%)] transition duration-500 group-hover:bg-[linear-gradient(90deg,rgba(16,38,90,0.68)_0%,rgba(16,38,90,0.28)_42%,rgba(16,38,90,0.07)_100%)]" />

            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
              <div className="absolute -left-32 top-0 h-full w-[36%] rotate-12 bg-white/16 blur-2xl transition duration-1000 group-hover:translate-x-[520px]" />
            </div>

            <div className="relative z-10 flex h-full items-center px-6 sm:px-10 lg:px-14">
              <div className="max-w-[350px] sm:max-w-[500px]">
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.28em] text-[var(--cos-soft)] drop-shadow-sm sm:text-[0.75rem] md:text-xs">
                  {slide.tag}
                </p>

                <h1 className="mt-2 text-[2.5rem] font-black leading-[0.9] text-white drop-shadow-md sm:text-[3.7rem] md:text-[4.55rem] lg:text-[5.4rem]">
                  {slide.title}
                </h1>

                <div className="mt-4 hidden items-center gap-3 sm:flex">
                  <span className="inline-flex h-11 items-center rounded-full bg-white/92 px-6 text-sm font-extrabold text-[var(--text)] shadow-[0_10px_28px_rgba(0,0,0,0.14)] backdrop-blur transition duration-300 group-hover:translate-x-1 group-hover:bg-[var(--primary)] group-hover:text-white">
                    Ver
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-[var(--primary)]">
                    <FiArrowUpRight className="text-[1.25rem]" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/25 px-3 py-1.5 backdrop-blur-md sm:top-4">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-8 bg-white shadow-sm"
                  : "w-2.5 bg-white/55 hover:bg-white/90"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={prevSlide}
          aria-label="Anterior"
          className="absolute bottom-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[var(--text)] shadow-[0_8px_22px_var(--shadow-strong)] backdrop-blur transition hover:scale-110 hover:bg-white sm:bottom-5 sm:left-5 sm:h-11 sm:w-11 lg:bottom-6 lg:left-6"
        >
          <FiChevronLeft className="text-[1.55rem]" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Siguiente"
          className="absolute bottom-4 left-[64px] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[var(--text)] shadow-[0_8px_22px_var(--shadow-strong)] backdrop-blur transition hover:scale-110 hover:bg-white sm:bottom-5 sm:left-auto sm:right-5 sm:h-11 sm:w-11 lg:bottom-6 lg:right-6"
        >
          <FiChevronRight className="text-[1.55rem]" />
        </button>

        <Link
          href={activeSlide.href}
          className="absolute bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-white/92 px-4 py-2.5 text-xs font-extrabold text-[var(--text)] shadow-[0_12px_30px_var(--shadow-strong)] backdrop-blur transition active:scale-95 sm:hidden"
        >
          <span>{activeSlide.tag}</span>
          <span className="h-4 w-px bg-[var(--border)]" />
          <span className="text-[var(--primary)]">Ver</span>
        </Link>
      </div>
    </section>
  );
}
