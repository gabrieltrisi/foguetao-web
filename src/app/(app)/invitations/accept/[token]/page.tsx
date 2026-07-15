import type { Metadata } from "next";
import { AcceptInvitation } from "@/components/admin/accept-invitation";

export const metadata: Metadata = {
  title: "Aceitar convite",
  description: "Aceite o convite para participar de uma empresa.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <AcceptInvitation token={token} />;
}
