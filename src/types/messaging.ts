/** Tipos do módulo de Comunicação (dados mockados). */
import type { Channel } from "@/components/business/badges";

export type { Channel };

export type ConversationStatus = "open" | "pending" | "closed";

export type ConversationLabel = { id: string; name: string; color: LabelColor };

export type Conversation = {
  id: string;
  name: string;
  channel: Channel;
  preview: string;
  time: string;
  unread: number;
  status: ConversationStatus;
  labelIds: string[];
  assignee: string;
  online: boolean;
};

export type MessageAuthor = "contact" | "agent" | "system";
export type MessageType = "text" | "image" | "document" | "audio" | "system";

export type Message = {
  id: string;
  conversationId: string;
  author: MessageAuthor;
  type: MessageType;
  /** Texto (text/system) ou legenda. */
  content: string;
  time: string;
  /** document */
  fileName?: string;
  fileSize?: string;
  /** audio */
  duration?: string;
  read?: boolean;
};

export type AccountStatus = "connected" | "disconnected" | "pending";

export type WhatsAppAccount = {
  id: string;
  name: string;
  number: string;
  status: AccountStatus;
  lastSync: string;
};

export type Template = {
  id: string;
  title: string;
  category: string;
  body: string;
  favorite: boolean;
};

export type LabelColor = "brand" | "info" | "success" | "warning" | "danger" | "neutral";

export type Label = {
  id: string;
  name: string;
  color: LabelColor;
  count: number;
};

export type QueueStatus = "online" | "busy" | "paused";

export type Queue = {
  id: string;
  name: string;
  agents: number;
  capacity: number;
  waiting: number;
  avgTime: string;
  status: QueueStatus;
};
