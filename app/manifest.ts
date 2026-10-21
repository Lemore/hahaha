import type { MetadataRoute } from "next";
import { UI_TEXT } from "@/lib/ui-text";

// Web App Manifest (ARCHITECTURE 2.9).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: UI_TEXT.title,
    short_name: UI_TEXT.title,
    lang: "he",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    theme_color: "#F6B41F",
    background_color: "#FFF3D1",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
