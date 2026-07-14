import type { Domain, DomainStatus, DnsStatus } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const domains: Domain[] = [
  { id: "dom-1", domain: "app.foguetao.com.br", status: "verified", ssl: true, dns: "ok", primary: true, addedAt: "12 jan 2026" },
  { id: "dom-2", domain: "crm.foguetao.com.br", status: "verified", ssl: true, dns: "ok", primary: false, addedAt: "20 fev 2026" },
  { id: "dom-3", domain: "go.foguetao.com.br", status: "pending", ssl: false, dns: "pending", primary: false, addedAt: "05 jul 2026" },
  { id: "dom-4", domain: "links.foguetao.io", status: "failed", ssl: false, dns: "error", primary: false, addedAt: "01 jul 2026" },
];

export const domainStatusLabel: Record<DomainStatus, string> = {
  verified: "Verificado",
  pending: "Pendente",
  failed: "Falhou",
};

export const domainStatusTone: Record<DomainStatus, NonNullable<BadgeProps["tone"]>> = {
  verified: "success",
  pending: "warning",
  failed: "danger",
};

export const dnsStatusLabel: Record<DnsStatus, string> = {
  ok: "Configurado",
  pending: "Propagando",
  error: "Erro",
};

export const dnsStatusTone: Record<DnsStatus, NonNullable<BadgeProps["tone"]>> = {
  ok: "success",
  pending: "warning",
  error: "danger",
};
