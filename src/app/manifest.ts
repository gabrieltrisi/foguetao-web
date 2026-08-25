import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E0070F",
    lang: "pt-BR",
    icons: [
      { src: "/brand/favicon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/brand/app-icon.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
    ],
  };
}
