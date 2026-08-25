/**
 * MOCK DE PREVIEW - Templates de mensagem NAO existe no backend: nao ha model, endpoint
 * nem permissao (auditado na Sprint 1.3). Estes dados sao apenas de
 * demonstracao e NADA e persistido. Serao substituidos quando o dominio for
 * criado no backend. Nenhum dado real de Conversas/Chat/Contas passa por aqui.
 */
import type { Template } from "@/types/messaging";

export const templateCategories = ["Todos", "Saudação", "Vendas", "Suporte", "Financeiro", "Pós-venda"];

export const templates: Template[] = [
  { id: "tpl-1", title: "Boas-vindas", category: "Saudação", favorite: true, body: "Olá {{nome}}! Seja bem-vindo(a) ao Foguetão. Como podemos ajudar hoje?" },
  { id: "tpl-2", title: "Envio de proposta", category: "Vendas", favorite: true, body: "Oi {{nome}}, segue em anexo a proposta comercial. Fico à disposição para dúvidas!" },
  { id: "tpl-3", title: "Follow-up", category: "Vendas", favorite: false, body: "Olá {{nome}}, conseguiu analisar a proposta que enviei? Posso ajudar em algo?" },
  { id: "tpl-4", title: "Ticket recebido", category: "Suporte", favorite: false, body: "Recebemos sua solicitação #{{ticket}} e já estamos analisando. Retornamos em breve." },
  { id: "tpl-5", title: "Segunda via de boleto", category: "Financeiro", favorite: false, body: "Olá {{nome}}, segue a segunda via do seu boleto com vencimento em {{data}}." },
  { id: "tpl-6", title: "Agradecimento", category: "Pós-venda", favorite: true, body: "Obrigado pela confiança, {{nome}}! Qualquer coisa, estamos por aqui. 🚀" },
  { id: "tpl-7", title: "Horário de atendimento", category: "Suporte", favorite: false, body: "Nosso atendimento funciona de seg a sex, das 9h às 18h. Deixe sua mensagem!" },
  { id: "tpl-8", title: "Confirmação de reunião", category: "Vendas", favorite: false, body: "Reunião confirmada para {{data}} às {{hora}}. Enviaremos o link em breve." },
];
