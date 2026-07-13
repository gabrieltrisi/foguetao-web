"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export type SortDirection = "asc" | "desc" | false;

/** Botão de ordenação para o cabeçalho da tabela. */
export function SortButton({
  label,
  direction,
  onClick,
  className,
}: {
  label: string;
  direction: SortDirection;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ordenar por ${label}`}
      className={cn(
        "-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-caption font-semibold uppercase tracking-wide text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        direction && "text-ink",
        className,
      )}
    >
      {label}
      {direction === "asc" ? (
        <ArrowUp className="size-3.5" aria-hidden />
      ) : direction === "desc" ? (
        <ArrowDown className="size-3.5" aria-hidden />
      ) : (
        <ChevronsUpDown className="size-3.5 text-ink-3" aria-hidden />
      )}
    </button>
  );
}

/** Menu de visibilidade de colunas. */
export function ColumnVisibilityMenu({
  columns,
  onToggle,
}: {
  columns: { id: string; label: string; visible: boolean; canHide?: boolean }[];
  onToggle: (id: string, visible: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <SlidersHorizontal />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((c) => (
          <label
            key={c.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-body2 text-ink hover:bg-surface",
              c.canHide === false && "pointer-events-none opacity-50",
            )}
          >
            <Checkbox
              checked={c.visible}
              disabled={c.canHide === false}
              onCheckedChange={(v) => onToggle(c.id, v === true)}
            />
            {c.label}
          </label>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Barra de ações em massa (aparece quando há seleção). */
export function BulkActionBar({
  count,
  onClear,
  children,
  className,
}: {
  count: number;
  onClear?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Ações em massa"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-line bg-ink px-4 py-2.5 text-white shadow-md",
        className,
      )}
    >
      <span className="text-body2 font-semibold">{count} selecionado(s)</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Limpar seleção"
        className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-small text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="size-3.5" aria-hidden />
        Limpar
      </button>
    </div>
  );
}

/** Toolbar da tabela — busca à esquerda, ações à direita. */
export function TableToolbar({
  left,
  right,
  className,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}

/** Estado vazio dentro de uma tabela. */
export function TableEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyState icon={icon} title={title} description={description} action={action} compact />
  );
}

/** Skeleton de tabela (linhas × colunas). */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <TableContainer aria-hidden>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-3 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <TableCell key={c}>
                  <Skeleton className="h-4 w-full max-w-[10rem]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
