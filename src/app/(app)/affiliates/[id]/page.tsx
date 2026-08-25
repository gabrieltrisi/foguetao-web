import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffiliateDetail } from "@/components/marketing/affiliate-detail";
import { affiliates, getAffiliateById } from "@/mocks/marketing/affiliates";

export function generateStaticParams() {
  return affiliates.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = getAffiliateById(id);
  return { title: a ? a.name : "Afiliado" };
}

export default async function AffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const affiliate = getAffiliateById(id);
  if (!affiliate) notFound();
  return <AffiliateDetail affiliate={affiliate} />;
}
