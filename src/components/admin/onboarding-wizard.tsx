"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";
import { StatList } from "@/components/business/kpi-block";
import { AdminIcon } from "@/components/admin/admin-icon";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  onboardingSteps,
  onboardingSegments,
  onboardingObjectives,
  onboardingChannels,
  onboardingTemplates,
} from "@/mocks/admin/onboarding";
import type { OnboardingOption } from "@/types/admin";

function StepCard({
  option,
  selected,
  onSelect,
}: {
  option: OnboardingOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        selected ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink-2 hover:border-ink-3 hover:text-ink",
      )}
    >
      <AdminIcon name={option.icon} className="size-6" />
      <span className="text-body2 font-medium">{option.label}</span>
    </button>
  );
}

const labelOf = (opts: OnboardingOption[], v: string) => opts.find((o) => o.value === v)?.label ?? "—";

export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [segment, setSegment] = React.useState("");
  const [objective, setObjective] = React.useState("");
  const [channels, setChannels] = React.useState<string[]>([]);
  const [template, setTemplate] = React.useState("");

  const toggleChannel = (v: string) =>
    setChannels((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));

  const canNext =
    (step === 0 && !!segment) ||
    (step === 1 && !!objective) ||
    (step === 2 && channels.length > 0) ||
    (step === 3 && !!template) ||
    step === 4;

  const finish = () => {
    toast({ title: "Configuração concluída (mock)", variant: "success" });
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Stepper steps={onboardingSteps} current={step} />

      <Card className="flex min-h-[320px] flex-col gap-5 p-6">
        {step === 0 && (
          <>
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">Qual seu segmento?</h2>
              <p className="text-body2 text-ink-2">Personalizamos o Foguetão para o seu tipo de negócio.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {onboardingSegments.map((o) => (
                <StepCard key={o.value} option={o} selected={segment === o.value} onSelect={() => setSegment(o.value)} />
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">Qual seu principal objetivo?</h2>
              <p className="text-body2 text-ink-2">Assim priorizamos as ferramentas certas.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {onboardingObjectives.map((o) => (
                <StepCard key={o.value} option={o} selected={objective === o.value} onSelect={() => setObjective(o.value)} />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">Principais canais</h2>
              <p className="text-body2 text-ink-2">Selecione todos que você usa (múltipla escolha).</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {onboardingChannels.map((o) => (
                <StepCard key={o.value} option={o} selected={channels.includes(o.value)} onSelect={() => toggleChannel(o.value)} />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">Escolha um template</h2>
              <p className="text-body2 text-ink-2">Começamos com uma estrutura pronta que você pode ajustar depois.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {onboardingTemplates.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTemplate(t.value)}
                  aria-pressed={template === t.value}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    template === t.value ? "border-brand bg-brand-soft" : "border-line bg-white hover:border-ink-3",
                  )}
                >
                  <span className="flex items-center gap-2 font-medium text-ink">
                    {template === t.value ? <Check className="size-4 text-brand" aria-hidden /> : <Rocket className="size-4 text-ink-3" aria-hidden />}
                    {t.label}
                  </span>
                  <span className="text-caption text-ink-2">{t.description}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">Tudo pronto! 🚀</h2>
              <p className="text-body2 text-ink-2">Revise suas escolhas antes de concluir.</p>
            </div>
            <StatList
              items={[
                { label: "Segmento", value: labelOf(onboardingSegments, segment) },
                { label: "Objetivo", value: labelOf(onboardingObjectives, objective) },
                { label: "Canais", value: channels.length ? channels.map((c) => labelOf(onboardingChannels, c)).join(", ") : "—" },
                { label: "Template", value: onboardingTemplates.find((t) => t.value === template)?.label ?? "—" },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => <Badge key={c} tone="brand">{labelOf(onboardingChannels, c)}</Badge>)}
            </div>
          </>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="size-4" aria-hidden /> Voltar
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))} disabled={!canNext}>
              Próximo <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={finish}>
              <Check className="size-4" aria-hidden /> Concluir
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
