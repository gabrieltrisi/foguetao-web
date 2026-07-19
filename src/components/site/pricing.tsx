import { cn } from "@/lib/utils";
import { MagneticButton } from "./primitives";
import { Reveal, PhaseHeading } from "./mission";

/**
 * Planos — "órbitas". ESQUELETO honesto: a estrutura existe, mas os valores e
 * limites ainda não. Nada de preço inventado: cada plano mostra "Sob consulta"
 * e um aviso visível de que os números serão definidos. As features listadas
 * são só capacidades reais já mostradas na landing (CRM, WhatsApp, painel etc.).
 */
export function Pricing() {
  return (
    <section id="planos" className="relative mx-auto max-w-[1400px] px-6 py-32 sm:px-10 sm:py-44">
      <PhaseHeading phase="+" label="Planos — Órbitas" title={<>Escolha a sua órbita.</>}>
        Do primeiro lançamento à operação em escala. Comece pelo teste de 14 dias e
        suba de órbita quando o time crescer.
      </PhaseHeading>

      {/* Aviso honesto: preços/limites são placeholder até você definir. */}
      <Reveal className="mt-8">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-white/45 uppercase">
          <span className="bg-brand size-1.5 animate-pulse rounded-full" />
          Estrutura ilustrativa — valores e limites a definir
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 0.08}>
            <PlanCard plan={plan} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured;
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-6 transition-colors sm:p-7",
        featured
          ? "border-brand/45 bg-brand/[0.05] shadow-[0_24px_80px_-40px_rgba(224,7,15,0.6)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20",
      )}
    >
      {featured ? (
        <span className="bg-brand absolute -top-3 left-6 rounded-full px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-white uppercase">
          Mais escolhido
        </span>
      ) : null}

      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
        <span className={cn("size-2 rotate-45", featured ? "bg-brand" : "border border-white/30")} />
      </div>
      <p className="mt-2 text-sm text-white/55">{plan.tagline}</p>

      <div className="mt-6 flex items-end gap-2">
        <span className="font-display text-3xl font-bold text-white">Sob consulta</span>
      </div>
      <span className="mt-1 font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase">
        {plan.priceNote}
      </span>

      <ul className="mt-6 flex-1 space-y-3 border-t border-white/8 pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[13.5px] text-white/75">
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                featured ? "bg-brand" : "bg-white/40",
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      <MagneticButton
        href="/register"
        variant={featured ? "primary" : "ghost"}
        className="mt-7 w-full justify-center py-3 text-[13px]"
      >
        {plan.cta}
      </MagneticButton>
    </div>
  );
}

interface Plan {
  name: string;
  tagline: string;
  priceNote: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Decolagem",
    tagline: "Para tirar a operação do chão.",
    priceNote: "14 dias grátis · sem cartão",
    features: [
      "CRM com pipeline visual",
      "Caixa de WhatsApp integrada",
      "Painel de métricas ao vivo",
      "Importação de contatos",
    ],
    cta: "Começar agora",
  },
  {
    name: "Órbita",
    tagline: "Para o time em ritmo de crescimento.",
    priceNote: "limites a definir",
    features: [
      "Tudo do Decolagem",
      "Campanhas e disparos",
      "Permissões por papel",
      "Histórico e auditoria",
    ],
    cta: "Assumir o controle",
    featured: true,
  },
  {
    name: "Missão",
    tagline: "Para escala, com controle total.",
    priceNote: "condições a definir",
    features: [
      "Tudo do Órbita",
      "Múltiplos canais e times",
      "Acesso via API",
      "Suporte prioritário",
    ],
    cta: "Falar sobre escala",
  },
];
