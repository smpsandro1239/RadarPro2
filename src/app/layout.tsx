import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
