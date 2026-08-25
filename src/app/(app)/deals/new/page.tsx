import type { Metadata } from "next";
import { DealForm } from "@/components/crm/deal-form";

export const metadata: Metadata = {
  title: "Nova oportunidade",
  description: "Cadastre uma nova oportunidade.",
  robots: { index: false, follow: false },
};

export default function NewDealPage() {
  return <DealForm />;
}
