import * as React from "react";
import {
  Megaphone,
  BadgeDollarSign,
  BarChart3,
  MessageSquare,
  MessageCircle,
  CreditCard,
  Wallet,
  Calendar,
  HardDrive,
  Sparkles,
  Bot,
  Gem,
  Workflow,
  Dumbbell,
  Stethoscope,
  Utensils,
  ShoppingBag,
  Building2,
  Scale,
  GraduationCap,
  Ellipsis,
  Magnet,
  TrendingUp,
  Headset,
  Camera,
  ThumbsUp,
  Search,
  Music2,
  Globe,
  Users,
  Plug,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  "badge-dollar": BadgeDollarSign,
  chart: BarChart3,
  message: MessageSquare,
  "message-circle": MessageCircle,
  "credit-card": CreditCard,
  wallet: Wallet,
  calendar: Calendar,
  "hard-drive": HardDrive,
  sparkles: Sparkles,
  bot: Bot,
  gem: Gem,
  workflow: Workflow,
  dumbbell: Dumbbell,
  stethoscope: Stethoscope,
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  "building-2": Building2,
  scale: Scale,
  "graduation-cap": GraduationCap,
  ellipsis: Ellipsis,
  magnet: Magnet,
  "trending-up": TrendingUp,
  headset: Headset,
  instagram: Camera,
  facebook: ThumbsUp,
  search: Search,
  music: Music2,
  globe: Globe,
  users: Users,
};

export function getAdminIcon(name: string): LucideIcon {
  return ICONS[name] ?? Plug;
}

/** Renderiza um ícone Lucide pelo nome (evita criar componente em render). */
export function AdminIcon({ name, className }: { name: string; className?: string }) {
  return React.createElement(getAdminIcon(name), { className, "aria-hidden": true });
}
