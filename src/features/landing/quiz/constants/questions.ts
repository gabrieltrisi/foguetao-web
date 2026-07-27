import type { QuizQuestion, SegmentoOption } from "../types";
import type { SegmentId } from "@/config/landing/segments";

/**
 * As 6 perguntas do diagnóstico — uma por tela. A ordem é a ordem do fluxo.
 * A Pergunta 1 (segmento) carrega `segmentId` em cada opção, ligando o quiz ao
 * motor de segmentos existente (personaliza a landing ao concluir).
 */
export const QUESTIONS: QuizQuestion[] = [
  {
    id: "segmento",
    eyebrow: "Sobre o seu negócio",
    title: "Qual é o seu segmento?",
    subtitle: "Vamos calibrar o diagnóstico para a sua realidade.",
    options: [
      { id: "consultoria", label: "Consultoria", emoji: "💼", segmentId: "prestador-servico" },
      { id: "agencia", label: "Agência", emoji: "🎯", segmentId: "agencia" },
      { id: "academia", label: "Academia", emoji: "🏋️", segmentId: "academia" },
      { id: "imobiliaria", label: "Imobiliária", emoji: "🏠", segmentId: "imobiliaria" },
      { id: "clinica", label: "Clínica", emoji: "🩺", segmentId: "clinica" },
      { id: "ecommerce", label: "E-commerce", emoji: "🛒", segmentId: "loja" },
      { id: "infoproduto", label: "Infoproduto", emoji: "🎓", segmentId: "outro" },
      { id: "outro", label: "Outro", emoji: "✨", segmentId: "outro" },
    ],
  },
  {
    id: "dor",
    eyebrow: "O maior gargalo",
    title: "Qual é a sua maior dificuldade hoje?",
    subtitle: "Escolha a que mais pesa no seu comercial.",
    options: [
      { id: "followup", label: "Follow-up", emoji: "⏰", hint: "Leads esfriam sem retorno" },
      { id: "organizacao", label: "Organização", emoji: "🗂️", hint: "Informação espalhada" },
      { id: "equipe", label: "Equipe", emoji: "👥", hint: "Time desalinhado" },
      { id: "whatsapp", label: "WhatsApp", emoji: "💬", hint: "Conversas se perdem" },
      { id: "conversao", label: "Conversão", emoji: "📈", hint: "Poucos fechamentos" },
      { id: "automacao", label: "Automação", emoji: "⚙️", hint: "Tudo manual" },
    ],
  },
  {
    id: "equipe",
    eyebrow: "O time comercial",
    title: "Quantas pessoas vendem?",
    subtitle: "Considere quem faz contato e fecha negócio.",
    options: [
      { id: "solo", label: "Só eu", emoji: "🧑" },
      { id: "pequena", label: "2 a 3", emoji: "👥" },
      { id: "media", label: "4 a 10", emoji: "👨‍👩‍👧" },
      { id: "grande", label: "Mais de 10", emoji: "🏢" },
    ],
  },
  {
    id: "leads",
    eyebrow: "O volume",
    title: "Quantos leads chegam por mês?",
    subtitle: "Uma estimativa já ajuda o diagnóstico.",
    options: [
      { id: "poucos", label: "Até 20", emoji: "🌱" },
      { id: "medio", label: "20 a 100", emoji: "📥" },
      { id: "alto", label: "100 a 500", emoji: "🔥" },
      { id: "muito_alto", label: "Mais de 500", emoji: "🌊" },
    ],
  },
  {
    id: "controle",
    eyebrow: "A ferramenta atual",
    title: "Como vocês controlam isso hoje?",
    subtitle: "Onde ficam seus contatos e o andamento das vendas.",
    options: [
      { id: "planilha", label: "Planilha", emoji: "📊" },
      { id: "whatsapp", label: "WhatsApp", emoji: "💬" },
      { id: "crm", label: "Um CRM", emoji: "🧭" },
      { id: "notion", label: "Notion / Docs", emoji: "📝" },
      { id: "memoria", label: "Na memória", emoji: "🧠" },
      { id: "outro", label: "Outro", emoji: "✨" },
    ],
  },
  {
    id: "objetivo",
    eyebrow: "A meta",
    title: "Qual é o seu principal objetivo?",
    subtitle: "Para onde você quer levar a operação.",
    options: [
      { id: "vendas", label: "Vender mais", emoji: "🚀" },
      { id: "organizacao", label: "Ter organização", emoji: "🗂️" },
      { id: "escalar", label: "Escalar o time", emoji: "📈" },
      { id: "automatizar", label: "Automatizar", emoji: "⚙️" },
      { id: "indicadores", label: "Ter indicadores", emoji: "📊" },
    ],
  },
];

export const QUESTION_COUNT = QUESTIONS.length;

/** Mapa segmento do quiz → SegmentId do motor de segmentos da landing. */
export const SEGMENT_MAP: Record<SegmentoOption, SegmentId> = QUESTIONS[0].options.reduce(
  (acc, opt) => {
    acc[opt.id as SegmentoOption] = opt.segmentId ?? "outro";
    return acc;
  },
  {} as Record<SegmentoOption, SegmentId>,
);

/** Rótulo exibível do segmento escolhido (o texto que o usuário viu). */
export const SEGMENT_LABELS: Record<SegmentoOption, string> = QUESTIONS[0].options.reduce(
  (acc, opt) => {
    acc[opt.id as SegmentoOption] = opt.label;
    return acc;
  },
  {} as Record<SegmentoOption, string>,
);
