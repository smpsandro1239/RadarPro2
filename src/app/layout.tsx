import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import CookieBanner from "@/components/CookieBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import Navbar from "@/components/Navbar";
import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.1,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
  });
}

export const metadata: Metadata = {
  title: "RadarPro Portugal - Oportunidades Imobiliárias",
  description: "Encontre imóveis abaixo do preço de mercado em Lisboa, Porto e Braga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="antialiased">
        <Navbar />
        {children}
        <CookieBanner />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
