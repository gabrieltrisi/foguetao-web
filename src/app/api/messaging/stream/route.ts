import "server-only";
import { withCompany } from "@/lib/auth/session";
import { backendUrl, COMPANY_ID_HEADER } from "@/lib/api/config";
import { apiErrorFromResponse, unavailableError } from "@/types/api/error";
import { errorResponse } from "@/lib/api/route-helpers";

/**
 * Proxy de streaming SSE do realtime da Inbox (Fase 6.3B).
 *
 * O navegador (só na Fase 6.3C) abrirá a conexão SSE contra esta rota. Aqui
 * apenas encaminhamos: autenticamos pelo fluxo existente (cookies httpOnly →
 * Bearer + x-company-id, com refresh em 401), abrimos o stream do backend e
 * devolvemos o CORPO como stream — sem json(), sem bufferizar, sem timeout curto.
 * O access token nunca chega ao browser.
 */
export const dynamic = "force-dynamic";

const STREAM_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

async function openBackendStream(
  request: Request,
  token: string,
  companyId: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    accept: "text/event-stream",
    authorization: `Bearer ${token}`,
    [COMPANY_ID_HEADER]: companyId,
  };
  // Last-Event-ID é aceito para compat futura; o backend não faz replay nesta fase.
  const lastEventId = request.headers.get("last-event-id");
  if (lastEventId) headers["last-event-id"] = lastEventId;

  let res: Response;
  try {
    res = await fetch(backendUrl("/messaging/stream"), {
      method: "GET",
      headers,
      cache: "no-store",
      // Propaga o cancelamento do navegador ao upstream (fecha o stream do backend).
      signal: request.signal,
    });
  } catch {
    throw unavailableError("Não foi possível conectar ao stream de mensagens");
  }

  // 401 → deixa o withAuth fazer UM refresh e tentar novamente com o novo token.
  if (res.status === 401) {
    const payload = await res.json().catch(() => undefined);
    throw apiErrorFromResponse(401, payload);
  }
  // Erros ANTES do stream (403/503/etc): propaga como ApiError → JSON no GET.
  if (!res.ok) {
    const payload = await res.json().catch(() => undefined);
    throw apiErrorFromResponse(res.status, payload);
  }
  return res;
}

export async function GET(request: Request): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await withCompany(({ token, companyId }) =>
      openBackendStream(request, token, companyId),
    );
  } catch (error) {
    // 401/403/503/etc entregues como JSON estável ANTES de estabelecer o stream.
    return errorResponse(error);
  }

  // 200: repassa o corpo como ReadableStream. Depois daqui, erro de upstream apenas
  // encerra a conexão — não se troca mais o status HTTP.
  return new Response(upstream.body, { status: 200, headers: STREAM_HEADERS });
}
