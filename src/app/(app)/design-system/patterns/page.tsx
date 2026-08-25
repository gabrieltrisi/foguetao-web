import type { Metadata } from "next";
import { PatternsShowcase } from "@/components/design-system/patterns-showcase";

export const metadata: Metadata = {
  title: "Padrões & negócio",
  description: "Layouts de página e componentes de negócio.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PatternsShowcase />;
}
