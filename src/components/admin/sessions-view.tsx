"use client";

import { Button } from "@/components/ui/button";
import { SessionCard } from "@/components/admin/session-card";
import { useToast } from "@/components/ui/toast";
import { sessions } from "@/mocks/admin/security";

export function SessionsView() {
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body2 text-ink-2">{sessions.length} sessões ativas</p>
        <Button size="sm" variant="secondary" onClick={() => toast({ title: "Outras sessões encerradas (mock)", variant: "success" })}>
          Encerrar outras sessões
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
      </div>
    </div>
  );
}
