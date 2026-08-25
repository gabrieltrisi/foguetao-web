"use client";

import * as React from "react";
import { MonitorSmartphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { SessionCard } from "@/components/admin/session-card";
import { useSessions } from "@/hooks/auth/use-sessions";
import { useLogout } from "@/hooks/auth/use-logout";
import { messageForSessionError, sortSessions } from "@/lib/auth/session-display";
import { isApiError } from "@/types/api/error";

/**
 * Sessões ativas reais do usuário. Compartilhada por /sessions e /security.
 *
 * Só existem três ações no contrato: listar, encerrar UMA sessão e logout
 * global (`/auth/logout-all`, que derruba tudo — inclusive a atual). Não há
 * endpoint de "encerrar as outras", então isso não é oferecido.
 */
export function SessionsList({ columns = 2 }: { columns?: 1 | 2 }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useSessions();
  const logout = useLogout();
  const [confirmAll, setConfirmAll] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <div className={columns === 2 ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-3"}>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    // 401 aqui significa sessão morta: o próprio provider já redireciona para
    // o login, então não insistimos com "tentar novamente".
    const unauthorized = isApiError(error) && error.statusCode === 401;
    return (
      <ErrorState
        variant="card"
        title="Não foi possível carregar as sessões."
        message={isApiError(error) ? messageForSessionError(error) : undefined}
        onRetry={unauthorized ? undefined : () => refetch()}
      />
    );
  }

  const sessions = sortSessions(data);

  if (sessions.length === 0) {
    // Na prática não acontece: quem lê esta tela tem, no mínimo, a própria
    // sessão. Ainda assim, o estado existe em vez de renderizar o vazio.
    return (
      <EmptyState
        icon={MonitorSmartphone}
        title="Nenhuma sessão ativa."
        description="Entre novamente para iniciar uma sessão."
        compact
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body2 text-ink-2">
          <span className="font-medium text-ink">{sessions.length}</span> sessão(ões) ativa(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            loading={isFetching}
            aria-label="Atualizar lista de sessões"
          >
            <RefreshCw className="size-4" aria-hidden />
            Atualizar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setConfirmAll(true)}>
            Sair de todos os dispositivos
          </Button>
        </div>
      </div>

      <div className={columns === 2 ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-3"}>
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>

      <ConfirmDialog
        open={confirmAll}
        onOpenChange={setConfirmAll}
        title="Sair de todos os dispositivos?"
        description="Todas as sessões serão encerradas, inclusive esta — você precisará entrar novamente."
        confirmLabel="Sair de todos"
        destructive
        onConfirm={() => {
          setConfirmAll(false);
          // `logout-all` revoga TUDO no backend e limpa os cookies; o hook
          // limpa o cache e leva ao /login.
          logout.mutate(true);
        }}
      />
    </div>
  );
}
