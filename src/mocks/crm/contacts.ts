import type { Contact, ContactStatus } from "@/types/crm";

const OWNERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];
const ORGS = [
  { id: "org-1", name: "Grão Café" },
  { id: "org-2", name: "Vertex Farma" },
  { id: "org-3", name: "Zenit Corp" },
  { id: "org-4", name: "Studio Ampère" },
  { id: "org-5", name: "Núcleo Digital" },
  { id: "org-6", name: "Aurora Labs" },
  { id: "org-7", name: "Peça Rara" },
  { id: "org-8", name: "Vinha & Co" },
];
const STATUSES: ContactStatus[] = ["lead", "ativo", "cliente", "inativo"];
const TAGS = ["VIP", "Enterprise", "Inbound", "Trial", "Parceiro", "Evento", "SMB", "Newsletter"];
const ROLES = [
  "Head de Marketing", "CEO", "Gerente Comercial", "Diretora de Vendas", "Analista de CRM",
  "Coordenador", "Sócio-fundador", "CMO", "Gerente de Growth", "Head de Operações",
];

const NAMES = [
  "Camila Ferraz", "Rodrigo Nunes", "Beatriz Sales", "Thiago Amaral", "Larissa Gomes",
  "Fernando Castro", "Juliana Rocha", "Marcelo Prado", "Patrícia Lima", "André Vasconcelos",
  "Renata Duarte", "Gustavo Teixeira", "Aline Barbosa", "Diego Moraes",
];

export const contacts: Contact[] = NAMES.map((name, i) => {
  const org = ORGS[i % ORGS.length];
  const first = name.split(" ")[0].toLowerCase();
  return {
    id: `contact-${i + 1}`,
    name,
    email: `${first}@${org.name.toLowerCase().replace(/[^a-z]/g, "")}.com.br`,
    phone: `11${String(90000 + i * 137).padStart(5, "0")}${String(1000 + i * 7).slice(0, 4)}`,
    role: ROLES[i % ROLES.length],
    organizationId: org.id,
    organizationName: org.name,
    owner: OWNERS[i % OWNERS.length],
    status: STATUSES[i % STATUSES.length],
    tags: [TAGS[i % TAGS.length], TAGS[(i + 3) % TAGS.length]],
    lastInteraction: ["Há 2 h", "Ontem", "Há 3 dias", "Há 1 semana", "Hoje"][i % 5],
    createdAt: `${(i % 27) + 1} jul 2026`,
  };
});

export const contactStatusLabel: Record<ContactStatus, string> = {
  lead: "Lead",
  ativo: "Ativo",
  cliente: "Cliente",
  inativo: "Inativo",
};

export const contactStatusTone: Record<ContactStatus, "info" | "success" | "brand" | "neutral"> = {
  lead: "info",
  ativo: "success",
  cliente: "brand",
  inativo: "neutral",
};

export function getContactById(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}
