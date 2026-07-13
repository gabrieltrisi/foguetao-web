import { landingPillars } from "@/mocks/landing";

export function PlatformSection() {
  return (
    <section id="plataforma" className="bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-caption font-bold uppercase tracking-widest text-brand">Plataforma</p>
        <h2 className="mt-3 max-w-2xl font-display text-h1 font-bold text-ink sm:text-[28px]">
          Uma operação inteira, em uma única tela.
        </h2>
        <p className="mt-3 max-w-2xl text-body text-ink-2">
          Contatos organizados, pipeline claro, conversas centralizadas, campanhas monitoradas e
          métricas confiáveis — sem trocar de aba.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landingPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="rounded-lg border border-line bg-white p-6 shadow-sm"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-h3 font-semibold text-ink">{pillar.title}</h3>
                <p className="mt-1.5 text-body2 text-ink-2">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
