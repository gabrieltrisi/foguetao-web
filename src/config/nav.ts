import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  Building2,
  Calendar,
  HelpCircle,
  MonitorPlay,
  LayoutGrid,
  LineChart,
  ListTodo,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plug,
  Radar,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  SquareKanban,
  Tags as TagsIcon,
  Target,
  UserCog,
  Users,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Rótulo de badge exibido ao lado do item (ex.: "Em breve"). */
  badge?: string;
  /** Item inativo (sem navegação real por enquanto). */
  disabled?: boolean;
};

export type NavSection = {
  /** Título do grupo exibido na sidebar expandida. */
  title: string;
  items: NavItem[];
};

/**
 * Mapa de navegação — fiel à página 11 do design reference.
 * A ordem dos grupos e itens deve ser preservada.
 */
export const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Visão geral", href: "/dashboard", icon: LayoutGrid },
      { label: "Agenda", href: "/agenda", icon: Calendar },
      { label: "Tarefas", href: "/tasks", icon: ListTodo },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Contatos", href: "/contacts", icon: Users },
      { label: "Organizações", href: "/organizations", icon: Building2 },
      { label: "Pipeline", href: "/pipeline", icon: SquareKanban },
      { label: "Oportunidades", href: "/deals", icon: Target },
      { label: "Etiquetas", href: "/tags", icon: TagsIcon },
      { label: "Campos personalizados", href: "/custom-fields", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Comunicação",
    items: [
      { label: "Conversas", href: "/conversations", icon: MessagesSquare },
      { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { label: "Campanhas", href: "/campaigns", icon: Megaphone },
      { label: "Grupos", href: "/groups", icon: UsersRound, badge: "Em breve", disabled: true },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Meta Ads", href: "/meta-ads", icon: MonitorPlay },
      { label: "Google Ads", href: "/google-ads", icon: BadgeDollarSign },
      { label: "Afiliados", href: "/affiliates", icon: Share2 },
      { label: "Rastreamento", href: "/tracking", icon: Radar },
    ],
  },
  {
    title: "Automação",
    items: [
      { label: "Automações", href: "/automations", icon: Workflow },
      { label: "Integrações", href: "/integrations", icon: Plug },
    ],
  },
  {
    title: "Análise",
    items: [
      { label: "Relatórios", href: "/reports", icon: BarChart3 },
      { label: "Performance", href: "/performance", icon: LineChart },
    ],
  },
  {
    title: "Administração",
    items: [
      { label: "Equipe", href: "/team", icon: UserCog },
      { label: "Auditoria", href: "/audit", icon: ShieldCheck },
      { label: "Configurações", href: "/settings", icon: Settings },
    ],
  },
];

/** Itens do rodapé da sidebar. */
export const sidebarFooterNav = {
  help: { label: "Ajuda", href: "/help", icon: HelpCircle },
} as const;

/** Ícone neutro reutilizável para estados de análise. */
export const performanceIcon = Activity;

/** Lista achatada de todos os itens navegáveis (para breadcrumb/lookup). */
export const allNavItems: NavItem[] = navSections.flatMap((section) => section.items);
