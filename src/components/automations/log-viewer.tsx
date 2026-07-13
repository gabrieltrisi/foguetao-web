import { cn } from "@/lib/utils";
import type { ExecutionLog } from "@/types/automations";

const levelStyle: Record<ExecutionLog["level"], string> = {
  info: "text-sky-400",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-red-400",
};

/** Visualizador de logs estilo terminal. */
export function LogViewer({ logs, className }: { logs: ExecutionLog[]; className?: string }) {
  return (
    <div
      className={cn("overflow-x-auto rounded-lg border border-ink/40 bg-ink p-4 font-mono text-caption leading-relaxed", className)}
      role="log"
      aria-label="Logs da execução"
    >
      {logs.map((l, i) => (
        <div key={i} className="flex gap-3 whitespace-pre">
          <span className="shrink-0 text-white/40">{l.time}</span>
          <span className={cn("w-16 shrink-0 font-semibold uppercase", levelStyle[l.level])}>{l.level}</span>
          <span className="text-white/85">{l.message}</span>
        </div>
      ))}
    </div>
  );
}
