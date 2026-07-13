import type { Metadata } from "next";
import { DealForm } from "@/components/crm/deal-form";

export const metadata: Metadata = {
  title: "Nova oportunidade",
  description: "Registre uma nova oportunidade.",
};

export default function NewDealPage() {
  return <DealForm />;
}
