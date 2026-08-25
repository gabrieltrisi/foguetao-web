import * as React from "react";
import {
  Ban,
  Bell,
  Cake,
  Calendar,
  CalendarClock,
  CircleStop,
  Code,
  CreditCard,
  Flame,
  GitBranch,
  Globe,
  ListTodo,
  Mail,
  MessageCircle,
  MousePointerClick,
  PackageCheck,
  Receipt,
  RefreshCw,
  Repeat,
  Send,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Split,
  Star,
  Tag,
  Target,
  Timer,
  UserCog,
  UserPlus,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeCategory } from "@/types/automations";

const ICONS: Record<string, LucideIcon> = {
  Ban, Bell, Cake, Calendar, CalendarClock, CircleStop, Code, CreditCard, Flame,
  GitBranch, Globe, ListTodo, Mail, MessageCircle, MousePointerClick, PackageCheck,
  Receipt, RefreshCw, Repeat, Send, ShoppingCart, Snowflake, Sparkles, Split, Star,
  Tag, Target, Timer, UserCog, UserPlus, Webhook,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Workflow;
}

export const nodeCategoryStyle: Record<NodeCategory, { box: string; icon: string; label: string }> = {
  trigger: { box: "bg-brand-soft border-brand/30", icon: "text-brand", label: "Gatilho" },
  action: { box: "bg-info/10 border-info/30", icon: "text-info", label: "Ação" },
  logic: { box: "bg-warning/10 border-warning/30", icon: "text-warning", label: "Lógica" },
  exit: { box: "bg-line/50 border-line", icon: "text-ink-2", label: "Saída" },
};

/** Renderiza um ícone Lucide pelo nome (evita criar componente em render). */
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  return React.createElement(getIcon(name), { className, "aria-hidden": true });
}

export function NodeIcon({ name, category, className }: { name: string; category: NodeCategory; className?: string }) {
  const s = nodeCategoryStyle[category];
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", s.box, className)}>
      <DynamicIcon name={name} className={cn("size-4", s.icon)} />
    </span>
  );
}
