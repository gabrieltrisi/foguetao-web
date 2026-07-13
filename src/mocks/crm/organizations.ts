import type { Organization, OrganizationSegment } from "@/types/crm";

const OWNERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];
const SEGMENTS: OrganizationSegment[] = [
  "Tecnologia", "Varejo", "Saúde", "Serviços", "Educação", "Indústria",
];
const LOCATIONS = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS"];

const BASE = [
  { id: "org-1", name: "Grão Café" },
  { id: "org-2", name: "Vertex Farma" },
  { id: "org-3", name: "Zenit Corp" },
  { id: "org-4", name: "Studio Ampère" },
  { id: "org-5", name: "Núcleo Digital" },
  { id: "org-6", name: "Aurora Labs" },
  { id: "org-7", name: "Peça Rara" },
  { id: "org-8", name: "Vinha & Co" },
];

const STATUSES: Organization["status"][] = ["ativo", "prospect", "inativo"];

export const organizations: Organization[] = BASE.map((o, i) => ({
  id: o.id,
  name: o.name,
  segment: SEGMENTS[i % SEGMENTS.length],
  owner: OWNERS[i % OWNERS.length],
  revenue: 120000 + i * 84500,
  contactsCount: 3 + (i % 6),
  dealsCount: 1 + (i % 4),
  status: STATUSES[i % STATUSES.length],
  website: `${o.name.toLowerCase().replace(/[^a-z]/g, "")}.com.br`,
  location: LOCATIONS[i % LOCATIONS.length],
}));

export const orgStatusLabel: Record<Organization["status"], string> = {
  ativo: "Ativo",
  prospect: "Prospect",
  inativo: "Inativo",
};

export const orgStatusTone: Record<Organization["status"], "success" | "info" | "neutral"> = {
  ativo: "success",
  prospect: "info",
  inativo: "neutral",
};

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}
