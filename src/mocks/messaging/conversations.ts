import type { Channel, Conversation, ConversationStatus } from "@/types/messaging";

const CHANNELS: Channel[] = ["whatsapp", "instagram", "email", "webchat", "whatsapp", "phone"];
const STATUSES: ConversationStatus[] = ["open", "pending", "closed"];
const AGENTS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];

const RAW = [
  { name: "Larissa · Grão Café", preview: "Perfeito, podemos fechar hoje ainda?", time: "10:42", unread: 2 },
  { name: "Vertex Farma", preview: "Recebemos a proposta, obrigado!", time: "09:15", unread: 0 },
  { name: "Núcleo Digital", preview: "Qual o próximo passo?", time: "Ontem", unread: 1 },
  { name: "Studio Ampère", preview: "Podemos marcar para quinta?", time: "Ontem", unread: 0 },
  { name: "Zenit Corp", preview: "Enviei o comprovante em anexo", time: "Seg", unread: 0 },
  { name: "Aurora Labs", preview: "Áudio · 0:42", time: "Seg", unread: 3 },
  { name: "Peça Rara", preview: "Obrigado pelo atendimento!", time: "Dom", unread: 0 },
  { name: "Vinha & Co", preview: "Vocês têm plano anual?", time: "Sex", unread: 1 },
  { name: "Camila Ferraz", preview: "Bom dia! Gostaria de mais informações", time: "Sex", unread: 0 },
  { name: "Rodrigo Nunes", preview: "Foto do produto recebida", time: "Qui", unread: 0 },
];

const LABELS_MAP = [["lbl-3"], ["lbl-2"], ["lbl-1", "lbl-3"], [], ["lbl-4"], ["lbl-1"], ["lbl-5"], ["lbl-3"], ["lbl-2"], []];

export const conversations: Conversation[] = RAW.map((c, i) => ({
  id: `conv-${i + 1}`,
  name: c.name,
  channel: CHANNELS[i % CHANNELS.length],
  preview: c.preview,
  time: c.time,
  unread: c.unread,
  status: STATUSES[i % STATUSES.length],
  labelIds: LABELS_MAP[i] ?? [],
  assignee: AGENTS[i % AGENTS.length],
  online: i % 3 === 0,
}));

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}
