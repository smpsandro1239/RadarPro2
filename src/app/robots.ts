import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/styleguide"],
    },
    sitemap: "https://radarpro-portugal.vercel.app/sitemap.xml",
  };
}
