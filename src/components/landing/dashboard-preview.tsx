import { LogoSymbol } from "@/components/brand/logo";

const previewNav = ["Visão geral", "Contatos", "Pipeline", "Conversas", "Campanhas", "Relatórios"];

const previewMetrics = [
  { label: "Leads novos", value: "2.481", delta: "+8,2%" },
  { label: "Oportunidades", value: "384", delta: "+3,1%" },
  { label: "Receita", value: "R$ 428.760", delta: "+12,4%" },
  { label: "ROAS", value: "4,8x", delta: "+0,3x" },
];

const previewFunnel = [
  { label: "Novo lead", pct: 100 },
  { label: "Contato", pct: 74 },
  { label: "Qualificado", pct: 52 },
  { label: "Proposta", pct: 34 },
  { label: "Negociação", pct: 22 },
  { label: "Ganho", pct: 14 },
];

const previewConversations = [
  { initials: "L", name: "Larissa · Grão Café", text: "Podemos fechar hoje?", unread: 2 },
  { initials: "V", name: "Vertex Farma", text: "Recebemos, obrigado!", unread: 0 },
  { initials: "N", name: "Núcleo Digital", text: "Qual o próximo passo?", unread: 1 },
];

/** Mock estático do dashboard exibido no hero da landing (página 6). */
export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
      <div className="flex">
        {/* Mini sidebar */}
        <aside className="hidden w-40 shrink-0 border-r border-line p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-1">
            <LogoSymbol className="h-5 w-5" />
            <span className="font-display text-body2 font-bold text-ink">Foguetão</span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {previewNav.map((label, i) => (
              <li
                key={label}
                className={
                  i === 0
                    ? "rounded-md bg-brand-soft px-2 py-1.5 text-caption font-semibold text-brand"
                    : "px-2 py-1.5 text-caption text-ink-2"
                }
              >
                {label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-micro uppercase tracking-wide text-ink-3">Visão geral</p>
              <p className="font-display text-body font-semibold text-ink">
                Performance · Últimos 7 dias
              </p>
            </div>
            <div className="hidden items-center gap-1 rounded-lg border border-line p-0.5 sm:flex">
              <span className="rounded-md bg-brand-soft px-2 py-1 text-micro font-semibold text-brand">
                7d
              </span>
              <span className="px-2 py-1 text-micro text-ink-2">30d</span>
              <span className="px-2 py-1 text-micro text-ink-2">Este mês</span>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {previewMetrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-line p-2.5">
                <p className="text-micro uppercase tracking-wide text-ink-3">{m.label}</p>
                <p className="mt-1 font-display text-body font-bold text-ink">{m.value}</p>
                <p className="text-micro font-semibold text-success">{m.delta}</p>
              </div>
            ))}
          </div>

          {/* Funil + conversas */}
          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="rounded-lg border border-line p-3 lg:col-span-3">
              <p className="mb-2 text-caption font-semibold text-ink">Funil de vendas</p>
              <ul className="flex flex-col gap-1.5">
                {previewFunnel.map((stage) => (
                  <li key={stage.label} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 truncate text-micro text-ink-2">
                      {stage.label}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${stage.pct}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-micro text-ink-3">
                      {stage.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-line p-3 lg:col-span-2">
              <p className="mb-2 text-caption font-semibold text-ink">Conversas recentes</p>
              <ul className="flex flex-col gap-2">
                {previewConversations.map((c) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-micro font-semibold text-white">
                      {c.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-micro font-semibold text-ink">
                        {c.name}
                      </span>
                      <span className="block truncate text-micro text-ink-3">{c.text}</span>
                    </span>
                    {c.unread > 0 ? (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                        {c.unread}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
