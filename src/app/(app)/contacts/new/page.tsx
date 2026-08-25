import type { Metadata } from "next";
import { ContactForm } from "@/components/crm/contact-form";

export const metadata: Metadata = {
  title: "Novo contato",
  description: "Cadastre um novo contato.",
};

export default function NewContactPage() {
  return <ContactForm />;
}
