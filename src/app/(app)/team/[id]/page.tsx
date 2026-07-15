import type { Metadata } from "next";
import { TeamMemberProfile } from "@/components/admin/team-member-profile";

export const metadata: Metadata = {
  title: "Membro",
  description: "Detalhes do membro da empresa.",
  robots: { index: false, follow: false },
};

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamMemberProfile memberId={id} />;
}
