"use client";

import * as React from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";

const EMOJIS = ["😀", "😄", "😍", "👍", "🙏", "🚀", "🎉", "🔥", "✅", "❤️", "😅", "🤝", "💡", "📎", "⏰", "💰"];

export function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
  const { toast } = useToast();
  const [text, setText] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-end gap-2 border-t border-line bg-white p-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Emoji">
            <Smile />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setText((t) => t + e)}
                className="flex size-6 items-center justify-center rounded text-base hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {e}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Anexar"
        onClick={() => toast({ title: "Anexar arquivo (mock)" })}
      >
        <Paperclip />
      </Button>

      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={1}
        placeholder="Escreva uma mensagem…"
        aria-label="Mensagem"
        className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-line bg-white px-3 py-2 text-body2 text-ink shadow-sm placeholder:text-ink-3 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none"
      />

      <Button size="icon" aria-label="Enviar" onClick={send} disabled={!text.trim()}>
        <Send />
      </Button>
    </div>
  );
}
