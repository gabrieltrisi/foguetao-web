"use client";

import { Monitor, Smartphone, MapPin, Loader2, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useSessions, useRevokeSession } from "@/hooks/auth/use-sessions";
import { useLogout } from "@/hooks/auth/use-logout";
import type { ApiSession } from "@/types/api/auth";

function deviceFromUserAgent(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: "Dispositivo desconhecido", mobile: false };
  const mobile = /mobile|iphone|android|ipad/i.test(ua);
  let label = "Navegador";
  if (/chrome/i.test(ua)) label = "Chrome";
  else if (/firefox/i.test(ua)) label = "Firefox";
  else if (/safari/i.test(ua)) label = "Safari";
  else if (/edg/i.test(ua)) label = "Edge";
  if (/windows/i.test(ua)) label += " · Windows";
  else if (/mac os/i.test(ua)) label += " · macOS";
  else if (/android/i.test(ua)) label += " · Android";
  else if (/iphone|ios/i.test(ua)) label += " · iOS";
  else if (/linux/i.test(ua)) label += " · Linux";
  return { label, mobile };
}

function SessionRow({ session }: { session: ApiSession }) {
  const { toast } = useToast();
  const revoke = useRevokeSession();
  const device = deviceFromUserAgent(session.userAgent);
  const Icon = device.mobile ? Smartphone : Monitor;

  return (
    <Card className="flex items-start justify-between gap-3 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-ink">
            <span className="truncate">{device.label}</span>
            {session.current ? <Badge tone="success">Esta sessão</Badge> : null}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-ink-3">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden /> {session.ipAddress ?? "IP desconhecido"}
            </span>
            <span>· expira {new Date(session.expiresAt).toLocaleDateString("pt-BR")}</span>
          </p>
        </div>
      </div>
      {!session.current ? (
        <Button
          size="sm"
          variant="secondary"
          loading={revoke.isPending}
          onClick={() =>
            revoke.mutate(session.id, {
              onSuccess: () => toast({ title: "Sessão revogada", variant: "success" }),
              onError: () => toast({ title: "Falha ao revogar sessão", variant: "error" }),
            })
          }
        >
          Revogar
        </Button>
      ) : null}
    </Card>
  );
}

export function SessionsLive() {
  const { data, isLoading, isError } = useSessions();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-body2 text-ink-2">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando sessões…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex items-center gap-2 p-4 text-body2 text-danger">
        <TriangleAlert className="size-4" aria-hidden /> Não foi possível carregar as sessões.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body2 text-ink-2">{data.length} sessão(ões) ativa(s)</p>
        <Button
          size="sm"
          variant="secondary"
          loading={logout.isPending}
          onClick={() => logout.mutate(true)}
        >
          Encerrar todas as sessões
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}
