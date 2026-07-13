import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/components/design-system/showcase";

export const metadata: Metadata = {
  title: "Design System",
  description: "Referência viva dos componentes, estados e tokens do Foguetão.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
