import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/san-pham`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/san-pham?type=handwritten`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/san-pham?type=postcard`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/chinh-sach`, changeFrequency: "monthly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...products.map((p) => ({
      url: `${site.url}/san-pham/${p.slug}`,
      lastModified: p.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
