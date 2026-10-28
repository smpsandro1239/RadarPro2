import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ],
  },
};

export default nextConfig;
