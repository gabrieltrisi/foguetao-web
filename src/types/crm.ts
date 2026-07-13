/** Tipos de domínio do CRM (dados mockados nesta etapa). */
import type { Priority } from "@/types";

export type ContactStatus = "lead" | "ativo" | "cliente" | "inativo";

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organizationId: string;
  organizationName: string;
  owner: string;
  status: ContactStatus;
  tags: string[];
  lastInteraction: string;
  createdAt: string;
};

export type OrganizationSegment = "Tecnologia" | "Varejo" | "Saúde" | "Serviços" | "Educação" | "Indústria";

export type Organization = {
  id: string;
  name: string;
  segment: OrganizationSegment;
  owner: string;
  revenue: number;
  contactsCount: number;
  dealsCount: number;
  status: "ativo" | "prospect" | "inativo";
  website: string;
  location: string;
};

export type PipelineStageId =
  | "novo-lead"
  | "contato"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "ganho";

export type PipelineStage = {
  id: PipelineStageId;
  label: string;
};

export type Deal = {
  id: string;
  title: string;
  contactName: string;
  organizationName: string;
  stageId: PipelineStageId;
  value: number;
  probability: number;
  owner: string;
  tags: string[];
  closeDate: string;
  status: "aberta" | "ganho" | "perdido";
};

export type TaskStatus = "todo" | "doing" | "done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  /** ISO YYYY-MM-DD */
  due: string;
  dueLabel: string;
  priority: Priority;
  status: TaskStatus;
  relatedTo?: string;
};

export type TimelineEventType =
  | "created"
  | "note"
  | "email"
  | "call"
  | "whatsapp"
  | "deal"
  | "task"
  | "stage";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  time: string;
};
