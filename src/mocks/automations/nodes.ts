import type { NodeType } from "@/types/automations";

/** Catálogo de tipos de nó (triggers, ações e lógica). `icon` = nome Lucide. */
export const nodeTypes: NodeType[] = [
  // Triggers
  { id: "trg-lead", label: "Lead criado", category: "trigger", icon: "UserPlus", description: "Dispara quando um novo lead é criado." },
  { id: "trg-contact", label: "Contato atualizado", category: "trigger", icon: "UserCog", description: "Quando um contato é atualizado." },
  { id: "trg-stage", label: "Mudança de etapa", category: "trigger", icon: "GitBranch", description: "Quando uma oportunidade muda de etapa." },
  { id: "trg-message", label: "Mensagem recebida", category: "trigger", icon: "MessageCircle", description: "Quando uma mensagem é recebida." },
  { id: "trg-payment", label: "Pagamento aprovado", category: "trigger", icon: "CreditCard", description: "Quando um pagamento é aprovado." },
  { id: "trg-webhook", label: "Webhook", category: "trigger", icon: "Webhook", description: "Quando um webhook é chamado." },
  { id: "trg-schedule", label: "Agendamento", category: "trigger", icon: "CalendarClock", description: "Em uma recorrência agendada." },
  { id: "trg-date", label: "Data específica", category: "trigger", icon: "Calendar", description: "Em uma data e hora específicas." },
  { id: "trg-manual", label: "Manual", category: "trigger", icon: "MousePointerClick", description: "Disparo manual pelo usuário." },
  { id: "trg-api", label: "API", category: "trigger", icon: "Code", description: "Via chamada de API." },

  // Ações
  { id: "act-whatsapp", label: "Enviar WhatsApp", category: "action", icon: "MessageCircle", description: "Envia uma mensagem no WhatsApp." },
  { id: "act-email", label: "Enviar e-mail", category: "action", icon: "Mail", description: "Envia um e-mail." },
  { id: "act-create-contact", label: "Criar contato", category: "action", icon: "UserPlus", description: "Cria um novo contato." },
  { id: "act-update-lead", label: "Atualizar lead", category: "action", icon: "RefreshCw", description: "Atualiza dados de um lead." },
  { id: "act-move-deal", label: "Mover oportunidade", category: "action", icon: "Target", description: "Move a oportunidade de etapa." },
  { id: "act-task", label: "Criar tarefa", category: "action", icon: "ListTodo", description: "Cria uma tarefa." },
  { id: "act-add-tag", label: "Adicionar tag", category: "action", icon: "Tag", description: "Adiciona uma etiqueta." },
  { id: "act-remove-tag", label: "Remover tag", category: "action", icon: "Ban", description: "Remove uma etiqueta." },
  { id: "act-notify", label: "Notificar equipe", category: "action", icon: "Bell", description: "Notifica um responsável." },
  { id: "act-http", label: "HTTP", category: "action", icon: "Globe", description: "Requisição HTTP externa." },
  { id: "act-ai", label: "IA", category: "action", icon: "Sparkles", description: "Executa uma ação com IA." },

  // Lógica
  { id: "lgc-wait", label: "Esperar", category: "logic", icon: "Timer", description: "Aguarda um período." },
  { id: "lgc-condition", label: "Condição", category: "logic", icon: "Split", description: "Ramifica o fluxo por condição." },
  { id: "lgc-loop", label: "Loop", category: "logic", icon: "Repeat", description: "Repete um bloco." },

  // Saída
  { id: "exit-end", label: "Encerrar fluxo", category: "exit", icon: "CircleStop", description: "Finaliza a automação." },
];

export function getNodeType(typeId: string): NodeType | undefined {
  return nodeTypes.find((n) => n.id === typeId);
}
