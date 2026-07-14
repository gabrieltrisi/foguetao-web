"use client";

import { Monitor, Smartphone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { Session } from "@/types/admin";

/** Card de sessão/dispositivo ativo. */
export function SessionCard({ session }: { session: Session }) {
  const { toast } = useToast();
  const isMobile = /iphone|android|ios/i.test(session.device + session.os);
  const Icon = isMobile ? Smartphone : Monitor;
  return (
    <Card className="flex items-start justify-between gap-3 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-ink">
            <span className="truncate">{session.device}</span>
            {session.current ? <Badge tone="success">Este dispositivo</Badge> : null}
          </p>
          <p className="text-caption text-ink-2">{session.browser} · {session.os}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-ink-3">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3" aria-hidden /> {session.location}</span>
            <span className="font-mono">{session.ip}</span>
            <span>· {session.lastActive}</span>
          </p>
        </div>
      </div>
      {!session.current ? (
        <Button size="sm" variant="secondary" onClick={() => toast({ title: "Sessão encerrada (mock)", variant: "success" })}>
          Encerrar
        </Button>
      ) : null}
    </Card>
  );
}
