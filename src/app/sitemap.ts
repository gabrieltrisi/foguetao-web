import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Sitemap da superfície pública. O produto é majoritariamente autenticado
 * (noindex), então apenas a vitrine (landing) é listada.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteConfig.url, changeFrequency: "weekly", priority: 1 }];
}
