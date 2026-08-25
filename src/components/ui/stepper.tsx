import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { label: string; description?: string };

/** Indicador de etapas (wizard). `current` é o índice da etapa ativa. */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: Step[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, i) => {
        const status = i < current ? "done" : i === current ? "active" : "upcoming";
        const isLast = i === steps.length - 1;
        return (
          <li key={step.label} className={cn("flex flex-1 items-start", isLast && "flex-none")}>
            <div className="flex flex-col items-center text-center">
              <span
                aria-current={status === "active" ? "step" : undefined}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-body2 font-semibold transition-colors",
                  status === "done" && "border-brand bg-brand text-white",
                  status === "active" && "border-brand bg-brand-soft text-brand",
                  status === "upcoming" && "border-line bg-white text-ink-3",
                )}
              >
                {status === "done" ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "mt-1.5 max-w-[8rem] text-caption font-medium",
                  status === "upcoming" ? "text-ink-3" : "text-ink",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "mx-2 mt-4 h-0.5 flex-1 rounded-full",
                  i < current ? "bg-brand" : "bg-line",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
