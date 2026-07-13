"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, MoreVertical, Phone, Sparkles, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { ChannelBadge } from "@/components/business/badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageBubble } from "@/components/messaging/message-bubble";
import { ChatComposer } from "@/components/messaging/chat-composer";
import { getMessages } from "@/mocks/messaging/messages";
import type { Conversation, Message } from "@/types/messaging";

export function ChatView({ conversation }: { conversation: Conversation }) {
  const [messages, setMessages] = React.useState<Message[]>(() => getMessages(conversation.id));
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${conversation.id}-new-${prev.length}`,
        conversationId: conversation.id,
        author: "agent",
        type: "text",
        content: text,
        time: "agora",
        read: false,
      },
    ]);
    setTyping(true);
    window.setTimeout(() => setTyping(false), 1600);
  };

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho */}
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        <Link href="/conversations" aria-label="Voltar" className="lg:hidden">
          <Button variant="ghost" size="icon-sm">
            <ChevronLeft />
          </Button>
        </Link>
        <div className="relative shrink-0">
          <EntityAvatar name={conversation.name} size="md" />
          {conversation.online ? (
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-success" aria-hidden />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{conversation.name}</p>
          <p className={cn("truncate text-caption", typing ? "text-brand" : conversation.online ? "text-success" : "text-ink-3")}>
            {typing ? "digitando…" : conversation.online ? "online" : "visto por último há 1 h"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ChannelBadge channel={conversation.channel} />
          <Button variant="ghost" size="icon-sm" aria-label="Ligar" className="hidden sm:inline-flex">
            <Phone />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Chamada de vídeo" className="hidden sm:inline-flex">
            <Video />
          </Button>
          <Link href="/ai-assistant" aria-label="Assistente de IA">
            <Button variant="ghost" size="icon-sm">
              <Sparkles />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Mais opções">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver contato</DropdownMenuItem>
              <DropdownMenuItem>Adicionar etiqueta</DropdownMenuItem>
              <DropdownMenuItem>Transferir fila</DropdownMenuItem>
              <DropdownMenuItem className="text-danger [&_svg]:text-danger">Encerrar conversa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mensagens */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-2 overflow-y-auto bg-surface p-4">
        <div className="mb-2 flex justify-center">
          <span className="rounded-full bg-white px-3 py-1 text-caption font-medium text-ink-2 shadow-sm">Hoje</span>
        </div>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {typing ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-3 py-2.5 shadow-sm">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink-3" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <ChatComposer onSend={handleSend} />
    </div>
  );
}
