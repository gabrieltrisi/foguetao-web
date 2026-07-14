import type { Metadata } from "next";
import { TeamForm } from "@/components/admin/team-form";

export const metadata: Metadata = {
  title: "Criar usuário",
  description: "Convide um novo membro para a organização.",
  robots: { index: false, follow: false },
};

export default function NewTeamMemberPage() {
  return <TeamForm />;
}
