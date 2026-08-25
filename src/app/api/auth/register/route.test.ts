import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks dos serviços/efeitos colaterais do handler. O objetivo é testar a
// LÓGICA DE RAMIFICAÇÃO da rota (auto-login vs. confirmação pendente), não o
// backend nem os cookies reais.
const registerRequest = vi.fn();
const listCompaniesRequest = vi.fn();
const setSessionCookies = vi.fn();
const setActiveCompanyId = vi.fn();

vi.mock("@/lib/auth/service", () => ({
  registerRequest: (...args: unknown[]) => registerRequest(...args),
  listCompaniesRequest: (...args: unknown[]) => listCompaniesRequest(...args),
}));
vi.mock("@/lib/auth/cookies", () => ({
  setSessionCookies: (...args: unknown[]) => setSessionCookies(...args),
  setActiveCompanyId: (...args: unknown[]) => setActiveCompanyId(...args),
}));

import { POST } from "./route";

const VALID = { name: "Fulano de Tal", email: "fulano@example.com", password: "Str0ng!Passw0rd" };

function post(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "vitest" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    registerRequest.mockReset();
    listCompaniesRequest.mockReset();
    setSessionCookies.mockReset();
    setActiveCompanyId.mockReset();
  });

  it("confirmação DESLIGADA: backend devolve tokens → define cookies (auto-login) e pendingVerification:false", async () => {
    registerRequest.mockResolvedValue({
      user: { id: "u1", email: VALID.email },
      accessToken: "at-1",
      refreshToken: "rt-1",
    });
    listCompaniesRequest.mockResolvedValue([{ id: "co-1" }]);

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toMatchObject({ pendingVerification: false, user: { id: "u1" } });
    expect(setSessionCookies).toHaveBeenCalledWith({ accessToken: "at-1", refreshToken: "rt-1" });
    expect(setActiveCompanyId).toHaveBeenCalledWith("co-1");
    // não vaza os tokens no corpo da resposta
    expect(json.accessToken).toBeUndefined();
    expect(json.refreshToken).toBeUndefined();
  });

  it("auto-login sem empresa ainda: não quebra e segue com pendingVerification:false", async () => {
    registerRequest.mockResolvedValue({
      user: { id: "u2", email: VALID.email },
      accessToken: "at-2",
      refreshToken: "rt-2",
    });
    // conta recém-criada ainda não tem empresa
    listCompaniesRequest.mockRejectedValue(new Error("no company yet"));

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.pendingVerification).toBe(false);
    expect(setSessionCookies).toHaveBeenCalledOnce();
    expect(setActiveCompanyId).not.toHaveBeenCalled();
  });

  it("confirmação LIGADA: backend não devolve tokens → pendingVerification:true e NÃO define cookies", async () => {
    registerRequest.mockResolvedValue({
      user: { id: "u3", email: VALID.email },
      message: "Enviamos um link de confirmação.",
    });

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toMatchObject({ pendingVerification: true, email: VALID.email });
    expect(setSessionCookies).not.toHaveBeenCalled();
    expect(setActiveCompanyId).not.toHaveBeenCalled();
  });

  it("corpo inválido (senha fraca) → 400 VALIDATION_ERROR, sem tocar no backend", async () => {
    const res = await POST(post({ ...VALID, password: "fraca" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe("VALIDATION_ERROR");
    expect(registerRequest).not.toHaveBeenCalled();
  });

  it("e-mail inválido → 400 VALIDATION_ERROR", async () => {
    const res = await POST(post({ ...VALID, email: "nao-e-email" }));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
    expect(registerRequest).not.toHaveBeenCalled();
  });
});
