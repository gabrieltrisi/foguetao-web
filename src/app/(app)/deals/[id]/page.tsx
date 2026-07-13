import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DealDetail } from "@/components/crm/deal-detail";
import { deals, getDealById } from "@/mocks/crm/deals";

export function generateStaticParams() {
  return deals.map((d) => ({ id: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deal = getDealById(id);
  return { title: deal ? deal.title : "Oportunidade" };
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = getDealById(id);
  if (!deal) notFound();
  return <DealDetail deal={deal} />;
}
