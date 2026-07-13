import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizationDetail } from "@/components/crm/organization-detail";
import { organizations, getOrganizationById } from "@/mocks/crm/organizations";

export function generateStaticParams() {
  return organizations.map((o) => ({ id: o.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const org = getOrganizationById(id);
  return { title: org ? org.name : "Organização" };
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = getOrganizationById(id);
  if (!organization) notFound();
  return <OrganizationDetail organization={organization} />;
}
