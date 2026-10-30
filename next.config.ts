import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PPR (Partial Prerendering) via cacheComponents: true está DESATIVADO
  // até que todas as páginas autenticadas (admin, oportunidades, favoritos, etc.)
  // possam ser envolvidas em <Suspense> e as queries de BD tenham 'use cache'.
  // Até lá, o site funciona com SSR/ISR clássico, que é compatível com todas as rotas.
  // Reativar quando:
  // 1. Todas as páginas de lista/detalhe envolverem dados dinâmicos em <Suspense>
  // 2. getLatestProperties e getPropertiesByDistrict usarem 'use cache' + revalidateTag
  // 3. Páginas autenticadas usarem unstable_noStore() corretamente com cacheComponents
  //
  // Desativado em: 2026-10-30
  // Motivo: /admin e /app/oportunidades acedem a cookies/session durante prerender,
  // o que bloqueia o build com cacheComponents: true.

  images: {
    localPatterns: [
      {
        pathname: "/api/img/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "media.casasapo.pt",
      },
      {
        protocol: "https",
        hostname: "ireland.apollo.olxcdn.com",
      },
      {
        protocol: "https",
        hostname: "images.egorealestate.com",
      },
      {
        protocol: "https",
        hostname: "scraper.weboto.io",
      },
      {
        protocol: "https",
        hostname: "jackhammer.janeladigital.com",
      },
      {
        protocol: "https",
        hostname: "cdn.proppy.app",
      },
      {
        protocol: "https",
        hostname: "www.caimoveis.pt",
      },
    ],
  },
};

export default nextConfig;
