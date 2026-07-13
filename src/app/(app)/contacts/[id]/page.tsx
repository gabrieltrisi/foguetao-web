import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactDetail } from "@/components/crm/contact-detail";
import { contacts, getContactById } from "@/mocks/crm/contacts";

export function generateStaticParams() {
  return contacts.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const contact = getContactById(id);
  return { title: contact ? contact.name : "Contato" };
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = getContactById(id);
  if (!contact) notFound();
  return <ContactDetail contact={contact} />;
}
