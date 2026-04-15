"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const prefetchRoutes = ["/dashboard", "/mangas", "/admin"];

export default function NavigationSpeedup() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    for (const route of prefetchRoutes) {
      router.prefetch(route);
    }

    void fetch("/api/manga?page=1&limit=6", {
      credentials: "include",
      cache: "force-cache",
    }).catch(() => undefined);
  }, [router]);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
        setPending(true);
      }
    }

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!pending) return;

    const timeout = window.setTimeout(() => setPending(false), 8000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  if (!pending) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-emerald-50">
      <div className="h-full w-1/2 animate-[nav-progress_1s_ease-in-out_infinite] bg-emerald-700" />
    </div>
  );
}
