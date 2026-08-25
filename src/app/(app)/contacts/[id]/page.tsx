import type { Metadata } from "next";
import { ContactDetail } from "@/components/crm/contact-detail";

export const metadata: Metadata = {
  title: "Contato",
  description: "Detalhes do contato.",
  robots: { index: false, follow: false },
};

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContactDetail id={id} />;
}
