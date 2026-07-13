"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebhookCard } from "@/components/automations/webhook-card";
import { useToast } from "@/components/ui/toast";
import { webhooks } from "@/mocks/automations/webhooks";

export function WebhooksView() {
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast({ title: "Novo webhook criado (mock)", variant: "success" })}>
          <Plus />
          Novo webhook
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {webhooks.map((w) => <WebhookCard key={w.id} webhook={w} />)}
      </div>
    </div>
  );
}
