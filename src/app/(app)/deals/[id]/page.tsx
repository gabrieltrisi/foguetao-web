import type { Metadata } from "next";
import { DealDetail } from "@/components/crm/deal-detail";

export const metadata: Metadata = {
  title: "Oportunidade",
  description: "Detalhes da oportunidade.",
  robots: { index: false, follow: false },
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealDetail id={id} />;
}
