"use client";

import Link from "next/link";
import {
  Building2,
  Palette,
  Globe,
  CreditCard,
  Users,
  ShieldCheck,
  KeyRound,
  Plug,
  Store,
  Gauge,
  ArrowRight,
  UserCog,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompany } from "@/hooks/company/use-company";
import { companyPlanMeta, companyStatusMeta } from "@/lib/company/company";

const groups: { title: string; items: { href: string; label: string; description: string; icon: typeof Building2 }[] }[] = [
  {
    title: "Empresa",
    items: [
      { href: "/company/general", label: "Dados da empresa", description: "Nome, documento, contato e localização.", icon: Building2 },
      { href: "/company/branding", label: "Branding", description: "White label, cores e logotipo.", icon: Palette },
      { href: "/company/domains", label: "Domínios", description: "Domínios personalizados e SSL.", icon: Globe },
      { href: "/company/plans", label: "Plano & Billing", description: "Assinatura, faturas e pagamento.", icon: CreditCard },
      { href: "/company/limits", label: "Limites de uso", description: "Consumo do ciclo atual.", icon: Gauge },
    ],
  },
  {
    title: "Acesso",
    items: [
      { href: "/team", label: "Equipe", description: "Usuários, cargos e status.", icon: Users },
      { href: "/roles", label: "Papéis", description: "Perfis de acesso da organização.", icon: UserCog },
      { href: "/permissions", label: "Permissões", description: "Matriz de permissões por módulo.", icon: ShieldCheck },
      { href: "/security", label: "Segurança", description: "Sessões, 2FA e alertas.", icon: ShieldCheck },
      { href: "/api-keys", label: "API Keys", description: "Chaves de integração.", icon: KeyRound },
    ],
  },
  {
    title: "Extensões",
    items: [
      { href: "/integrations", label: "Integrações", description: "Conecte ferramentas externas.", icon: Plug },
      { href: "/marketplace", label: "Marketplace", description: "Templates e automações prontas.", icon: Store },
    ],
  },
];

export function SettingsView() {
  const { data: company, isLoading } = useCompany();

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Building2 className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="mt-1.5 h-4 w-32" />
              </>
            ) : (
              <>
                <p className="truncate font-display text-h3 font-semibold text-ink">
                  {company?.name ?? "Empresa"}
                </p>
                <p className="truncate text-caption text-ink-3">
                  {company?.document ?? company?.slug ?? "—"}
                </p>
              </>
            )}
          </div>
        </div>
        {company ? (
          <div className="flex items-center gap-2">
            <Badge tone={companyStatusMeta[company.status].tone}>
              {companyStatusMeta[company.status].label}
            </Badge>
            <Badge tone="brand">Plano {companyPlanMeta[company.plan].label}</Badge>
          </div>
        ) : null}
      </Card>

      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-3">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-ink-2">{g.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border border-line bg-white p-4 shadow-sm transition-colors hover:border-brand/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2 group-hover:text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center justify-between gap-1 font-medium text-ink">
                      {item.label}
                      <ArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
                    </p>
                    <p className="text-caption text-ink-3">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
