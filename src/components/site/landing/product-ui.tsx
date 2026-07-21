import * as React from "react";
import Image from "next/image";
import {
  LayoutGrid,
  Users,
  Building2,
  SquareKanban,
  Target,
  ListTodo,
  Megaphone,
  TrendingUp,
  Phone,
  Mail,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CrmBoardColumn,
  CrmContact,
  CrmDashboard,
  CrmDeal,
  CrmTask,
  Tone,
} from "@/config/landing/segments";

/* -------------------------------------------------------------------------- */
/*  Composições fiéis do produto (tema claro real do CRM) para a landing.      */
/*  Reproduzem 1:1 a linguagem visual do app — Card branco, borda `line`,      */
/*  valores em Sora, badges por tom, vermelho da marca — sem importar          */
/*  componentes com hooks/dados. Os DADOS chegam por props (por segmento).     */
/* -------------------------------------------------------------------------- */

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function AvatarDot({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-[#17171a] text-[11px] font-semibold text-white",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: "bg-[#e6e6e8]/70 text-[#66666d]",
    brand: "bg-[#fdecec] text-[#8a0509]",
    success: "bg-[#16a34a]/10 text-[#16a34a]",
    warning: "bg-[#d97706]/10 text-[#d97706]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

const NAV = [
  { icon: LayoutGrid, label: "Visão geral" },
  { icon: Users, label: "Contatos" },
  { icon: Building2, label: "Organizações" },
  { icon: SquareKanban, label: "Pipeline" },
  { icon: Target, label: "Negócios" },
  { icon: ListTodo, label: "Tarefas" },
  { icon: Megaphone, label: "Campanhas" },
];

/**
 * AppFrame — moldura do app (sidebar + topbar + corpo), tema claro. `active`
 * acende o item de navegação correspondente à tela mostrada.
 */
export function AppFrame({
  active,
  title,
  children,
  className,
}: {
  active: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full overflow-hidden rounded-xl border border-black/10 bg-[#ffffff] text-left text-[#17171a] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)]",
        className,
      )}
    >
      {/* Sidebar */}
      <aside className="hidden w-[176px] shrink-0 flex-col border-r border-[#e6e6e8] bg-[#f7f7f8] py-3 sm:flex">
        <div className="px-4 pb-3">
          {/* Logo oficial do Foguetão — mesmo asset da sidebar do app (colorido,
              tema claro), servido otimizado pelo next/image. */}
          <Image
            src="/brand/logo-sidebar-balanced.png"
            alt="Foguetão"
            width={228}
            height={72}
            sizes="110px"
            className="h-5 w-auto"
          />
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = item.label === active;
            return (
              <span
                key={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium",
                  on ? "bg-[#fdecec] text-[#8a0509]" : "text-[#66666d]",
                )}
              >
                <Icon className={cn("size-4", on ? "text-brand" : "text-[#929298]")} aria-hidden />
                {item.label}
              </span>
            );
          })}
        </nav>
      </aside>

      {/* Painel */}
      <div className="min-w-0 flex-1">
        <div className="flex h-11 items-center justify-between border-b border-[#e6e6e8] px-4">
          <span className="font-display text-sm font-semibold">{title}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#e6e6e8]" />
            <span className="size-2 rounded-full bg-[#e6e6e8]" />
            <span className="size-2 rounded-full bg-brand/70" />
          </span>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="rounded-lg border border-[#e6e6e8] bg-[#ffffff] p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666d]">{label}</p>
      <p className="mt-1.5 font-display text-xl font-bold leading-none">{value}</p>
      {delta ? (
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#16a34a]">
          <TrendingUp className="size-3" aria-hidden /> {delta}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------- Telas ----------------------------------- */

export function ProductDashboard({ data, className }: { data: CrmDashboard; className?: string }) {
  return (
    <AppFrame active="Visão geral" title="Visão geral" className={className}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Receita no funil" value="R$ 486.200" delta="+18%" />
        <MetricCard label="Negócios abertos" value="72" delta="+9%" />
        <MetricCard label="Taxa de conversão" value="31%" delta="+4%" />
        <MetricCard label="Ganhos no mês" value="24" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-[#e6e6e8] bg-[#ffffff] p-4 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#66666d]">Funil de vendas</p>
          <div className="mt-3 flex flex-col gap-2">
            {data.funnel.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[11.5px] text-[#66666d]">{s.label}</span>
                <span className="h-6 flex-1 overflow-hidden rounded bg-[#f7f7f8]">
                  <span className="flex h-full items-center rounded bg-gradient-to-r from-brand to-brand-dark px-2 text-[10px] font-semibold text-white" style={{ width: `${s.pct}%` }}>
                    {s.count}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#e6e6e8] bg-[#ffffff] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#66666d]">Tarefas de hoje</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {data.tasks.map((t, i) => (
              <li key={t} className="flex items-center gap-2.5 text-[12px]">
                <span className={cn("flex size-4 items-center justify-center rounded border", i === 0 ? "border-brand bg-brand text-white" : "border-[#d4d4d8]")}>
                  {i === 0 ? <Check className="size-3" aria-hidden /> : null}
                </span>
                <span className={cn(i === 0 && "text-[#929298] line-through")}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppFrame>
  );
}

export function ProductPipeline({ board, className }: { board: CrmBoardColumn[]; className?: string }) {
  return (
    <AppFrame active="Pipeline" title="Pipeline" className={className}>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {board.map((col) => (
          <div key={col.stage} className="rounded-lg bg-[#f7f7f8] p-2">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-[11px] font-semibold text-[#66666d]">{col.stage}</span>
              <span className="text-[10px] text-[#929298]">{col.deals.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.deals.map((d) => (
                <div key={d.name} className="rounded-md border border-[#e6e6e8] bg-[#ffffff] p-2.5">
                  <p className="text-[12px] font-semibold">{d.name}</p>
                  <p className="mt-1 font-display text-[13px] font-bold text-brand">{d.value}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <AvatarDot name={d.name} className="size-5 text-[9px]" />
                    <Tag tone="brand">Quente</Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}

export function ProductContact({ contact, className }: { contact: CrmContact; className?: string }) {
  return (
    <AppFrame active="Contatos" title="Contato" className={className}>
      <div className="flex items-start gap-3">
        <AvatarDot name={contact.name} className="size-12 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold">{contact.name}</p>
          <p className="text-[12.5px] text-[#66666d]">{contact.role}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <Tag key={tag.label} tone={tag.tone}>
                {tag.label}
              </Tag>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-[#e6e6e8] bg-[#ffffff] px-3 py-2.5 text-[12px]">
          <Phone className="size-3.5 text-[#929298]" aria-hidden /> {contact.phone}
        </div>
        <div className="flex items-center gap-2 truncate rounded-lg border border-[#e6e6e8] bg-[#ffffff] px-3 py-2.5 text-[12px]">
          <Mail className="size-3.5 shrink-0 text-[#929298]" aria-hidden /> <span className="truncate">{contact.email}</span>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-[#e6e6e8] bg-[#ffffff] p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#66666d]">Atividades recentes</p>
        <ul className="mt-2.5 flex flex-col gap-2.5">
          {contact.activities.map((a) => (
            <li key={a.t} className="flex items-center gap-2.5 text-[12px]">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              <span className="flex-1">{a.t}</span>
              <span className="text-[11px] text-[#929298]">{a.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </AppFrame>
  );
}

export function ProductDeal({ deal, className }: { deal: CrmDeal; className?: string }) {
  return (
    <AppFrame active="Negócios" title="Negócio" className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold">{deal.title}</p>
          <p className="text-[12.5px] text-[#66666d]">{deal.person}</p>
        </div>
        <Tag tone={deal.status.tone}>{deal.status.label}</Tag>
      </div>
      <div className="mt-4 flex items-end gap-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666d]">Valor</p>
          <p className="font-display text-2xl font-bold text-brand">{deal.value}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666d]">Probabilidade</p>
          <p className="font-display text-2xl font-bold">{deal.probability}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-[#66666d]">
          {deal.stages.map((s, i) => (
            <span key={s} className={cn(i <= 2 && "font-semibold text-brand")}>{s}</span>
          ))}
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f7f7f8]">
          <span className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${deal.progressPct}%` }} />
        </div>
      </div>
    </AppFrame>
  );
}

export function ProductTask({ tasks, className }: { tasks: CrmTask[]; className?: string }) {
  return (
    <AppFrame active="Tarefas" title="Tarefas" className={className}>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.t} className="flex items-center gap-3 rounded-lg border border-[#e6e6e8] bg-[#ffffff] px-3.5 py-3">
            <span className={cn("flex size-5 items-center justify-center rounded-md border", task.done ? "border-[#16a34a] bg-[#16a34a] text-white" : "border-[#d4d4d8]")}>
              {task.done ? <Check className="size-3.5" aria-hidden /> : null}
            </span>
            <span className={cn("flex-1 text-[13px]", task.done && "text-[#929298] line-through")}>{task.t}</span>
            <Tag tone={task.tone}>{task.tag}</Tag>
          </li>
        ))}
      </ul>
    </AppFrame>
  );
}
