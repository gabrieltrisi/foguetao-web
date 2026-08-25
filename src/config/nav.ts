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
  Sparkles,
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
  /**
   * Oculto da navegação (Sprint MVP 1): o módulo continua implementado e a
   * rota permanece acessível por URL direta, mas não aparece na sidebar.
   * Removido da experiência do usuário sem apagar código.
   */
  hidden?: boolean;
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
      { label: "Agenda", href: "/agenda", icon: Calendar, hidden: true },
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
      { label: "Etiquetas", href: "/tags", icon: TagsIcon, hidden: true },
      { label: "Campos personalizados", href: "/custom-fields", icon: SlidersHorizontal, hidden: true },
    ],
  },
  {
    title: "Comunicação",
    items: [
      { label: "Inbox", href: "/inbox", icon: MessagesSquare },
      { label: "Campanhas", href: "/whatsapp/campaigns", icon: Megaphone },
      { label: "Criativos", href: "/creatives", icon: Sparkles },
      { label: "Conversas", href: "/conversations", icon: MessagesSquare, hidden: true },
      { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle, hidden: true },
      { label: "Campanhas (Marketing)", href: "/campaigns", icon: Megaphone, hidden: true },
      { label: "Grupos", href: "/groups", icon: UsersRound, badge: "Em breve", disabled: true, hidden: true },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Meta Ads", href: "/meta-ads", icon: MonitorPlay, hidden: true },
      { label: "Google Ads", href: "/google-ads", icon: BadgeDollarSign, hidden: true },
      { label: "Afiliados", href: "/affiliates", icon: Share2, hidden: true },
      { label: "Rastreamento", href: "/tracking", icon: Radar, hidden: true },
    ],
  },
  {
    title: "Automação",
    items: [
      { label: "Automações", href: "/automations", icon: Workflow, hidden: true },
      { label: "Integrações", href: "/integrations", icon: Plug, hidden: true },
      { label: "WhatsApp (Evolution)", href: "/integrations/evolution", icon: MessageCircle },
    ],
  },
  {
    title: "Análise",
    items: [
      { label: "Relatórios", href: "/reports", icon: BarChart3, hidden: true },
      { label: "Performance", href: "/performance", icon: LineChart, hidden: true },
    ],
  },
  {
    title: "Administração",
    items: [
      { label: "Equipe", href: "/team", icon: UserCog, hidden: true },
      { label: "Auditoria", href: "/audit", icon: ShieldCheck, hidden: true },
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
