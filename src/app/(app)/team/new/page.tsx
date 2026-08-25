import type { Metadata } from "next";
import { TeamForm } from "@/components/admin/team-form";

export const metadata: Metadata = {
  title: "Convidar membro",
  description: "Convide alguém para participar desta empresa.",
  robots: { index: false, follow: false },
};

export default function NewTeamMemberPage() {
  return <TeamForm />;
}
