"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, Mail, MessageCircle, Phone, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { labelColorClasses } from "@/components/messaging/label-chip";
import { conversations } from "@/mocks/messaging/conversations";
import { labels } from "@/mocks/messaging/labels";
import type { Channel, ConversationStatus } from "@/types/messaging";

const channelIcon: Record<Channel, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  email: Mail,
  instagram: Share2,
  phone: Phone,
  sms: MessageCircle,
  webchat: Globe,
};

const STATUS_TABS = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Abertas" },
  { value: "pending", label: "Pendentes" },
  { value: "closed", label: "Fechadas" },
];

export function ConversationList({ selectedId }: { selectedId?: string }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const filtered = conversations.filter((c) => {
    const matchStatus = status === "all" || c.status === (status as ConversationStatus);
    const q = query.trim().toLowerCase();
    return matchStatus && (!q || `${c.name} ${c.preview}`.toLowerCase().includes(q));
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-line p-3">
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar conversas…" />
        <SegmentedControl size="sm" options={STATUS_TABS} value={status} onValueChange={setStatus} className="w-full" ariaLabel="Filtrar por status" />
      </div>
      <ul className="no-scrollbar flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const Icon = channelIcon[c.channel];
          const active = c.id === selectedId;
          const convLabels = c.labelIds.map((id) => labels.find((l) => l.id === id)).filter(Boolean);
          return (
            <li key={c.id}>
              <Link
                href={`/conversations/${c.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex gap-3 border-b border-line px-3 py-3 transition-colors",
                  active ? "bg-brand-soft/50" : "hover:bg-surface",
                )}
              >
                <div className="relative shrink-0">
                  <EntityAvatar name={c.name} size="md" />
                  {c.online ? (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-success" aria-hidden />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("flex items-center gap-1.5 truncate", c.unread > 0 ? "font-semibold text-ink" : "font-medium text-ink")}>
                      <Icon className="size-3.5 shrink-0 text-ink-3" aria-hidden />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className={cn("shrink-0 text-caption", c.unread > 0 ? "font-semibold text-brand" : "text-ink-3")}>
                      {c.time}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={cn("truncate text-body2", c.unread > 0 ? "text-ink-2" : "text-ink-3")}>{c.preview}</p>
                    {c.unread > 0 ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-micro font-bold text-white">
                        {c.unread}
                      </span>
                    ) : null}
                  </div>
                  {convLabels.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {convLabels.map((l) =>
                        l ? (
                          <span key={l.id} className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-micro font-medium", labelColorClasses[l.color].chip)}>
                            <span className={cn("size-1 rounded-full", labelColorClasses[l.color].dot)} aria-hidden />
                            {l.name}
                          </span>
                        ) : null,
                      )}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="p-6 text-center text-body2 text-ink-3">Nenhuma conversa encontrada.</li>
        ) : null}
      </ul>
    </div>
  );
}
