import type { Webhook } from "@/types/automations";

function calls(seed: number) {
  const statuses = [200, 200, 200, 500, 200, 401];
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `call-${seed}-${i}`,
    time: `há ${i * 3 + 2} min`,
    status: statuses[(seed + i) % statuses.length],
    ip: `187.63.${(seed + i) % 255}.${(i * 17) % 255}`,
  }));
}

export const webhooks: Webhook[] = [
  { id: "wh-1", name: "Checkout — pagamento", endpoint: "https://hooks.foguetao.com.br/wh/pay_9f2c8b", method: "POST", status: "active", secret: "whsec_9f2c8b1a7d3e4f5061", calls: calls(1) },
  { id: "wh-2", name: "Formulário — lead", endpoint: "https://hooks.foguetao.com.br/wh/lead_3a7d1e", method: "POST", status: "active", secret: "whsec_3a7d1e9c2b8f4056", calls: calls(2) },
  { id: "wh-3", name: "Integração ERP", endpoint: "https://hooks.foguetao.com.br/wh/erp_5c2b8f", method: "PUT", status: "inactive", secret: "whsec_5c2b8f0a1d3e4f70", calls: calls(3) },
];

export function maskSecret(secret: string): string {
  return `${secret.slice(0, 10)}${"•".repeat(12)}`;
}
