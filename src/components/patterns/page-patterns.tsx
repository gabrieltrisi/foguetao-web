import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";

/** Layout de listagem: header + toolbar/filtros + conteúdo (tabela/lista). */
export function ListPageLayout({
  title,
  description,
  actions,
  toolbar,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={title} description={description} actions={actions} />
      {toolbar}
      {children}
    </div>
  );
}

/** Layout de detalhe: voltar + título + ações, com coluna lateral opcional. */
export function DetailPageLayout({
  title,
  subtitle,
  back,
  actions,
  aside,
  tabs,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label?: string };
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      {back ? (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1 rounded-md text-body2 font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label ?? "Voltar"}
        </Link>
      ) : null}
      <PageHeader title={title} description={subtitle} actions={actions} />
      {tabs}
      {aside ? (
        <TwoColumnLayout main={children} aside={aside} />
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

/** Layout de formulário: header + container centralizado + rodapé de ações. */
export function FormPageLayout({
  title,
  description,
  back,
  footer,
  children,
}: {
  title: string;
  description?: string;
  back?: { href: string; label?: string };
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      {back ? (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1 rounded-md text-body2 font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label ?? "Voltar"}
        </Link>
      ) : null}
      <PageHeader title={title} description={description} />
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-col gap-5">{children}</div>
        {footer ? (
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type SettingsNavItem = { label: string; href: string; active?: boolean };

/** Layout de configurações: navegação lateral + conteúdo. */
export function SettingsPageLayout({
  title,
  description,
  nav,
  children,
}: {
  title: string;
  description?: string;
  nav: SettingsNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={title} description={description} />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Configurações" className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-body2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                item.active ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-surface hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Seção de dashboard com cabeçalho e conteúdo. */
export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <SectionHeader title={title} description={description} action={action} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Duas colunas: conteúdo principal + lateral (empilha no mobile). */
export function TwoColumnLayout({
  main,
  aside,
  asidePosition = "right",
  className,
}: {
  main: React.ReactNode;
  aside: React.ReactNode;
  asidePosition?: "left" | "right";
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-3", className)}>
      {asidePosition === "left" ? (
        <>
          <aside className="lg:col-span-1">{aside}</aside>
          <div className="lg:col-span-2">{main}</div>
        </>
      ) : (
        <>
          <div className="lg:col-span-2">{main}</div>
          <aside className="lg:col-span-1">{aside}</aside>
        </>
      )}
    </div>
  );
}

/** Split pane (lista + detalhe), estilo inbox. Empilha no mobile. */
export function SplitPaneLayout({
  list,
  detail,
  className,
}: {
  list: React.ReactNode;
  detail: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-line bg-white lg:h-[70vh] lg:flex-row",
        className,
      )}
    >
      <div className="shrink-0 border-b border-line lg:w-[340px] lg:border-b-0 lg:border-r lg:overflow-y-auto">
        {list}
      </div>
      <div className="min-w-0 flex-1 lg:overflow-y-auto">{detail}</div>
    </div>
  );
}
