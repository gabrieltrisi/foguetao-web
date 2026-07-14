import type { AuditEvent, AuditStatus } from "@/types/analytics";

const USERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado", "Sistema"];
const STATUSES: AuditStatus[] = ["success", "success", "success", "failure", "success", "success"];

const RAW = [
  { action: "Atualizou contato", entity: "Contato #4821", module: "CRM" },
  { action: "Excluiu oportunidade", entity: "Deal #932", module: "CRM" },
  { action: "Conectou conta Meta", entity: "Conta act_1029", module: "Marketing" },
  { action: "Tentativa de login", entity: "Sessão", module: "Segurança" },
  { action: "Publicou automação", entity: "Automação #12", module: "Automações" },
  { action: "Exportou relatório", entity: "Relatório #7", module: "Analytics" },
  { action: "Rotacionou segredo", entity: "Webhook #2", module: "Automações" },
  { action: "Convidou membro", entity: "usuario@empresa.com.br", module: "Equipe" },
  { action: "Alterou permissão", entity: "Papel: Gerente", module: "Equipe" },
  { action: "Enviou campanha", entity: "Campanha #18", module: "Comunicação" },
];

export const auditEvents: AuditEvent[] = RAW.map((r, i) => ({
  id: `audit-${i + 1}`,
  user: USERS[i % USERS.length],
  action: r.action,
  entity: r.entity,
  module: r.module,
  date: `13 jul 2026 · 1${i % 6}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60}`,
  ip: `187.63.•••.${(i * 13) % 255}`,
  requestId: `req_${(9000 + i * 137).toString(16)}`,
  status: STATUSES[i % STATUSES.length],
  metadata: [
    { label: "Método", value: ["POST", "PATCH", "DELETE", "GET"][i % 4] },
    { label: "User-Agent", value: "Chrome 149 · macOS" },
    { label: "Duração", value: `${40 + (i % 8) * 12}ms` },
    { label: "Payload", value: "{ campos sensíveis mascarados }" },
  ],
}));

export const auditModules = ["Todos", "CRM", "Marketing", "Comunicação", "Automações", "Analytics", "Equipe", "Segurança"];

export function getAuditById(id: string): AuditEvent | undefined {
  return auditEvents.find((e) => e.id === id);
}
