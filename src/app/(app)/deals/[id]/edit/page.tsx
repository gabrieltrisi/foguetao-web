import type { Metadata } from "next";
import { DealForm } from "@/components/crm/deal-form";

export const metadata: Metadata = {
  title: "Editar oportunidade",
  robots: { index: false, follow: false },
};

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealForm dealId={id} />;
}
