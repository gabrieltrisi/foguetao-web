import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamMemberProfile } from "@/components/admin/team-member-profile";
import { teamMembers, getMemberById } from "@/mocks/admin/team";

export function generateStaticParams() {
  return teamMembers.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = getMemberById(id);
  return { title: m ? m.name : "Usuário", robots: { index: false, follow: false } };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <TeamMemberProfile member={member} />;
}
