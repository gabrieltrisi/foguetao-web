import type { WhatsAppAccount } from "@/types/messaging";

export const whatsappAccounts: WhatsAppAccount[] = [
  { id: "wa-1", name: "Comercial · Matriz SP", number: "+55 11 99876-5432", status: "connected", lastSync: "há 2 min" },
  { id: "wa-2", name: "Suporte", number: "+55 11 98765-4321", status: "connected", lastSync: "há 8 min" },
  { id: "wa-3", name: "Financeiro", number: "+55 21 99654-3210", status: "pending", lastSync: "há 1 h" },
  { id: "wa-4", name: "Filial RJ", number: "+55 21 98543-2109", status: "disconnected", lastSync: "há 3 dias" },
];
