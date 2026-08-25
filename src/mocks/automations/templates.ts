import type { AutomationCategory, AutomationTemplate } from "@/types/automations";

export const templateCategories: (AutomationCategory | "Todos")[] = [
  "Todos", "Marketing", "Vendas", "Suporte", "Financeiro", "Operações",
];

export const automationTemplates: AutomationTemplate[] = [
  { id: "tpl-welcome", name: "Boas-vindas", category: "Marketing", description: "Recepcione novos leads automaticamente.", nodeCount: 5, icon: "Sparkles", popular: true },
  { id: "tpl-followup", name: "Follow-up", category: "Vendas", description: "Retome contatos sem resposta.", nodeCount: 6, icon: "Send", popular: true },
  { id: "tpl-cart", name: "Carrinho abandonado", category: "Marketing", description: "Recupere vendas com lembretes.", nodeCount: 6, icon: "ShoppingCart", popular: true },
  { id: "tpl-cold", name: "Lead frio", category: "Vendas", description: "Reaqueça leads inativos.", nodeCount: 4, icon: "Snowflake", popular: false },
  { id: "tpl-hot", name: "Lead quente", category: "Vendas", description: "Priorize e distribua leads quentes.", nodeCount: 5, icon: "Flame", popular: true },
  { id: "tpl-reactivate", name: "Reativação", category: "Marketing", description: "Traga clientes de volta.", nodeCount: 4, icon: "RefreshCw", popular: false },
  { id: "tpl-postsale", name: "Pós-venda", category: "Suporte", description: "Acompanhe após a compra.", nodeCount: 4, icon: "PackageCheck", popular: false },
  { id: "tpl-nps", name: "Pesquisa NPS", category: "Suporte", description: "Meça a satisfação dos clientes.", nodeCount: 3, icon: "Star", popular: false },
  { id: "tpl-birthday", name: "Aniversário", category: "Marketing", description: "Envie mensagens em datas especiais.", nodeCount: 3, icon: "Cake", popular: false },
  { id: "tpl-billing", name: "Cobrança", category: "Financeiro", description: "Automatize lembretes de fatura.", nodeCount: 5, icon: "Receipt", popular: true },
];
