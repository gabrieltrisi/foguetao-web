"use client";

import { Check, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PreviewNotice } from "@/components/admin/preview-notice";
import { useCompany } from "@/hooks/company/use-company";
import { companyPlanMeta } from "@/lib/company/company";
import { plans, planComparison } from "@/mocks/admin/plans";
import type { Plan } from "@/types/admin";

function PlanCard({ plan, current }: { plan: Plan; current: boolean }) {
  return (
    <Card className={cn("relative flex flex-col gap-4 p-6", plan.popular && "border-brand ring-1 ring-brand")}>
      {plan.popular ? (
        <span className="absolute -top-2.5 left-6 rounded-full bg-brand px-2.5 py-0.5 text-micro font-semibold uppercase tracking-wide text-white">Mais popular</span>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-h3 font-bold text-ink">{plan.name}</h3>
        {current ? <Badge tone="success">Plano atual</Badge> : null}
      </div>
      <p className="text-body2 text-ink-2">{plan.description}</p>
      <p className="flex items-baseline gap-1">
        <span className="font-display text-h1 font-bold text-ink">{plan.priceLabel}</span>
        <span className="text-body2 text-ink-3">{plan.period}</span>
      </p>
      <ul className="flex flex-col gap-2">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-body2 text-ink">
            <Check className="size-4 shrink-0 text-success" aria-hidden /> {h}
          </li>
        ))}
      </ul>
      {/* Sem fluxo de upgrade: o backend não expõe rota para trocar de plano
          (o campo `plan` não é editável). Um botão que não faz nada seria pior
          do que dizer a verdade. */}
      <Button variant="secondary" className="mt-auto" disabled>
        {current ? "Plano atual" : "Em breve"}
      </Button>
    </Card>
  );
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-success" aria-label="Incluído" />;
  if (value === false) return <Minus className="mx-auto size-4 text-ink-3" aria-label="Não incluído" />;
  return <span className="text-body2 text-ink">{value}</span>;
}

export function PlansView() {
  const { data: company } = useCompany();
  // O plano ATUAL vem do backend (Company.plan). O catálogo (preços, recursos)
  // não existe lá — segue ilustrativo e marcado como tal.
  const currentPlan = company?.plan;

  return (
    <div className="flex flex-col gap-6">
      <PreviewNotice>
        O plano atual da empresa é real
        {currentPlan ? <> (<strong>{companyPlanMeta[currentPlan].label}</strong>)</> : null}, mas o
        catálogo de preços e recursos abaixo é ilustrativo: não existe rota de planos nem de
        upgrade no backend.
      </PreviewNotice>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            current={currentPlan ? p.name.toUpperCase() === currentPlan : false}
          />
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-4 font-display text-h3 font-semibold text-ink">Comparação de recursos</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                <TableHead className="text-center">Starter</TableHead>
                <TableHead className="text-center">Pro</TableHead>
                <TableHead className="text-center">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planComparison.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-ink">{row.label}</TableCell>
                  <TableCell className="text-center"><Cell value={row.starter} /></TableCell>
                  <TableCell className="text-center"><Cell value={row.pro} /></TableCell>
                  <TableCell className="text-center"><Cell value={row.enterprise} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
}
