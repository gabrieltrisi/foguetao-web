import type { Metadata } from "next";
import { OverlaysShowcase } from "@/components/design-system/overlays-showcase";

export const metadata: Metadata = {
  title: "Overlays",
  description: "Popover, sheets, diálogos e paleta de comandos.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OverlaysShowcase />;
}
