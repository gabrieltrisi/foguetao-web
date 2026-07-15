import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/**
 * Aviso para telas cujo backend ainda NÃO existe (Sprint 1.0D-3).
 *
 * A auditoria confirmou que não há modelo nem rota para branding (cores/tema/
 * favicon), domínios, billing ou limites/consumo — só o campo `logoUrl` na
 * empresa. Em vez de simular persistência com um toast "(mock)", a tela diz o
 * que é: uma prévia. Nenhuma chamada inexistente é feita.
 */
export function PreviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <Card className="flex items-start gap-3 border-warning/30 bg-warning/5 p-4">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
        <Construction className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
          Disponível em breve
          <Badge tone="warning">Prévia</Badge>
        </p>
        <p className="mt-0.5 text-body2 text-ink-2">{children}</p>
      </div>
    </Card>
  );
}
