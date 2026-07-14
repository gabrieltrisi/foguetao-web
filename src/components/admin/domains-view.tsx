"use client";

import * as React from "react";
import { Globe, Plus, ShieldCheck, ShieldAlert, RefreshCw, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  domains,
  domainStatusLabel,
  domainStatusTone,
  dnsStatusLabel,
  dnsStatusTone,
} from "@/mocks/admin/domains";
import type { Domain } from "@/types/admin";

function DomainCard({ domain, onVerify }: { domain: Domain; onVerify: () => void }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2">
            <Globe className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              <span className="truncate">{domain.domain}</span>
              {domain.primary ? <Star className="size-3.5 shrink-0 fill-brand text-brand" aria-label="Principal" /> : null}
            </p>
            <p className="text-caption text-ink-3">Adicionado em {domain.addedAt}</p>
          </div>
        </div>
        <Badge tone={domainStatusTone[domain.status]}>{domainStatusLabel[domain.status]}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface p-3">
        <div className="flex items-center gap-2 text-body2">
          {domain.ssl ? <ShieldCheck className="size-4 text-success" aria-hidden /> : <ShieldAlert className="size-4 text-warning" aria-hidden />}
          <span className="text-ink-2">SSL</span>
          <span className={domain.ssl ? "font-medium text-success" : "font-medium text-warning"}>{domain.ssl ? "Ativo" : "Pendente"}</span>
        </div>
        <div className="flex items-center gap-2 text-body2">
          <span className="text-ink-2">DNS</span>
          <Badge tone={dnsStatusTone[domain.dns]}>{dnsStatusLabel[domain.dns]}</Badge>
        </div>
      </div>

      {domain.status !== "verified" ? (
        <Button variant="secondary" size="sm" className="w-fit" onClick={onVerify}>
          <RefreshCw className="size-4" aria-hidden /> Verificar domínio
        </Button>
      ) : (
        <p className="text-caption text-ink-3">Domínio verificado e ativo.</p>
      )}
    </Card>
  );
}

export function DomainsView() {
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body2 text-ink-2">{domains.length} domínios configurados</p>
        <Button size="sm" onClick={() => toast({ title: "Adicionar domínio (mock)" })}>
          <Plus className="size-4" aria-hidden /> Adicionar domínio
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {domains.map((d) => (
          <DomainCard key={d.id} domain={d} onVerify={() => toast({ title: `Verificando ${d.domain}… (mock)` })} />
        ))}
      </div>
    </div>
  );
}
