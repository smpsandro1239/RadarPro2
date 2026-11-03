import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import CookieBanner from "@/components/CookieBanner";
import SeedDataBanner from "@/components/SeedDataBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import Navbar from "@/components/Navbar";
import * as Sentry from "@sentry/nextjs";

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
        <SeedDataBanner />
        {children}
        <CookieBanner />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
