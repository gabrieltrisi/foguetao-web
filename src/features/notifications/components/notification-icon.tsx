import {
  Bell,
  CheckSquare,
  Handshake,
  Image as ImageIcon,
  Inbox as InboxIcon,
  Plug,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { typeMeta } from "../presentation";

const ICONS: Record<string, LucideIcon> = {
  system: Bell,
  crm: Users,
  task: CheckSquare,
  deal: Handshake,
  copilot: Sparkles,
  media: ImageIcon,
  governance: ShieldCheck,
  security: ShieldAlert,
  automation: Workflow,
  integration: Plug,
  inbox: InboxIcon,
};

/** Resolve o ícone lucide para o tipo da notificação (com fallback seguro). */
export function NotificationTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Icon = ICONS[typeMeta(type).icon] ?? Bell;
  return <Icon className={className} aria-hidden />;
}
