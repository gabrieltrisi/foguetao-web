import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * robots.txt gerado pelo Next. As páginas autenticadas já trazem
 * `robots: { index: false }` no metadata e ficam atrás do proxy de sessão;
 * aqui apenas liberamos o rastreio da vitrine pública e apontamos o sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
