import type { Metadata } from "next";
import { UI_TEXT } from "@/lib/ui-text";
import "./globals.css";

export const metadata: Metadata = {
  title: UI_TEXT.title,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
