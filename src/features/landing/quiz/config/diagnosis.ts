/**
 * Cópia do diagnóstico (texto por dor/objetivo/segmento). Separada dos números
 * (`weights.ts`) — aqui mora tudo que é apresentado ao usuário. Reaproveita as
 * chaves de ícone dos benefícios da landing (BenefitIconKey) para os recursos.
 */
import type { SegmentId } from "@/config/landing/segments";
import type {
  ControleOption,
  DorOption,
  Gap,
  ObjetivoOption,
  RecommendedFeature,
  RecommendedPlan,
} from "../types";

/** Gargalo primário derivado da dor escolhida (Pergunta 2). */
export const DOR_GAP: Record<DorOption, Gap> = {
  followup: {
    id: "followup",
    title: "Follow-up sem cadência",
    body: "Leads esfriam porque o retorno depende de memória. Sem lembrete no lugar certo, a oportunidade escapa.",
  },
  organizacao: {
    id: "organizacao",
    title: "Informação espalhada",
    body: "Contatos, conversas e propostas em lugares diferentes. Ninguém enxerga o todo — e decisões atrasam.",
  },
  equipe: {
    id: "equipe",
    title: "Time desalinhado",
    body: "Cada vendedor com sua versão da verdade. Sem base única, o gestor não sabe onde está cada negócio.",
  },
  whatsapp: {
    id: "whatsapp",
    title: "WhatsApp desconectado do funil",
    body: "As conversas que mais vendem ficam fora do histórico do cliente. O que foi combinado se perde.",
  },
  conversao: {
    id: "conversao",
    title: "Conversão sem previsibilidade",
    body: "Sem funil visível, é impossível saber o que vai fechar — nem onde os negócios estão travando.",
  },
  automacao: {
    id: "automacao",
    title: "Operação 100% manual",
    body: "Tarefas repetitivas consomem o tempo que deveria ir para vender. Nada acontece sozinho.",
  },
};

/** Gargalo do método de controle atual (só os informais geram gargalo). */
export const CONTROL_GAP: Partial<Record<ControleOption, Gap>> = {
  memoria: {
    id: "controle-memoria",
    title: "Sem histórico centralizado",
    body: "Na memória, cada follow-up recomeça do zero. Não há rastro do que já foi conversado.",
  },
  whatsapp: {
    id: "controle-whatsapp",
    title: "Sem funil além das conversas",
    body: "O WhatsApp guarda mensagens, não etapas de venda. Fica difícil ver o que avança e o que parou.",
  },
  planilha: {
    id: "controle-planilha",
    title: "Planilha não escala",
    body: "Resolve no começo, mas quebra com volume e com o time: sem lembretes, sem histórico, sem visão ao vivo.",
  },
};

/** Gargalo de descompasso volume × ferramenta informal. */
export const VOLUME_MISMATCH_GAP: Gap = {
  id: "volume-mismatch",
  title: "Volume alto sem rastreio",
  body: "Com esse fluxo de leads e um controle informal, é certo perder oportunidades sem nem saber onde.",
};

/** Recursos do Foguetão recomendados a partir da dor. */
export const DOR_FEATURES: Record<DorOption, RecommendedFeature[]> = {
  followup: [
    { icon: "bell", title: "Follow-up que não escapa", body: "Tarefas e lembretes no lugar certo — nenhuma oportunidade esquecida." },
    { icon: "zap", title: "Automação de cadência", body: "Dispare o próximo passo automaticamente ao mover o negócio." },
  ],
  organizacao: [
    { icon: "layers", title: "Tudo num painel", body: "Contatos, pipeline, negócios e tarefas conversando entre si." },
    { icon: "chart", title: "Visão ao vivo", body: "O estado real da operação, sem consolidar planilha." },
  ],
  equipe: [
    { icon: "users", title: "Time na mesma base", body: "Todos veem o mesmo pipeline e os mesmos números." },
    { icon: "chart", title: "Visão do gestor", body: "Acompanhe quem cuida de cada lead e como andam as metas." },
  ],
  whatsapp: [
    { icon: "zap", title: "WhatsApp no histórico", body: "As conversas viram etapas do funil, ligadas ao contato." },
    { icon: "bell", title: "Nada se perde", body: "O que foi combinado fica registrado e vira tarefa." },
  ],
  conversao: [
    { icon: "trendingUp", title: "Previsão de fechamento", body: "Saiba o que vai fechar antes do fim do mês." },
    { icon: "chart", title: "Conversão por etapa", body: "Veja onde os negócios travam e ataque o gargalo." },
  ],
  automacao: [
    { icon: "zap", title: "Automação de tarefas", body: "Regras que criam tarefas e movem negócios por você." },
    { icon: "bell", title: "Lembretes automáticos", body: "O próximo passo aparece sozinho, na hora certa." },
  ],
};

