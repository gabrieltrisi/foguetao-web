import { landingFeatures } from "@/mocks/landing";

export function FeatureGrid() {
  return (
    <section id="recursos" className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-h1 font-bold text-ink sm:text-[28px]">
          Tudo o que sua operação precisa para crescer.
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {landingFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.label}
                className="flex flex-col items-center gap-2 rounded-lg border border-line bg-white px-3 py-5 text-center transition-colors hover:border-brand/40"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-caption font-medium text-ink-2">{feature.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
