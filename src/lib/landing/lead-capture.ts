import "server-only";
import type { QuizLeadPayloadParsed } from "@/features/landing/quiz/utils/validation";

/**
 * Seam de captação de lead do quiz — SÓ no web, desligado por padrão.
 *
 * Se `LANDING_LEAD_CAPTURE_URL` + `LANDING_LEAD_CAPTURE_KEY` estiverem
 * configuradas, entrega o lead ao backend (endpoint público a criar — ver
 * docs/landing-quiz.md); caso contrário, registra o lead de forma estruturada e
 * retorna sucesso. Nunca lança para o cliente: falha de entrega vira
 * `delivered:false`, e a experiência do usuário conclui normalmente.
 */
export interface LeadDeliveryResult {
  ok: boolean;
  delivered: boolean;
}

/** Converte o payload do quiz no formato esperado pelo CreateContactDto do backend. */
function toContactBody(p: QuizLeadPayloadParsed) {
  const parts = p.lead.name.trim().split(/\s+/);
  const firstName = parts.shift() || p.lead.name.trim();
  const lastName = parts.length ? parts.join(" ") : undefined;

  return {
    firstName,
    lastName,
    email: p.lead.email,
    phone: p.lead.whatsapp,
    whatsappPhone: p.lead.whatsapp,
    status: "LEAD",
    source: "LANDING_PAGE",
    sourceDetail: "landing_quiz",
    metadata: {
      origin: "landing_quiz",
      segment: p.diagnosis.segment,
      segmentLabel: p.diagnosis.segmentLabel,
      dor: p.answers.dor,
      equipe: p.answers.equipe,
      leads: p.answers.leads,
      controle: p.answers.controle,
      objetivo: p.answers.objetivo,
      score: p.diagnosis.score,
      maturity: p.diagnosis.maturity,
      plano: p.diagnosis.plan,
      empresa: p.lead.company,
      utm: p.tracking.utm,
      referrer: p.tracking.referrer,
      ts: new Date().toISOString(),
    },
  };
}

export async function captureQuizLead(payload: QuizLeadPayloadParsed): Promise<LeadDeliveryResult> {
  const url = process.env.LANDING_LEAD_CAPTURE_URL;
  const key = process.env.LANDING_LEAD_CAPTURE_KEY;
  const body = toContactBody(payload);
  const isProd = process.env.NODE_ENV === "production";

  if (!url || !key) {
    // Seam desligado: registra (sem PII em produção) e conclui com sucesso.
    console.info(
      "[landing-quiz] lead capturado (entrega desligada)",
      isProd
        ? { segment: body.metadata.segment, score: body.metadata.score, delivered: false }
        : body,
    );
    return { ok: true, delivered: false };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-landing-key": key },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[landing-quiz] backend recusou o lead", { status: res.status });
      return { ok: true, delivered: false };
    }
    return { ok: true, delivered: true };
  } catch {
    console.error("[landing-quiz] falha de rede ao entregar o lead");
    return { ok: true, delivered: false };
  }
}
