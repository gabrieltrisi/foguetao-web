import type { Metadata } from "next";
import { LimitsView } from "@/components/admin/limits-view";

export const metadata: Metadata = {
  title: "Limites",
  description: "Consumo do ciclo atual.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LimitsView />;
}
