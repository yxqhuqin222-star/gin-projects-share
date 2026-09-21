"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const siteOrigin = "https://gin-projects-share.yxqhuqin222.workers.dev";
const reporterUrl = "https://counterscale.yxqhuqin222.workers.dev/collect";

export default function Counterscale() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      window.location.origin !== siteOrigin ||
      !pathname
    ) {
      return;
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      lastTrackedPath.current = null;
      return;
    }

    let cancelled = false;
    const url = window.location.origin + pathname + window.location.search;

    // Vinext commits routes without calling the patched history.pushState.
    // Use Counterscale's official manual mode so each committed path reports once.
    void import("@counterscale/tracker")
      .then((tracker) => {
        if (cancelled || lastTrackedPath.current === pathname) return;
        tracker.init({
          siteId: "gin-personal-site",
          reporterUrl,
          autoTrackPageviews: false,
          reportOnLocalhost: false,
        });
        tracker.trackPageview({ url });
        lastTrackedPath.current = pathname;
      })
      .catch(() => {
        console.warn("Counterscale tracker could not be loaded.");
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
