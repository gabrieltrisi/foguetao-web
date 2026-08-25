import type { Execution, ExecutionStatus, ExecutionStep, ExecutionLog } from "@/types/automations";
import { automations } from "@/mocks/automations/automations";

const STATUSES: ExecutionStatus[] = ["success", "success", "failed", "running", "retrying", "success"];

function stepsFor(automationIndex: number, failed: boolean): ExecutionStep[] {
  const auto = automations[automationIndex % automations.length];
  return auto.nodes.map((node, i) => {
    const isLastBeforeEnd = i === auto.nodes.length - 2;
    return {
      id: `step-${node.id}`,
      nodeLabel: node.label,
      status: failed && isLastBeforeEnd ? "failed" : "success",
      time: `10:0${i}`,
      detail: node.subtitle,
    };
  });
}

function logsFor(failed: boolean): ExecutionLog[] {
  const base: ExecutionLog[] = [
    { time: "10:00:01", level: "info", message: "Execução iniciada · trigger=lead.created" },
    { time: "10:00:01", level: "info", message: "Carregando contexto do lead #4821" },
    { time: "10:00:02", level: "success", message: "Nó 'Esperar' agendado para +15min" },
    { time: "10:15:03", level: "info", message: "Retomando execução após espera" },
    { time: "10:15:04", level: "success", message: "WhatsApp enviado (template=Boas-vindas)" },
  ];
  if (failed) {
    base.push({ time: "10:15:05", level: "error", message: "Falha ao criar tarefa: timeout (504)" });
    base.push({ time: "10:15:05", level: "warn", message: "Agendando retry (tentativa 2/3) em 30s" });
  } else {
    base.push({ time: "10:15:05", level: "success", message: "Tarefa criada · id=task-9931" });
    base.push({ time: "10:15:06", level: "success", message: "Execução concluída com sucesso" });
  }
  return base;
}

export const executions: Execution[] = Array.from({ length: 14 }).map((_, i) => {
  const auto = automations[i % automations.length];
  const status = STATUSES[i % STATUSES.length];
  const failed = status === "failed" || status === "retrying";
  return {
    id: `exec-${i + 1}`,
    automationId: auto.id,
    automationName: auto.name,
    status,
    startedAt: `13 jul 2026 · 10:0${i % 6}`,
    finishedAt: status === "running" ? "—" : `13 jul 2026 · 10:1${i % 6}`,
    duration: status === "running" ? "—" : `${2 + (i % 5)}m ${10 + i}s`,
    trigger: auto.triggerLabel,
    attempt: status === "retrying" ? 2 : 1,
    steps: stepsFor(i, failed),
    logs: logsFor(failed),
  };
});

export const executionStatusLabel: Record<ExecutionStatus, string> = {
  success: "Sucesso",
  failed: "Falha",
  running: "Em execução",
  retrying: "Retentando",
};

export const executionStatusTone: Record<ExecutionStatus, "success" | "danger" | "info" | "warning"> = {
  success: "success",
  failed: "danger",
  running: "info",
  retrying: "warning",
};

export function getExecutionById(id: string): Execution | undefined {
  return executions.find((e) => e.id === id);
}

export function executionsForAutomation(automationId: string): Execution[] {
  return executions.filter((e) => e.automationId === automationId);
}
