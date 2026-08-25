import type { Metadata } from "next";
import { FormsShowcase } from "@/components/design-system/forms-showcase";

export const metadata: Metadata = {
  title: "Formulários",
  description: "Campos, seleção, datas e navegação.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FormsShowcase />;
}
