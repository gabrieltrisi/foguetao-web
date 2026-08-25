import type { ComposerMode } from "./constants";

/**
 * Regras PURAS do Composer definitivo (F3) — sem React, testáveis.
 *
 * Dois modos INEQUÍVOCOS: `reply` (mensagem PÚBLICA, vai ao provider) e `note` (NOTA
 * INTERNA, endpoint dedicado, nunca ao cliente). A disponibilidade de cada modo é
 * calculada separadamente:
 *  - RESPONDER: permissão de envio + sendability (conexão/canal/janela/template);
 *  - NOTA: só a permissão de nota (nota é interna → NÃO sujeita a canal/janela/conexão).
 */

/** Limite de caracteres por modo (contrato do backend: 8192 texto, 8000 nota). */
export const TEXT_LIMIT: Record<ComposerMode, number> = {
  reply: 8192,
  note: 8000,
};

export const BLOCK_REASON = {
  replyPermission: "Você não tem permissão para enviar mensagens.",
  notePermission: "Você não tem permissão para adicionar notas internas.",
  connectionDefault: "Esta conexão não permite envio no momento.",
  requiresTemplate:
    "Fora da janela de 24h — só é possível enviar um template aprovado (ainda não suportado aqui).",
} as const;

export type ComposerBlock = { blocked: false } | { blocked: true; reason: string };

const OK: ComposerBlock = { blocked: false };

/** Bloqueio do modo RESPONDER (público): permissão → conexão → template/janela. */
export function replyBlock(input: {
  canSendPerm: boolean;
  canSend: boolean;
  connectionMessage: string;
  requiresTemplate: boolean;
}): ComposerBlock {
  if (!input.canSendPerm) return { blocked: true, reason: BLOCK_REASON.replyPermission };
  if (!input.canSend)
    return { blocked: true, reason: input.connectionMessage || BLOCK_REASON.connectionDefault };
  if (input.requiresTemplate) return { blocked: true, reason: BLOCK_REASON.requiresTemplate };
  return OK;
}

/** Bloqueio do modo NOTA: só a permissão de nota (interna → sem sendability). */
export function noteBlock(input: { canNotePerm: boolean }): ComposerBlock {
  if (!input.canNotePerm) return { blocked: true, reason: BLOCK_REASON.notePermission };
  return OK;
}

export interface ModeInput {
  canSendPerm: boolean;
  canNotePerm: boolean;
  canSend: boolean;
  connectionMessage: string;
  requiresTemplate: boolean;
}

/** Bloqueio do modo ATIVO. */
export function modeBlock(mode: ComposerMode, input: ModeInput): ComposerBlock {
  return mode === "note"
    ? noteBlock({ canNotePerm: input.canNotePerm })
    : replyBlock({
        canSendPerm: input.canSendPerm,
        canSend: input.canSend,
        connectionMessage: input.connectionMessage,
        requiresTemplate: input.requiresTemplate,
      });
}

/** Pode submeter AGORA? (modo disponível + texto não-vazio + dentro do limite). */
export function canSubmit(input: {
  mode: ComposerMode;
  text: string;
  block: ComposerBlock;
  pending: boolean;
}): boolean {
  if (input.block.blocked || input.pending) return false;
  const trimmed = input.text.trim();
  return trimmed.length > 0 && input.text.length <= TEXT_LIMIT[input.mode];
}
