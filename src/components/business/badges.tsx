import {
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Plug,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EntityAvatar } from "@/components/business/entity-avatar";

// Re-exporta os badges de status já existentes para uso conjunto.
export { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";

export type Channel = "whatsapp" | "email" | "instagram" | "phone" | "sms" | "webchat";

const channelConfig: Record<
  Channel,
  { label: string; icon: LucideIcon; tone: NonNullable<BadgeProps["tone"]> }
> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, tone: "success" },
  email: { label: "E-mail", icon: Mail, tone: "info" },
  instagram: { label: "Instagram", icon: Share2, tone: "brand" },
  phone: { label: "Telefone", icon: Phone, tone: "neutral" },
  sms: { label: "SMS", icon: MessageCircle, tone: "neutral" },
  webchat: { label: "Webchat", icon: Globe, tone: "info" },
};

/** Badge de canal de comunicação. */
export function ChannelBadge({ channel, size }: { channel: Channel; size?: BadgeProps["size"] }) {
  const c = channelConfig[channel];
  const Icon = c.icon;
  return (
    <Badge tone={c.tone} size={size} className="normal-case">
      <Icon className="size-3" aria-hidden />
      {c.label}
    </Badge>
  );
}

export type IntegrationStatus = "connected" | "pending" | "error" | "disconnected";

const integrationStatus: Record<IntegrationStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "Conectado", dot: "bg-success", text: "text-success" },
  pending: { label: "Pendente", dot: "bg-warning", text: "text-warning" },
  error: { label: "Erro", dot: "bg-danger", text: "text-danger" },
  disconnected: { label: "Desconectado", dot: "bg-ink-3", text: "text-ink-3" },
};

/** Badge de status de integração (com nome opcional e ícone). */
export function IntegrationBadge({
  name,
  status,
  icon: Icon = Plug,
}: {
  name?: string;
  status: IntegrationStatus;
  icon?: LucideIcon;
}) {
  const s = integrationStatus[status];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-2.5 py-1 text-small">
      <Icon className="size-3.5 text-ink-2" aria-hidden />
      {name ? <span className="font-medium text-ink">{name}</span> : null}
      <span className="inline-flex items-center gap-1">
        <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
        <span className={s.text}>{s.label}</span>
      </span>
    </span>
  );
}

/** Badge do responsável (owner) — avatar + nome. */
export function OwnerBadge({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <EntityAvatar name={name} size="sm" className="size-5 text-[9px]" />
      <span className="text-body2 text-ink">{name}</span>
    </span>
  );
}
