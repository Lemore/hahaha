import type { Metadata, Viewport } from "next";
import { UI_TEXT } from "@/lib/ui-text";
import SwRegister from "./sw-register";
import "./globals.css";

export const metadata: Metadata = {
  title: UI_TEXT.title,
  appleWebApp: { capable: true, title: UI_TEXT.title },
};

export const viewport: Viewport = {
  themeColor: "#F6B41F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <head>
        {/* Fonts load from Google Fonts at runtime (ARCHITECTURE 2.3) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* The rule targets pages/; in the root layout the fonts load on every page. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500&family=Secular+One&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
