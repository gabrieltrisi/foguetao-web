import type { IntegrationStatus } from "@/types/api/integrations";

/**
 * Mapa ÚNICO status → apresentação (Sprint 7.1C §10). Toda a UI de onboarding
 * Evolution deriva rótulo/descrição/tom/ações daqui — sem `status === "X"`
 * espalhado por componentes. Pura e testável.
 */

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface EvolutionStatusPresentation {
  label: string;
  description: string;
  tone: StatusTone;
  /** Estado transitório → vale fazer polling de estado. */
  isTransitional: boolean;
  /** Aguardando leitura do QR → exibir/pollar o QR. */
  showQr: boolean;
  canConnect: boolean;
  canDisconnect: boolean;
}

const MAP: Record<IntegrationStatus, EvolutionStatusPresentation> = {
  DRAFT: {
    label: "Rascunho",
    description: "Conexão criada, ainda não provisionada.",
    tone: "neutral",
    isTransitional: true,
    showQr: false,
    canConnect: true,
    canDisconnect: false,
  },
  CONNECTING: {
    label: "Aguardando leitura do QR",
    description: "Abra o WhatsApp no celular e escaneie o QR code para conectar.",
    tone: "info",
    isTransitional: true,
    showQr: true,
    canConnect: false,
    canDisconnect: true,
  },
  CONNECTED: {
    label: "Conectado",
    description: "Instância conectada e pronta para enviar mensagens.",
    tone: "success",
    isTransitional: false,
    showQr: false,
    canConnect: false,
    canDisconnect: true,
  },
  DEGRADED: {
    label: "Conectado (instável)",
    description: "Conectado, mas com instabilidade recente. Reconecte se o envio falhar.",
    tone: "warning",
    isTransitional: false,
    showQr: false,
    canConnect: true,
    canDisconnect: true,
  },
  ERROR: {
    label: "Erro",
    description: "Falha na conexão. Verifique as credenciais e tente reconectar.",
    tone: "danger",
    isTransitional: false,
    showQr: false,
    canConnect: true,
    canDisconnect: true,
  },
  DISCONNECTED: {
    label: "Desconectado",
    description: "Instância desconectada. Reconecte para gerar um novo QR code.",
    tone: "neutral",
    isTransitional: false,
    showQr: false,
    canConnect: true,
    canDisconnect: false,
  },
  REVOKED: {
    label: "Revogado",
    description: "Credenciais revogadas. Recrie a conexão para voltar a usar.",
    tone: "danger",
    isTransitional: false,
    showQr: false,
    canConnect: false,
    canDisconnect: false,
  },
};

export function presentEvolutionStatus(status: IntegrationStatus): EvolutionStatusPresentation {
  return MAP[status];
}
