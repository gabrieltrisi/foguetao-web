import type { ActivityEntry, ActivityModule } from "@/types/analytics";

const RAW: { module: ActivityModule; actor: string; text: string; time: string }[] = [
  { module: "crm", actor: "Camila Ribeiro", text: "**Camila** criou o contato **Núcleo Digital**", time: "há 4 min" },
  { module: "mensagens", actor: "WhatsApp", text: "**WhatsApp** recebeu mensagem de **Larissa · Grão Café**", time: "há 12 min" },
  { module: "automacoes", actor: "Sistema", text: "Automação **Boas-vindas** executada com sucesso", time: "há 20 min" },
  { module: "campanhas", actor: "Rafael Monteiro", text: "**Rafael** pausou a campanha **Remarketing**", time: "há 38 min" },
  { module: "crm", actor: "Bruno Alcântara", text: "**Bruno** moveu **Zenit Corp** para **Negociação**", time: "há 1 h" },
  { module: "integracoes", actor: "Sistema", text: "Integração **Meta Ads** sincronizada", time: "há 1 h" },
  { module: "equipe", actor: "Camila Ribeiro", text: "**Camila** convidou **novo membro**", time: "há 2 h" },
  { module: "mensagens", actor: "Larissa Prado", text: "**Larissa** encerrou a conversa com **Vertex Farma**", time: "há 2 h" },
  { module: "automacoes", actor: "Sistema", text: "Automação **Carrinho abandonado** falhou (retry 2/3)", time: "há 3 h" },
  { module: "campanhas", actor: "Rafael Monteiro", text: "**Rafael** criou a campanha **Black Week**", time: "há 4 h" },
  { module: "crm", actor: "Você", text: "**Você** adicionou nota em **Studio Ampère**", time: "há 5 h" },
  { module: "integracoes", actor: "Sistema", text: "Token do **Google Ads** expirou", time: "há 6 h" },
];

export const activityEntries: ActivityEntry[] = RAW.map((r, i) => ({ id: `act-${i + 1}`, ...r }));

export const activityModuleLabel: Record<ActivityModule, string> = {
  crm: "CRM",
  mensagens: "Mensagens",
  campanhas: "Campanhas",
  automacoes: "Automações",
  integracoes: "Integrações",
  equipe: "Equipe",
};
