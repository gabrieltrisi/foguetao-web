import type { Session, SecurityAlert, SecurityLevel } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const sessions: Session[] = [
  { id: "ses-1", device: "MacBook Pro", browser: "Chrome 128", os: "macOS 15", ip: "187.63.•••.14", location: "São Paulo, BR", current: true, lastActive: "Agora" },
  { id: "ses-2", device: "iPhone 15", browser: "Safari", os: "iOS 18", ip: "187.63.•••.52", location: "São Paulo, BR", current: false, lastActive: "Há 40 min" },
  { id: "ses-3", device: "Windows PC", browser: "Edge 128", os: "Windows 11", ip: "201.17.•••.03", location: "Rio de Janeiro, BR", current: false, lastActive: "Ontem, 21:10" },
  { id: "ses-4", device: "Linux Workstation", browser: "Firefox 130", os: "Ubuntu 24.04", ip: "45.229.•••.88", location: "Belo Horizonte, BR", current: false, lastActive: "Há 4 dias" },
];

export const securityAlerts: SecurityAlert[] = [
  { id: "sec-1", level: "danger", title: "Tentativa de login bloqueada", description: "3 tentativas falhas a partir de IP não reconhecido (45.229.•••.88).", time: "Hoje, 13:21" },
  { id: "sec-2", level: "warning", title: "Novo dispositivo conectado", description: "Windows PC · Edge em Rio de Janeiro, BR.", time: "Ontem, 21:10" },
  { id: "sec-3", level: "info", title: "2FA ativado", description: "Autenticação em duas etapas ativada para Camila Ribeiro.", time: "08 jul 2026" },
];

export const securityHistory = [
  { id: "h1", event: "Senha alterada", actor: "Camila Ribeiro", time: "08 jul 2026 · 09:12" },
  { id: "h2", event: "Token de API rotacionado", actor: "Rafael Monteiro", time: "05 jul 2026 · 15:40" },
  { id: "h3", event: "Sessão encerrada remotamente", actor: "Camila Ribeiro", time: "02 jul 2026 · 08:03" },
  { id: "h4", event: "2FA ativado", actor: "Camila Ribeiro", time: "01 jul 2026 · 18:22" },
];

export const securityLevelTone: Record<SecurityLevel, NonNullable<BadgeProps["tone"]>> = {
  info: "info",
  warning: "warning",
  danger: "danger",
};

export const twoFactor = { enabled: true, method: "App autenticador (TOTP)", backupCodes: 8 };
