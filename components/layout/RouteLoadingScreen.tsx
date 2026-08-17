"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SHOW_AFTER_MS = 650;
const MIN_VISIBLE_MS = 350;
const MAX_LOADING_MS = 2200;

export default function RouteLoadingScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeKey = `${pathname}?${searchParams.toString()}`;

  const previousRoute = useRef(routeKey);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const shownAt = useRef<number>(0);

  const [visible, setVisible] = useState(false);

  function clearShowTimer() {
    if (showTimer.current) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  }

  function clearHideTimer() {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  function clearSafetyTimer() {
    if (safetyTimer.current) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }

  function clearAllTimers() {
    clearShowTimer();
    clearHideTimer();
    clearSafetyTimer();
  }

  function forceStopLoading() {
    clearAllTimers();
    setVisible(false);
  }

  function startPossibleLoading() {
    clearAllTimers();

    showTimer.current = window.setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(true);

      safetyTimer.current = window.setTimeout(() => {
        forceStopLoading();
      }, MAX_LOADING_MS);
    }, SHOW_AFTER_MS);
  }

  function stopLoading() {
    clearShowTimer();
    clearSafetyTimer();

    const elapsed = Date.now() - shownAt.current;
    const remaining = visible ? Math.max(0, MIN_VISIBLE_MS - elapsed) : 0;

    clearHideTimer();

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
    }, remaining);
  }

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;

      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      const isExternal =
        link.target === "_blank" ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#");

      if (isExternal) return;

      const nextUrl = new URL(href, window.location.origin);
      const currentUrl = new URL(window.location.href);

      const sameRoute =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;

      if (sameRoute) return;

      startPossibleLoading();
    };

    const handlePageShow = () => {
      forceStopLoading();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        forceStopLoading();
      }
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    if (previousRoute.current !== routeKey) {
      previousRoute.current = routeKey;
      stopLoading();
    }
  }, [routeKey]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[color-mix(in_srgb,var(--bg)_68%,transparent)] px-5 backdrop-blur-[3px]">
      <div className="pointer-events-none flex flex-col items-center justify-center rounded-[30px] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] px-9 py-8 shadow-[0_18px_55px_var(--shadow-strong)] backdrop-blur-md">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[7px] border-[var(--border-soft)]" />
          <div className="absolute inset-0 animate-spin rounded-full border-[7px] border-transparent border-b-[var(--primary)] border-r-[var(--primary)]" />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[1.7rem] font-extrabold text-[var(--primary)] shadow-sm">
            C
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}