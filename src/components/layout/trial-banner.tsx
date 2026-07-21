"use client";

import * as React from "react";
import { useSession } from "@/providers/session-provider";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Faixa de aviso do período de teste. Mostra os dias restantes enquanto a conta
 * está no trial (e sem pagamento ativo). Some quando pago ou fora do trial.
 */
export function TrialBanner() {
  const { user } = useSession();
  // "Agora" fixado uma vez na montagem (evita chamar Date.now em render).
  const [now] = React.useState(() => Date.now());
  if (!user?.trialEndsAt) return null;

  // Conta paga: sem aviso.
  const paidUntilMs = user.paidUntil ? new Date(user.paidUntil).getTime() : 0;
  if (paidUntilMs > now) return null;

  const msLeft = new Date(user.trialEndsAt).getTime() - now;
  if (msLeft <= 0) return null; // expirado — o acesso já é barrado no backend

  const days = Math.ceil(msLeft / DAY_MS);
  const label = days === 1 ? "Último dia do teste grátis" : `Teste grátis — faltam ${days} dias`;
  const urgent = days <= 3;

  return (
    <div
      className={`flex items-center justify-center gap-2 border-b border-line px-4 py-2 text-center text-[13px] ${
        urgent ? "bg-brand/10 text-brand" : "bg-brand/[0.05] text-ink-2"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${urgent ? "bg-brand animate-pulse" : "bg-brand/60"}`}
      />
      <span className="font-medium">{label}</span>
      <span className="text-ink-2" aria-hidden>·</span>
      <span className="text-ink-2">Ative o pagamento para manter o acesso.</span>
    </div>
  );
}
