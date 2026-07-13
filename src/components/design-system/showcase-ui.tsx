import { Card } from "@/components/ui/card";

/** Seção padrão do showcase (título + card). */
export function ShowcaseSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-h2 font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-body2 text-ink-2">{description}</p> : null}
      </div>
      <Card className="p-5">{children}</Card>
    </section>
  );
}

/** Rótulo de um exemplo dentro de uma seção. */
export function Example({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption font-medium uppercase tracking-wide text-ink-3">{label}</span>
      {children}
    </div>
  );
}
