"use client";

import { useEffect } from "react";

// Registers the service worker in production only, so it never caches dev builds.
export default function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // The app works without the service worker; nothing to show.
      });
  }, []);

  return null;
}
