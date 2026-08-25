import type { Metadata } from "next";
import { BrandingView } from "@/components/admin/branding-view";

export const metadata: Metadata = {
  title: "Branding",
  description: "White label, cores e logotipo.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BrandingView />;
}
