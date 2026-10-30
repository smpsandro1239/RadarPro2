import type { NextConfig } from "next";

const nextConfig: NextConfig = {

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
