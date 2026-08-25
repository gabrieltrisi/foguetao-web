"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutGrid, SquareKanban, Users, Target, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section";
import {
  ProductDashboard,
  ProductPipeline,
  ProductContact,
  ProductDeal,
  ProductTask,
} from "./product-ui";
import { SegmentBadge } from "./segment-badge";
import type { CrmExamples } from "@/config/landing/segments";

const TABS = [
  { key: "dashboard", icon: LayoutGrid, label: "Visão geral", desc: "Receita no funil, conversão e tarefas do dia num relance." },
  { key: "pipeline", icon: SquareKanban, label: "Pipeline", desc: "Arraste negócios entre etapas e veja o funil se mover." },
  { key: "contact", icon: Users, label: "Contatos", desc: "Todo o histórico do cliente reunido em um só lugar." },
  { key: "deal", icon: Target, label: "Negócios", desc: "Valor, probabilidade e etapa de cada oportunidade." },
  { key: "task", icon: ListTodo, label: "Tarefas", desc: "O que fazer hoje para não perder nenhuma venda." },
] as const;

export function LandingShowcase({ crm }: { crm: CrmExamples }) {
  const [active, setActive] = React.useState(0);
  const reduced = useReducedMotion();
  const key = TABS[active].key;

  const screen =
    key === "dashboard" ? <ProductDashboard data={crm.dashboard} /> :
    key === "pipeline" ? <ProductPipeline board={crm.board} /> :
    key === "contact" ? <ProductContact contact={crm.contact} /> :
    key === "deal" ? <ProductDeal deal={crm.deal} /> :
    <ProductTask tasks={crm.tasks} />;

  return (
    <section id="produto" className="relative mx-auto w-full max-w-[1200px] scroll-mt-20 px-6 py-24 sm:px-8 sm:py-32">
      <SectionHeader
        eyebrow="O produto"
        title={<>Veja o Foguetão em ação.</>}
        subtitle="Do primeiro contato ao negócio fechado — telas feitas para o dia a dia comercial, não para relatórios."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-10">
        {/* Abas */}
        <div
          role="tablist"
          aria-label="Telas do produto"
          className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible"
        >
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const on = i === active;
            return (
              <button
                key={tab.label}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex shrink-0 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:shrink",
                  on
                    ? "border-brand/40 bg-brand/[0.06]"
                    : "border-white/[0.07] bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.03]",
                )}
              >
                <Icon className={cn("mt-0.5 size-4 shrink-0", on ? "text-brand" : "text-white/45")} aria-hidden />
                <span className="min-w-0">
                  <span className={cn("block text-[14px] font-semibold", on ? "text-white" : "text-white/75")}>{tab.label}</span>
                  <span className="mt-0.5 hidden text-[12.5px] leading-snug text-white/60 lg:block">{tab.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tela */}
        <div className="relative">
          <div aria-hidden className="absolute -inset-6 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(224,7,15,0.14),transparent_70%)] blur-2xl" />
          <div className="relative">
            {crm.badge ? (
              <div className="mb-3 flex justify-end">
                <SegmentBadge label={crm.badge} />
              </div>
            ) : null}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${key}-${crm.badge}`}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                role="tabpanel"
              >
                {screen}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
