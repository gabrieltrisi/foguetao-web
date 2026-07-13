import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";

export type TimelineEntry = {
  id: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  time: string;
};

/** Linha do tempo vertical (histórico de eventos). */
export function Timeline({ items, className }: { items: TimelineEntry[]; className?: string }) {
  return (
    <ol className={cn("relative flex flex-col", className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const isLast = i === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-line" aria-hidden />
            ) : null}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-2">
              {Icon ? <Icon className="size-4" aria-hidden /> : <span className="size-2 rounded-full bg-brand" />}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-body2 text-ink">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-small text-ink-2">{item.description}</p>
              ) : null}
              <p className="mt-0.5 text-caption text-ink-3">{item.time}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Renderiza texto com **negrito**. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Item de atividade (avatar + texto rico + tempo). */
export function ActivityItem({
  actorName,
  text,
  time,
  className,
}: {
  actorName: string;
  text: string;
  time: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <EntityAvatar name={actorName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-body2 text-ink-2">
          <RichText text={text} />
        </p>
        <p className="mt-0.5 text-caption text-ink-3">{time}</p>
      </div>
    </div>
  );
}
