"use client";

import * as React from "react";
import { CalendarClock, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TEXT_LIMIT = 8192;

/** Timezone do navegador (exibição). O envio usa instante absoluto (UTC no backend). */
function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  } catch {
    return "local";
  }
}

/** `Date` → valor para <input type="datetime-local"> (hora LOCAL, sem timezone). */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Resumo humano do agendamento no fuso local. */
function formatScheduleSummary(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Composer da Inbox (Sprint 7.2: envio imediato OU agendado).
 *
 * `onSend(text, sendAt?)` devolve uma Promise: o texto só é limpo quando resolve;
 * em falha, é preservado. Enter envia agora; Shift+Enter quebra linha. O botão de
 * relógio abre o agendamento (data/hora no fuso do navegador → instante absoluto).
 */
export function InboxComposer({
  canSend,
  disabledReason,
  onSend,
}: {
  canSend: boolean;
  disabledReason?: string;
  onSend?: (text: string, sendAt?: string) => Promise<unknown>;
}) {
  const [text, setText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleValue, setScheduleValue] = React.useState("");
  // Mínimo do seletor (agora + 1 min), fixado ao ABRIR (evita Date.now() em render).
  const [minValue, setMinValue] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const enabled = canSend && Boolean(onSend);
  const trimmed = text.trim();
  const overLimit = text.length > TEXT_LIMIT;
  const canSubmit = enabled && !pending && trimmed.length > 0 && !overLimit;

  // datetime-local (YYYY-MM-DDTHH:mm) ordena lexicograficamente = cronologicamente.
  const scheduleValid = scheduleValue.length > 0 && minValue.length > 0 && scheduleValue > minValue;

  function toggleSchedule() {
    setScheduleOpen((open) => {
      if (!open) setMinValue(toLocalInputValue(new Date(Date.now() + 60_000)));
      return !open;
    });
  }

  async function submit(sendAt?: string) {
    if (!canSubmit || !onSend) return;
    setPending(true);
    try {
      await onSend(trimmed, sendAt);
      setText(""); // limpa só no sucesso
      setScheduleOpen(false);
      setScheduleValue("");
      inputRef.current?.focus();
    } catch {
      // preserva o texto em falha; o toast de erro vem de quem passou onSend.
    } finally {
      setPending(false);
    }
  }

  async function confirmSchedule() {
    if (!scheduleValid) return;
    // datetime-local é interpretado como hora LOCAL → instante absoluto (UTC no backend).
    const sendAt = new Date(scheduleValue).toISOString();
    await submit(sendAt);
  }

  if (canSend === false && disabledReason) {
    return (
      <div className="border-t border-line bg-white px-4 py-3">
        <p className="text-center text-caption text-ink-3">{disabledReason}</p>
      </div>
    );
  }

  return (
    <div className="relative border-t border-line bg-white p-3">
      {scheduleOpen ? (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-line bg-white p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-body2 font-semibold text-ink">Agendar mensagem</p>
            <button
              type="button"
              aria-label="Fechar agendamento"
              onClick={() => setScheduleOpen(false)}
              className="text-ink-3 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <input
            type="datetime-local"
            value={scheduleValue}
            min={minValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            aria-label="Data e hora do envio"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-body2 text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
          />
          <p className="mt-1.5 text-caption text-ink-3">Fuso: {browserTimeZone()}</p>
          {scheduleValid ? (
            <p className="mt-1 text-caption text-ink-2">
              Esta mensagem será enviada em <strong>{formatScheduleSummary(scheduleValue)}</strong>.
            </p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              loading={pending}
              disabled={!scheduleValid || !canSubmit}
              onClick={() => void confirmSchedule()}
            >
              Agendar
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          disabled={!enabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={1}
          maxLength={TEXT_LIMIT + 500}
          placeholder={enabled ? "Escreva uma mensagem…" : "Envio indisponível"}
          aria-label="Mensagem"
          className={cn(
            "max-h-32 min-h-10 flex-1 resize-none rounded-lg border bg-white px-3 py-2 text-body2 text-ink shadow-sm placeholder:text-ink-3 focus-visible:outline-none",
            "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15",
            overLimit ? "border-danger" : "border-line",
            !enabled && "cursor-not-allowed bg-surface opacity-70",
          )}
        />
        <Button
          size="icon"
          variant="secondary"
          aria-label="Agendar mensagem"
          disabled={!canSubmit}
          onClick={toggleSchedule}
        >
          <CalendarClock />
        </Button>
        <Button
          size="icon"
          aria-label="Enviar"
          loading={pending && !scheduleOpen}
          disabled={!canSubmit}
          onClick={() => void submit()}
        >
          <Send />
        </Button>
      </div>
      {text.length > TEXT_LIMIT - 500 ? (
        <p
          className={cn(
            "mt-1 text-right text-[10px] tabular-nums",
            overLimit ? "text-danger" : "text-ink-3",
          )}
        >
          {text.length}/{TEXT_LIMIT}
        </p>
      ) : null}
    </div>
  );
}
