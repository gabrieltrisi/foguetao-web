import type { AutomationVariable, VariableEnv, VariableScope, VariableType } from "@/types/automations";

const ENVS: VariableEnv[] = ["prod", "staging", "dev"];
const SCOPES: VariableScope[] = ["global", "workflow"];

const RAW = [
  { key: "WHATSAPP_TOKEN", value: "wa_9f2c8b1a7d3e4f", type: "secret", desc: "Token da API de WhatsApp" },
  { key: "DEFAULT_OWNER", value: "Camila Ribeiro", type: "string", desc: "Responsável padrão" },
  { key: "WAIT_MINUTES", value: "15", type: "number", desc: "Espera padrão entre passos" },
  { key: "SEND_ON_WEEKEND", value: "false", type: "boolean", desc: "Enviar aos fins de semana" },
  { key: "STRIPE_SECRET", value: "sk_live_51H8xQ2eZ", type: "secret", desc: "Chave do gateway de pagamento" },
  { key: "WELCOME_TEMPLATE", value: "Boas-vindas", type: "string", desc: "Template de boas-vindas" },
  { key: "MAX_RETRIES", value: "3", type: "number", desc: "Tentativas máximas por nó" },
  { key: "PAYLOAD_MAP", value: '{"name":"$.lead.name"}', type: "json", desc: "Mapeamento do payload" },
];

export const automationVariables: AutomationVariable[] = RAW.map((r, i) => ({
  id: `var-${i + 1}`,
  key: r.key,
  type: r.type as VariableType,
  value: r.value,
  environment: ENVS[i % ENVS.length],
  scope: SCOPES[i % SCOPES.length],
  description: r.desc,
}));

export function maskValue(v: AutomationVariable): string {
  if (v.type !== "secret") return v.value;
  const visible = v.value.slice(0, 4);
  return `${visible}${"•".repeat(Math.max(6, v.value.length - 4))}`;
}

export const variableEnvLabel: Record<VariableEnv, string> = { prod: "Produção", staging: "Staging", dev: "Dev" };
export const variableEnvTone: Record<VariableEnv, "success" | "warning" | "info"> = { prod: "success", staging: "warning", dev: "info" };
