import type { Message } from "@/types/messaging";

/** Thread padrão reutilizado para qualquer conversa (mock). */
function threadFor(conversationId: string): Message[] {
  return [
    { id: `${conversationId}-0`, conversationId, author: "system", type: "system", content: "Conversa iniciada · WhatsApp", time: "09:58" },
    { id: `${conversationId}-1`, conversationId, author: "contact", type: "text", content: "Bom dia! Vi a apresentação de vocês e fiquei bem interessado.", time: "10:02" },
    { id: `${conversationId}-2`, conversationId, author: "agent", type: "text", content: "Bom dia! Que ótimo 😊 Posso te enviar uma proposta personalizada?", time: "10:05", read: true },
    { id: `${conversationId}-3`, conversationId, author: "contact", type: "text", content: "Sim, por favor. Somos um time de 12 pessoas.", time: "10:08" },
    { id: `${conversationId}-4`, conversationId, author: "agent", type: "document", content: "Proposta comercial", fileName: "proposta-foguetao.pdf", fileSize: "248 KB", time: "10:12", read: true },
    { id: `${conversationId}-5`, conversationId, author: "contact", type: "image", content: "Print do time atual", time: "10:20" },
    { id: `${conversationId}-6`, conversationId, author: "contact", type: "audio", content: "", duration: "0:42", time: "10:21" },
    { id: `${conversationId}-7`, conversationId, author: "agent", type: "text", content: "Recebido! Consigo aplicar um desconto no plano anual. Fecha hoje?", time: "10:40", read: true },
    { id: `${conversationId}-8`, conversationId, author: "contact", type: "text", content: "Perfeito, podemos fechar hoje ainda?", time: "10:42" },
  ];
}

export function getMessages(conversationId: string): Message[] {
  return threadFor(conversationId);
}
