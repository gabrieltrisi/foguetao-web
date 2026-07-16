import { FlaskConical } from "lucide-react";

/**
 * Aviso de tela em PREVIEW: a funcionalidade não existe no backend (não há
 * model, endpoint nem permissão), então os dados abaixo são de demonstração e
 * nada é persistido. Usado por Inbox, Etiquetas, Filas e Templates — cada um
 * depende de um domínio que ainda será criado.
 */
export function PreviewBanner({ feature }: { feature: string }) {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-caption text-ink-2"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <span>
        <strong className="font-semibold text-ink">Preview — disponível em breve.</strong>{" "}
        {feature} ainda não existe no backend, então esta tela mostra dados de demonstração e{" "}
        <strong className="font-semibold">nada é salvo</strong>. Conversas, chat e contas de
        mensageria já usam dados reais.
      </span>
    </p>
  );
}
