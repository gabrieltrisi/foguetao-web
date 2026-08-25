"use client";

import { PanelSection } from "./panel-section";

/**
 * Card ARQUIVOS (F6). LACUNA de contrato: o backend **não tem** domínio de arquivos de
 * CRM (nenhum endpoint/DTO/permissão). Estado vazio honesto — não inventar. Os únicos
 * arquivos são mídia de mensagem (messaging), fora do escopo do painel de contato.
 */
export function FilesCard() {
  return (
    <PanelSection title="Arquivos" isEmpty emptyLabel="Sem arquivos no CRM para este contato." />
  );
}
