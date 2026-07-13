import {
  BadgeDollarSign,
  Gift,
  Globe,
  Leaf,
  Mail,
  MessageCircle,
  MonitorPlay,
  Music2,
  PanelTop,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { campaignStatusLabel, campaignStatusTone } from "@/mocks/marketing/campaigns";
import { commissionStatusLabel, commissionStatusTone } from "@/mocks/marketing/affiliates";
import type { CampaignStatus, CommissionStatus, MarketingChannel } from "@/types/marketing";

const channelConfig: Record<MarketingChannel, { label: string; icon: LucideIcon; color: string }> = {
  meta: { label: "Meta", icon: MonitorPlay, color: "text-info" },
  google: { label: "Google", icon: BadgeDollarSign, color: "text-warning" },
  tiktok: { label: "TikTok", icon: Music2, color: "text-ink" },
  instagram: { label: "Instagram", icon: Share2, color: "text-brand" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-success" },
  email: { label: "E-mail", icon: Mail, color: "text-info" },
  organico: { label: "Orgânico", icon: Leaf, color: "text-success" },
  direto: { label: "Direto", icon: Globe, color: "text-ink-2" },
  indicacao: { label: "Indicação", icon: Users, color: "text-brand" },
  landing: { label: "Landing", icon: PanelTop, color: "text-info" },
  afiliado: { label: "Afiliado", icon: Gift, color: "text-warning" },
};

/** Badge de canal de marketing (ícone + rótulo). */
export function ChannelBadge({ channel, className }: { channel: MarketingChannel; className?: string }) {
  const c = channelConfig[channel];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-body2 text-ink", className)}>
      <Icon className={cn("size-4 shrink-0", c.color)} aria-hidden />
      {c.label}
    </span>
  );
}

export function channelLabel(channel: MarketingChannel): string {
  return channelConfig[channel].label;
}

export function CampaignStatusBadge({ status, size }: { status: CampaignStatus; size?: BadgeProps["size"] }) {
  return (
    <Badge tone={campaignStatusTone[status]} size={size}>
      {campaignStatusLabel[status]}
    </Badge>
  );
}

export function CommissionStatusBadge({ status, size }: { status: CommissionStatus; size?: BadgeProps["size"] }) {
  return (
    <Badge tone={commissionStatusTone[status]} size={size}>
      {commissionStatusLabel[status]}
    </Badge>
  );
}
