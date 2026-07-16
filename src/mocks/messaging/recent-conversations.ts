import type { ConversationItem } from "@/types";

/**
 * MOCK — PERTENCE AO MÓDULO MESSAGING, NÃO AO DASHBOARD COMERCIAL.
 *
 * O widget "Conversas recentes" é exibido no Dashboard, mas os dados são de
 * Messaging, que ainda NÃO possui contrato integrado. O mock vive aqui (e não
 * em `@/mocks/dashboard`, que deixou de existir) para deixar explícito que:
 *
 * - nenhum dado de CRM se mistura com ele — KPIs, funil, performance, tarefas e
 *   atividades do Dashboard Comercial são 100% reais;
 * - será substituído INTEGRALMENTE na Sprint 1.3 (Messaging), quando o contrato
 *   real de conversas for integrado;
 * - é o ÚNICO mock restante do Dashboard.
 */
export const recentConversations: ConversationItem[] = [
  {
    id: "c1",
    name: "Larissa · Grão Café",
    initials: "L",
    preview: "Perfeito, podemos fechar hoje ainda?",
    channel: "WhatsApp · Camila R.",
    time: "10:42",
    unread: 2,
  },
  {
    id: "c2",
    name: "Vertex Farma",
    initials: "V",
    preview: "Recebemos a proposta, obrigado!",
    channel: "WhatsApp · Rafael M.",
    time: "09:15",
    unread: 0,
  },
  {
    id: "c3",
    name: "Núcleo Digital",
    initials: "N",
    preview: "Qual o próximo passo?",
    channel: "WhatsApp · Você",
    time: "Ontem",
    unread: 1,
  },
  {
    id: "c4",
    name: "Studio Ampère",
    initials: "S",
    preview: "Podemos marcar para quinta.",
    channel: "WhatsApp · Bruno A.",
    time: "Ontem",
    unread: 0,
  },
];
