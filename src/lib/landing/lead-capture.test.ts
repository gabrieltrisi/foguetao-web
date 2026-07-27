import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { captureQuizLead } from "./lead-capture";
import type { QuizLeadPayloadParsed } from "@/features/landing/quiz/utils/validation";

const payload: QuizLeadPayloadParsed = {
  lead: {
    name: "Marina Alves",
    email: "marina@studiovitta.com",
    whatsapp: "(11) 99999-0000",
    company: "Studio Vitta",
  },
  answers: {
    segmento: "clinica",
    dor: "followup",
    equipe: "media",
    leads: "alto",
    controle: "planilha",
    objetivo: "vendas",
  },
  diagnosis: { segment: "clinica", segmentLabel: "Clínica", score: 47, maturity: "media", plan: "Pro" },
  tracking: { utm: { utm_source: "google" }, referrer: "https://google.com" },
};

const ORIGINAL = {
  url: process.env.LANDING_LEAD_CAPTURE_URL,
  key: process.env.LANDING_LEAD_CAPTURE_KEY,
};

beforeEach(() => {
  delete process.env.LANDING_LEAD_CAPTURE_URL;
  delete process.env.LANDING_LEAD_CAPTURE_KEY;
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.LANDING_LEAD_CAPTURE_URL = ORIGINAL.url;
  process.env.LANDING_LEAD_CAPTURE_KEY = ORIGINAL.key;
});

describe("captureQuizLead — seam desligado (sem env)", () => {
  it("registra e conclui com sucesso sem entregar nem chamar fetch", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await captureQuizLead(payload);

    expect(result).toEqual({ ok: true, delivered: false });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalled();
  });
});

describe("captureQuizLead — seam ligado (com env)", () => {
  beforeEach(() => {
    process.env.LANDING_LEAD_CAPTURE_URL = "https://api.example/landing-lead";
    process.env.LANDING_LEAD_CAPTURE_KEY = "s3cr3t";
  });

  it("entrega ao backend com header e payload no formato de contato", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await captureQuizLead(payload);

    expect(result).toEqual({ ok: true, delivered: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.example/landing-lead");
    expect(init.headers["x-landing-key"]).toBe("s3cr3t");
    const body = JSON.parse(init.body);
    expect(body.source).toBe("LANDING_PAGE");
    expect(body.sourceDetail).toBe("landing_quiz");
    expect(body.firstName).toBe("Marina");
    expect(body.metadata.segment).toBe("clinica");
    expect(body.metadata.score).toBe(47);
    expect(body.metadata.origin).toBe("landing_quiz");
  });

  it("não lança e reporta delivered:false quando o backend recusa", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(captureQuizLead(payload)).resolves.toEqual({ ok: true, delivered: false });
  });

  it("não lança e reporta delivered:false quando a rede falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(captureQuizLead(payload)).resolves.toEqual({ ok: true, delivered: false });
  });
});
