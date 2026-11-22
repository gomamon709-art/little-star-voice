import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://little-star-voice.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/request"],
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
