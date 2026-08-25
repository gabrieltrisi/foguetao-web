import { FlaskConical } from "lucide-react";

/**
 * Aviso de tela em PREVIEW: a funcionalidade NÃO existe no backend (não há
 * model, endpoint nem contrato), então os dados exibidos são de demonstração e
 * nada é persistido.
 *
 * Usado por Comunicação (Inbox, Etiquetas, Filas, Templates) e por todo o
 * módulo Marketing. Existe para que a tela diga a verdade em vez de aparentar
 * um backend que não existe — quando o domínio for criado, o aviso sai junto
 * com o mock.
 */
export function PreviewBanner({
  feature,
  /** Frase extra opcional (ex.: apontar o que já é real no mesmo módulo). */
  note,
}: {
  feature: string;
  note?: string;
}) {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-caption text-ink-2"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <span>
        <strong className="font-semibold text-ink">Preview — disponível em breve.</strong>{" "}
        {feature} ainda não existe no backend, então esta tela mostra dados de demonstração e{" "}
        <strong className="font-semibold">nada é salvo</strong>.{note ? ` ${note}` : ""}
      </span>
    </p>
  );
}
