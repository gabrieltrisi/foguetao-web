import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { ConversationsLayout } from "@/components/messaging/conversations-layout";
import { conversations, getConversationById } from "@/mocks/messaging/conversations";

export function generateStaticParams() {
  return conversations.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const conversation = getConversationById(id);
  return { title: conversation ? `${conversation.name} · Conversas` : "Conversa" };
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = getConversationById(id);
  if (!conversation) notFound();
  return (
    <div className="flex flex-col gap-4">
      <CommunicationNav />
      <ConversationsLayout selectedId={id} conversation={conversation} />
    </div>
  );
}