/** Recurso adicional pela meta (Pergunta 6). */
export const OBJETIVO_FEATURE: Record<ObjetivoOption, RecommendedFeature> = {
  vendas: { icon: "trendingUp", title: "Previsibilidade de receita", body: "O funil mostra onde está cada real e o que fecha no mês." },
  organizacao: { icon: "layers", title: "Menos ferramentas", body: "Uma plataforma no lugar de cinco abas abertas." },
  escalar: { icon: "users", title: "Pronto para escalar o time", body: "Cada vendedor com acesso e permissões por função." },
  automatizar: { icon: "zap", title: "Automação de ponta a ponta", body: "Do lead novo ao follow-up, menos trabalho manual." },
  indicadores: { icon: "chart", title: "Indicadores em tempo real", body: "Decisão por dado ao vivo, não pela planilha de ontem." },
};

/** Planos recomendados (framing de recomendação — o teste é sempre 14 dias grátis). */
export const PLANS: Record<"essencial" | "pro" | "escala", RecommendedPlan> = {
  essencial: {
    name: "Essencial",
    rationale: "Comece pelo teste de 14 dias e organize o comercial sem planilha — o essencial para não perder lead.",
  },
  pro: {
    name: "Pro",
    rationale: "Seu volume já pede pipeline, follow-up automático e visão de time num painel só.",
  },
  escala: {
    name: "Escala",
    rationale: "Operação de alto volume: automação, permissões por função e indicadores em tempo real.",
  },
};

export interface SegmentFlavor {
  /** Plural do nicho (ex.: "academias"). */
  nounPlural: string;
  /** O que destrava crescimento no nicho (frase curta, minúscula). */
  focus: string;
  /** Prova/estatística de reforço (social proof honesto, sem número inventado). */
  proof: string;
}

const DEFAULT_FLAVOR: SegmentFlavor = {
  nounPlural: "times comerciais",
  focus: "transformar cada lead em cliente com follow-up e organização",
  proof: "Quem centraliza a operação num CRM converte mais do mesmo volume de leads — sem aumentar o tráfego.",
};

/** Sabor por segmento (fallback no default). Só o que muda por nicho. */
export const SEGMENT_FLAVOR: Partial<Record<SegmentId, SegmentFlavor>> = {
  academia: {
    nounPlural: "academias e estúdios",
    focus: "levar o interessado da aula experimental à matrícula",
    proof: "Academias que acompanham cada aula experimental no funil fecham mais matrículas do mesmo interesse.",
  },
  clinica: {
    nounPlural: "clínicas",
    focus: "converter o contato em consulta e a consulta em retorno",
    proof: "Clínicas que organizam contatos e retornos num só lugar reduzem faltas e recuperam pacientes.",
  },
  imobiliaria: {
    nounPlural: "imobiliárias",
    focus: "acompanhar o interessado da visita até a assinatura",
    proof: "Imobiliárias que rastreiam cada visita e proposta perdem menos negócio por falta de retorno.",
  },
  agencia: {
    nounPlural: "agências",
    focus: "transformar propostas em contratos recorrentes",
    proof: "Agências que centralizam propostas e follow-up fecham mais contratos do mesmo pipeline.",
  },
  loja: {
    nounPlural: "e-commerces e lojas",
    focus: "recuperar carrinho e transformar atendimento em recompra",
    proof: "Lojas que ligam o atendimento ao histórico do cliente vendem mais para quem já comprou.",
  },
  estetica: {
    nounPlural: "estúdios de estética",
    focus: "encher a agenda e trazer o cliente de volta",
    proof: "Estúdios que acompanham retornos e pacotes num CRM mantêm a agenda cheia o mês todo.",
  },
  nutricionista: {
    nounPlural: "nutricionistas",
    focus: "converter a avaliação em plano e o plano em acompanhamento",
    proof: "Quem organiza avaliações e retornos num só lugar mantém mais pacientes em acompanhamento.",
  },
  "prestador-servico": {
    nounPlural: "prestadores de serviço",
    focus: "transformar orçamentos em serviços fechados",
    proof: "Prestadores que dão follow-up nos orçamentos fecham mais do mesmo número de pedidos.",
  },
};

