import type { ApiKey, ApiKeyStatus } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const apiKeys: ApiKey[] = [
  { id: "key-1", name: "Produção · Backend", scope: "read, write", masked: "sk_live_••••••••••••4821", createdAt: "12 jan 2026", lastUsed: "Há 3 min", expiresAt: "Sem expiração", status: "active" },
  { id: "key-2", name: "Zapier", scope: "read", masked: "sk_live_••••••••••••9f0a", createdAt: "20 fev 2026", lastUsed: "Há 2 h", expiresAt: "31 dez 2026", status: "active" },
  { id: "key-3", name: "Integração n8n", scope: "read, write", masked: "sk_live_••••••••••••7b3c", createdAt: "05 mar 2026", lastUsed: "Ontem", expiresAt: "31 dez 2026", status: "active" },
  { id: "key-4", name: "Homologação", scope: "read", masked: "sk_test_••••••••••••1d2e", createdAt: "10 nov 2025", lastUsed: "Há 30 dias", expiresAt: "10 mai 2026", status: "expired" },
  { id: "key-5", name: "Antigo · Migração", scope: "read, write", masked: "sk_live_••••••••••••0000", createdAt: "01 set 2025", lastUsed: "Há 90 dias", expiresAt: "Revogada", status: "revoked" },
];

export const apiKeyStatusLabel: Record<ApiKeyStatus, string> = {
  active: "Ativa",
  expired: "Expirada",
  revoked: "Revogada",
};

export const apiKeyStatusTone: Record<ApiKeyStatus, NonNullable<BadgeProps["tone"]>> = {
  active: "success",
  expired: "warning",
  revoked: "neutral",
};
