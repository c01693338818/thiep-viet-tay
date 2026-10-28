import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/don-hang/", "/thanh-toan", "/gio-hang"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
