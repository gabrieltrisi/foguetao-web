import { CircleCheck, CircleMinus, CircleX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutionStep, ExecutionStepStatus } from "@/types/automations";

const stepConfig: Record<ExecutionStepStatus, { icon: typeof CircleCheck; color: string; ring: string }> = {
  success: { icon: CircleCheck, color: "text-success", ring: "border-success/30 bg-success/10" },
  failed: { icon: CircleX, color: "text-danger", ring: "border-danger/30 bg-danger/10" },
  skipped: { icon: CircleMinus, color: "text-ink-3", ring: "border-line bg-surface" },
  running: { icon: Loader2, color: "text-info", ring: "border-info/30 bg-info/10" },
};

/** Timeline dos nós executados numa execução. */
export function ExecutionTimeline({ steps }: { steps: ExecutionStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const cfg = stepConfig[step.status] ?? stepConfig.success;
        const Icon = cfg.icon;
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast ? <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-line" aria-hidden /> : null}
            <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border", cfg.ring)}>
              <Icon className={cn("size-4", cfg.color, step.status === "running" && "animate-spin")} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-body2 font-medium text-ink">{step.nodeLabel}</p>
                <span className="shrink-0 text-caption text-ink-3">{step.time}</span>
              </div>
              {step.detail ? <p className="truncate text-caption text-ink-3">{step.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
