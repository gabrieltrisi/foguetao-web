import type { Metadata } from "next";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { ConversationsLayout } from "@/components/messaging/conversations-layout";

/**
 * A conversa é carregada no cliente pelo contrato real. Não há mais
 * `generateStaticParams` (prerenderava ids mockados, o que faria 404 com ids
 * reais) nem `notFound()` no servidor: o 404 do backend vira estado de erro na
 * própria tela, preservando a lista ao lado.
 */
export const metadata: Metadata = {
  title: "Conversa",
  robots: { index: false, follow: false },
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-4">
      <CommunicationNav />
      <ConversationsLayout selectedId={id} />
    </div>
  );
}
