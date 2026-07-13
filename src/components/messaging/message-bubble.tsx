import { Check, CheckCheck, FileText, ImageIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/messaging";

export function MessageBubble({ message: m }: { message: Message }) {
  if (m.type === "system") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-line/60 px-3 py-1 text-caption text-ink-2">{m.content}</span>
      </div>
    );
  }

  const isAgent = m.author === "agent";

  return (
    <div className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-body2 shadow-sm sm:max-w-[65%]",
          isAgent
            ? "rounded-br-md bg-brand text-white"
            : "rounded-bl-md border border-line bg-white text-ink",
        )}
      >
        {m.type === "text" ? <p className="whitespace-pre-wrap">{m.content}</p> : null}

        {m.type === "image" ? (
          <div>
            <div className={cn("flex h-36 w-48 items-center justify-center rounded-lg", isAgent ? "bg-white/15" : "bg-surface")}>
              <ImageIcon className={cn("size-8", isAgent ? "text-white/70" : "text-ink-3")} aria-hidden />
            </div>
            {m.content ? <p className="mt-1.5">{m.content}</p> : null}
          </div>
        ) : null}

        {m.type === "document" ? (
          <div className={cn("flex items-center gap-2.5 rounded-lg p-2", isAgent ? "bg-white/15" : "bg-surface")}>
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", isAgent ? "bg-white/20 text-white" : "bg-brand-soft text-brand")}>
              <FileText className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{m.fileName}</span>
              <span className={cn("block text-caption", isAgent ? "text-white/70" : "text-ink-3")}>{m.fileSize}</span>
            </span>
          </div>
        ) : null}

        {m.type === "audio" ? (
          <div className="flex items-center gap-2.5">
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", isAgent ? "bg-white/20 text-white" : "bg-brand text-white")}>
              <Play className="size-4" aria-hidden />
            </span>
            <span className="flex flex-1 items-center gap-0.5" aria-hidden>
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("w-0.5 rounded-full", isAgent ? "bg-white/60" : "bg-ink-3")}
                  style={{ height: `${6 + ((i * 5) % 14)}px` }}
                />
              ))}
            </span>
            <span className={cn("text-caption", isAgent ? "text-white/80" : "text-ink-3")}>{m.duration}</span>
          </div>
        ) : null}

        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", isAgent ? "text-white/70" : "text-ink-3")}>
          {m.time}
          {isAgent ? (
            m.read ? <CheckCheck className="size-3" aria-hidden /> : <Check className="size-3" aria-hidden />
          ) : null}
        </div>
      </div>
    </div>
  );
}
