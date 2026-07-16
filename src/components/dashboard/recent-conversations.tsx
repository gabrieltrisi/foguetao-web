import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { recentConversations } from "@/mocks/messaging/recent-conversations";

/**
 * Widget do módulo MESSAGING exibido no Dashboard — ainda MOCKADO, porque
 * Messaging não tem contrato integrado. Está desacoplado de propósito: não
 * recebe nem mistura nenhum dado do CRM. Será substituído integralmente na
 * Sprint 1.3. Ver `@/mocks/messaging/recent-conversations`.
 */
export function RecentConversations() {
  return (
    <Card className="flex flex-col p-5">
      <SectionHeader
        title="Conversas recentes"
        action={<span className="text-body2 font-medium text-brand">Abrir inbox</span>}
      />
      <ul className="mt-4 flex flex-col gap-4">
        {recentConversations.map((conversation) => (
          <li key={conversation.id} className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-body2 font-semibold text-white">
              {conversation.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-body2 font-semibold text-ink">{conversation.name}</p>
                <span className="shrink-0 text-caption text-ink-3">{conversation.time}</span>
              </div>
              <p className="truncate text-body2 text-ink-2">{conversation.preview}</p>
              <p className="mt-0.5 truncate text-caption text-ink-3">{conversation.channel}</p>
            </div>
            {conversation.unread > 0 ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-micro font-bold text-white">
                {conversation.unread}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
