import {
  BadgeDollarSign,
  BarChart3,
  Building2,
  Calendar,
  HelpCircle,
  LineChart,
  MonitorPlay,
  ListTodo,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plug,
  Radar,
  Settings,
  Share2,
  ShieldCheck,
  SquareKanban,
  Target,
  UserCog,
  Users,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type RouteMeta = {
  /** Título exibido no PageHeader e no <title> da rota. */
  title: string;
  /** Descrição curta abaixo do título. */
  description: string;
  /** Configuração do EmptyState do placeholder. */
  empty: {
    icon: LucideIcon;
    title: string;
    description: string;
  };
  /** Ação principal coerente com a rota. */
  action?: {
    label: string;
  };
  /** Rótulo informativo (ex.: "Em breve"). */
  badge?: string;
};

/**
 * Metadados das rotas internas — usados por placeholders e breadcrumb.
 * Conteúdo textual segue os exemplos do design reference.
 */
export const routeMeta: Record<string, RouteMeta> = {
  "/agenda": {
    title: "Agenda",
    description: "Organize compromissos e acompanhe seus próximos eventos.",
    empty: {
      icon: Calendar,
      title: "Sua agenda está vazia.",
      description: "Crie um evento para começar a organizar sua rotina comercial.",
    },
    action: { label: "Novo evento" },
  },
  "/tasks": {
    title: "Tarefas",
    description: "Acompanhe as tarefas pendentes do seu time.",
    empty: {
      icon: ListTodo,
      title: "Nenhuma tarefa pendente.",
      description: "Crie tarefas para não perder nenhum follow-up importante.",
    },
    action: { label: "Nova tarefa" },
  },
  "/contacts": {
    title: "Contatos",
    description: "Gerencie a base de contatos da sua operação.",
    empty: {
      icon: Users,
      title: "Nenhum contato encontrado.",
      description: "Adicione contatos manualmente ou importe sua base atual.",
    },
    action: { label: "Novo contato" },
  },
  "/organizations": {
    title: "Organizações",
    description: "Empresas e contas vinculadas aos seus contatos.",
    empty: {
      icon: Building2,
      title: "Nenhuma organização cadastrada.",
      description: "Cadastre empresas para agrupar contatos e oportunidades.",
    },
    action: { label: "Nova organização" },
  },
  "/pipeline": {
    title: "Pipeline",
    description: "Visualize e mova oportunidades entre as etapas de venda.",
    empty: {
      icon: SquareKanban,
      title: "Seu pipeline ainda não possui oportunidades.",
      description: "Crie a primeira oportunidade para acompanhar o funil de vendas.",
    },
    action: { label: "Criar oportunidade" },
  },
  "/deals": {
    title: "Oportunidades",
    description: "Todas as oportunidades da sua operação comercial.",
    empty: {
      icon: Target,
      title: "Nenhuma oportunidade em aberto.",
      description: "Registre oportunidades para acompanhar receita e conversão.",
    },
    action: { label: "Nova oportunidade" },
  },
  "/conversations": {
    title: "Conversas",
    description: "Central de mensagens de todos os canais.",
    empty: {
      icon: MessagesSquare,
      title: "Você ainda não possui conversas.",
      description: "Conecte um canal e centralize o atendimento em uma única inbox.",
    },
    action: { label: "Iniciar conversa" },
  },
  "/whatsapp": {
    title: "WhatsApp",
    description: "Atendimento e disparos via WhatsApp.",
    empty: {
      icon: MessageCircle,
      title: "Nenhum número conectado.",
      description: "Conecte um número de WhatsApp para começar a conversar.",
    },
    action: { label: "Conectar número" },
  },
  "/campaigns": {
    title: "Campanhas",
    description: "Crie e acompanhe campanhas de comunicação.",
    empty: {
      icon: Megaphone,
      title: "Nenhuma campanha criada.",
      description: "Crie sua primeira campanha para engajar sua base.",
    },
    action: { label: "Nova campanha" },
  },
  "/groups": {
    title: "Grupos",
    description: "Gestão de grupos e comunidades.",
    empty: {
      icon: UsersRound,
      title: "Grupos chegam em breve.",
      description: "Estamos preparando a gestão de grupos para a sua operação.",
    },
    badge: "Em breve",
  },
  "/meta-ads": {
    title: "Meta Ads",
    description: "Desempenho das suas campanhas na Meta.",
    empty: {
      icon: MonitorPlay,
      title: "Nenhuma conta da Meta conectada.",
      description: "Conecte sua conta de anúncios para acompanhar os resultados.",
    },
    action: { label: "Conectar conta" },
  },
  "/google-ads": {
    title: "Google Ads",
    description: "Desempenho das suas campanhas no Google.",
    empty: {
      icon: BadgeDollarSign,
      title: "Nenhuma conta do Google conectada.",
      description: "Conecte sua conta de anúncios para acompanhar os resultados.",
    },
    action: { label: "Conectar conta" },
  },
  "/affiliates": {
    title: "Afiliados",
    description: "Gerencie seu programa de afiliados.",
    empty: {
      icon: Share2,
      title: "Nenhum afiliado cadastrado.",
      description: "Convide parceiros para promover sua operação.",
    },
    action: { label: "Convidar afiliado" },
  },
  "/tracking": {
    title: "Rastreamento",
    description: "Acompanhe a origem e a jornada dos seus leads.",
    empty: {
      icon: Radar,
      title: "Nenhum evento rastreado.",
      description: "Configure o rastreamento para medir a origem das conversões.",
    },
    action: { label: "Configurar rastreamento" },
  },
  "/automations": {
    title: "Automações",
    description: "Automatize fluxos de vendas e comunicação.",
    empty: {
      icon: Workflow,
      title: "Nenhuma automação ativa.",
      description: "Crie automações para ganhar escala sem esforço manual.",
    },
    action: { label: "Nova automação" },
  },
  "/integrations": {
    title: "Integrações",
    description: "Conecte o Foguetão às suas ferramentas.",
    empty: {
      icon: Plug,
      title: "Nenhuma integração configurada.",
      description: "Conecte ferramentas para centralizar sua operação.",
    },
    action: { label: "Adicionar integração" },
  },
  "/reports": {
    title: "Relatórios",
    description: "Relatórios detalhados da sua operação.",
    empty: {
      icon: BarChart3,
      title: "Nenhum relatório disponível.",
      description: "Gere relatórios para analisar os resultados do período.",
    },
    action: { label: "Gerar relatório" },
  },
  "/performance": {
    title: "Performance",
    description: "Indicadores-chave de performance do time.",
    empty: {
      icon: LineChart,
      title: "Sem dados de performance ainda.",
      description: "Os indicadores aparecem assim que houver atividade registrada.",
    },
  },
  "/team": {
    title: "Equipe",
    description: "Gerencie membros e permissões da sua conta.",
    empty: {
      icon: UserCog,
      title: "Convide sua equipe.",
      description: "Adicione membros para colaborar na mesma operação.",
    },
    action: { label: "Convidar membro" },
  },
  "/audit": {
    title: "Auditoria",
    description: "Histórico de ações e eventos de segurança.",
    empty: {
      icon: ShieldCheck,
      title: "Nenhum registro de auditoria.",
      description: "As ações realizadas na conta aparecem aqui.",
    },
  },
  "/settings": {
    title: "Configurações",
    description: "Ajuste as preferências da sua conta e workspace.",
    empty: {
      icon: Settings,
      title: "Configurações da conta.",
      description: "As opções de configuração serão exibidas aqui.",
    },
  },
  "/help": {
    title: "Ajuda",
    description: "Central de ajuda e suporte do Foguetão.",
    empty: {
      icon: HelpCircle,
      title: "Como podemos ajudar?",
      description: "Nossa central de ajuda estará disponível em breve.",
    },
    action: { label: "Falar com o suporte" },
  },
};
