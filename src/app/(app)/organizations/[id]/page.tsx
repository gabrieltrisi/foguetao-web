import type { Metadata } from "next";
import { OrganizationDetail } from "@/components/crm/organization-detail";

export const metadata: Metadata = {
  title: "Organização",
  description: "Detalhes da organização.",
  robots: { index: false, follow: false },
};

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationDetail id={id} />;
}
