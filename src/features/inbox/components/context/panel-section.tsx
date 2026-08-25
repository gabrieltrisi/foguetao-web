"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Card de UMA seção do Painel Contextual (F6). ISOLADO: cada card tem seu próprio
 * estado (loading/erro/retry/vazio/sem-permissão) — nunca bloqueia o painel inteiro.
 * Pura apresentação; a query fica no card específico.
 */
export function PanelSection({
  title,
  action,
  denied,
  isLoading,
  isError,
  isEmpty,
  emptyLabel = "Nada por aqui.",
  onRetry,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  denied?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyLabel?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-label={title} className={cn("border-b border-line px-3 py-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-micro font-semibold uppercase tracking-wide text-ink-3">{title}</h3>
        {action}
      </div>
      {denied ? (
        <p className="text-caption text-ink-3">Sem permissão para ver esta seção.</p>
      ) : isLoading ? (
        <div className="space-y-2" aria-hidden>
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col items-start gap-1.5 text-caption text-ink-3">
          <span className="inline-flex items-center gap-1.5 text-danger">
            <AlertCircle className="size-3.5" aria-hidden /> Não foi possível carregar.
          </span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            >
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : isEmpty ? (
        <p className="text-caption text-ink-3">{emptyLabel}</p>
      ) : (
        children
      )}
    </section>
  );
}

/** Linha rótulo→valor (usada em vários cards). */
export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 text-caption">
      <span className="shrink-0 text-ink-3">{label}</span>
      <span className="min-w-0 truncate text-right text-ink">{value}</span>
    </div>
  );
}