export function getSegmentFlavor(id: SegmentId): SegmentFlavor {
  return SEGMENT_FLAVOR[id] ?? DEFAULT_FLAVOR;
}

/** Prioridade de ação derivada da dor (Pergunta 2). */
export const DOR_PRIORITY: Record<DorOption, string> = {
  followup: "Estabelecer uma cadência de follow-up com lembretes automáticos.",
  organizacao: "Centralizar contatos, conversas e negócios num painel único.",
  equipe: "Colocar o time na mesma base, com visão do gestor.",
  whatsapp: "Ligar o WhatsApp ao histórico e às etapas do funil.",
  conversao: "Tornar o funil visível para atacar onde o negócio trava.",
  automacao: "Automatizar tarefas repetitivas e os próximos passos.",
};

/** Prioridade quando o controle atual é informal. */
export const CONTROL_PRIORITY = "Migrar do controle informal para um funil com histórico e rastreio.";

/** Prioridade de reforço derivada da meta (Pergunta 6). */
export const OBJETIVO_PRIORITY: Record<ObjetivoOption, string> = {
  vendas: "Acompanhar a previsão de fechamento para bater a meta do mês.",
  organizacao: "Padronizar o processo comercial num só lugar.",
  escalar: "Preparar acessos e permissões para crescer o time com controle.",
  automatizar: "Desenhar automações do lead novo ao follow-up.",
  indicadores: "Acompanhar métricas de conversão em tempo real.",
};

/* --- Rótulos em linguagem natural (para o resumo executivo) --- */

export const DOR_RISK_LABEL: Record<DorOption, string> = {
  followup: "o follow-up que escapa",
  organizacao: "a informação espalhada",
  equipe: "o time desalinhado",
  whatsapp: "as conversas que ficam fora do funil",
  conversao: "a conversão sem previsibilidade",
  automacao: "o excesso de trabalho manual",
};

export const CONTROLE_LABEL: Record<ControleOption, string> = {
  planilha: "em planilhas",
  whatsapp: "no WhatsApp",
  crm: "em um CRM",
  notion: "em Notion/documentos",
  memoria: "de memória",
  outro: "de forma informal",
};

export const LEADS_LABEL: Record<string, string> = {
  poucos: "até 20",
  medio: "de 20 a 100",
  alto: "de 100 a 500",
  muito_alto: "mais de 500",
};

export const EQUIPE_LABEL: Record<string, string> = {
  solo: "você sozinho(a)",
  pequena: "um time de 2 a 3 pessoas",
  media: "um time de 4 a 10 pessoas",
  grande: "um time de mais de 10 pessoas",
};

export const OBJETIVO_LABEL: Record<ObjetivoOption, string> = {
  vendas: "vender mais",
  organizacao: "organizar a operação",
  escalar: "escalar o time",
  automatizar: "reduzir o trabalho manual",
  indicadores: "ter indicadores confiáveis",
};

/** Próximo passo concreto derivado da dor. */
export const DOR_NEXT_STEP: Record<DorOption, string> = {
  followup: "Ative lembretes de follow-up para não deixar nenhum lead esfriar.",
  organizacao: "Traga tudo para um painel só e ganhe visão da operação.",
  equipe: "Dê acesso ao time e acompanhe quem cuida de cada negócio.",
  whatsapp: "Conecte o WhatsApp para registrar cada conversa no contato.",
  conversao: "Acompanhe a conversão por etapa e priorize o que está quente.",
  automacao: "Crie sua primeira automação e reduza o trabalho manual.",
};
