import type { Metadata } from "next";
import { Suspense } from "react";
import { Cairo } from "next/font/google";
import { getPublicContent } from "@/lib/data/public";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "مكتب النائب علاء سليمان",
  description: "خدمة المواطنين: تقديم الطلبات ومتابعة الحالات وحجز المواعيد",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const { siteName } = await getPublicContent();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-cream font-sans text-ink"
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <SiteHeader siteName={siteName} />
        </Suspense>
        {children}
        <SiteFooter siteName={siteName} />
      </body>
    </html>
  );
}
