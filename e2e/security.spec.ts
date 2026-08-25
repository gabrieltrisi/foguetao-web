import {
  test,
  expect,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };
const API = "http://localhost:3000/api/v1";

/**
 * Cria um usuário descartável real. As suítes de sessão REVOGAM credenciais —
 * fazer isso com o owner do seed derrubaria as outras suítes. Cada teste usa
 * uma conta própria, em contexto próprio (sem o storageState do projeto).
 */
async function createUser(request: APIRequestContext, label: string) {
  const email = `e2e-sec-${label}-${Date.now()}@e2e.dev`;
  const res = await request.post(`${API}/auth/register`, {
    data: { name: `E2E ${label}`, email, password: PASS },
  });
  expect(res.status()).toBe(201);
  // Confirmação de e-mail obrigatória: usa o verifyToken (exposto fora de
  // produção) para confirmar pelo fluxo real, sem burlar a segurança.
  const { verifyToken } = await res.json();
  expect(verifyToken, "backend deve expor verifyToken fora de produção").toBeTruthy();
  const confirm = await request.post(`${API}/auth/verify-email`, { data: { token: verifyToken } });
  expect(confirm.status()).toBe(200);

  // As telas de Sessões/Segurança ficam sob (app), que exige empresa ativa (o
  // SessionGate manda quem não tem empresa ao onboarding). Um usuário real de
  // verdade tem empresa — provisionamos uma pelo fluxo real (login + criar
  // empresa) para que o descartável chegue a /sessions e /security.
  const login = await request.post(`${API}/auth/login`, { data: { email, password: PASS } });
  expect(login.status()).toBe(200);
  const { accessToken } = await login.json();
  const company = await request.post(`${API}/companies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { name: `E2E Sec ${label} ${Date.now()}` },
  });
  expect(company.status(), "criar empresa do usuário de segurança").toBe(201);
  // O provisionamento acima deixou sessões (o login para criar a empresa). As
  // suítes de sessão contam sessões EXATAS, então zeramos aqui: os logins da UI
  // feitos pelo próprio teste passam a ser as únicas sessões ativas.
  const revoke = await request.post(`${API}/auth/logout-all`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(revoke.status()).toBe(200);
  return { email };
}

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/** Um contexto de navegador logado como `email`, isolado do storageState do projeto. */
async function loggedContext(
  browser: Browser,
  email: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ storageState: EMPTY_STATE });
  const page = await context.newPage();
  await loginAs(page, email);
  return { context, page };
}

test.describe("Sessões (usuário descartável)", () => {
  test("lista a sessão atual, marcada como este dispositivo", async ({ page, browser }) => {
    const user = await createUser(page.request, "list");
    const { context, page: userPage } = await loggedContext(browser, user.email);

    await userPage.goto("/sessions");
    await expect(userPage.getByText(/sess\(ões\)|sessão\(ões\) ativa/i).first()).toBeVisible();
    await expect(userPage.getByText("Este dispositivo")).toBeVisible();

    await context.close();
  });

  test("não vaza IP público cru no card", async ({ page, browser }) => {
    // Neste ambiente o IP das sessões é 127.0.0.1 (UI e API na mesma máquina),
    // que maskIp deixa passar por ser loopback. O contrato verificável aqui:
    // nenhum IP PÚBLICO aparece inteiro. O mascaramento de IPs reais é coberto
    // por maskIp no unit (session-display.test.ts). O userAgent que o backend
    // registra é o do runtime do Next (server-side fetch), não o do browser —
    // por isso não exigimos "Chrome".
    const user = await createUser(page.request, "mask");
    const { context, page: userPage } = await loggedContext(browser, user.email);

    await userPage.goto("/sessions");
    await expect(userPage.getByText(/este dispositivo/i).first()).toBeVisible();

    const html = await userPage.locator("main").innerHTML();
    const ipv4 = html.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) ?? [];
    for (const ip of ipv4) expect(ip).toBe("127.0.0.1");

    await context.close();
  });

  test("encerra outra sessão a partir da atual", async ({ page, browser }) => {
    const user = await createUser(page.request, "revoke");

    // Duas sessões: dois logins do mesmo usuário em contextos diferentes.
    const a = await loggedContext(browser, user.email);
    const b = await loggedContext(browser, user.email);

    await a.page.goto("/sessions");
    await expect(a.page.getByText(/2 sess/i)).toBeVisible();

    // encerra a OUTRA (só as não-atuais têm botão; a atual sai pelo logout).
    await a.page.getByRole("button", { name: /Encerrar sessão em/ }).first().click();
    await a.page.getByRole("button", { name: "Encerrar", exact: true }).click();
    await expect(a.page.getByText("Sessão encerrada")).toBeVisible();
    // a lista de A cai para 1 e A continua logada
    await expect(a.page.getByText(/1 sess/i)).toBeVisible();
    await expect(a.page.getByText(/este dispositivo/i)).toBeVisible();

    await a.context.close();
    await b.context.close();
  });

  test("atualizar recarrega a lista", async ({ page, browser }) => {
    const user = await createUser(page.request, "refresh");
    const { context, page: userPage } = await loggedContext(browser, user.email);

    const requests: string[] = [];
    userPage.on("request", (r) => {
      if (r.url().includes("/api/auth/sessions")) requests.push(r.url());
    });

    await userPage.goto("/sessions");
    await expect(userPage.getByText("Este dispositivo")).toBeVisible();
    const before = requests.length;

    await userPage.getByRole("button", { name: "Atualizar lista de sessões" }).click();
    await expect.poll(() => requests.length).toBeGreaterThan(before);

    await context.close();
  });

  test("sair de todos os dispositivos faz logout global", async ({ page, browser }) => {
    const user = await createUser(page.request, "logoutall");
    const a = await loggedContext(browser, user.email);
    const b = await loggedContext(browser, user.email);

    await a.page.goto("/sessions");
    await a.page.getByRole("button", { name: "Sair de todos os dispositivos" }).click();
    await a.page.getByRole("button", { name: "Sair de todos", exact: true }).click();

    // a sessão atual (A) volta ao login
    await a.page.waitForURL("**/login");

    // e a sessão de B foi de fato revogada no backend — a API já a rejeita com
    // 401. (A aba de B só é redirecionada quando o refresh dedup falha e o BFF
    // limpa os cookies; o proxy checa presença de cookie, não validade. O que
    // garantimos aqui é a revogação no servidor, que é o efeito do logout-all.)
    const apiB = await b.page.request.get("/api/auth/sessions");
    expect(apiB.status()).toBe(401);

    await a.context.close();
    await b.context.close();
  });
});

test.describe("Tela Security", () => {
  test("mostra sessões reais e marca o que não existe como prévia", async ({ page, browser }) => {
    const user = await createUser(page.request, "security");
    const { context, page: userPage } = await loggedContext(browser, user.email);

    await userPage.goto("/security");
    await expect(userPage.getByRole("heading", { name: "Sessões e dispositivos" })).toBeVisible();
    await expect(userPage.getByText("Este dispositivo")).toBeVisible();

    // 2FA, alertas e histórico não existem no backend → prévia declarada
    await expect(userPage.getByText("Autenticação em 2 etapas")).toBeVisible();
    await expect(userPage.getByText(/ainda não tem 2FA/i)).toBeVisible();
    await expect(userPage.getByText(/Alertas de segurança não existem/i)).toBeVisible();
    await expect(userPage.getByText(/histórico de segurança não existe/i)).toBeVisible();

    await context.close();
  });

  test("as prévias não fazem chamadas inexistentes", async ({ page, browser }) => {
    const user = await createUser(page.request, "noreq");
    const { context, page: userPage } = await loggedContext(browser, user.email);

    const notFound: string[] = [];
    userPage.on("response", (r) => {
      if (r.url().includes("/api/") && [404, 500].includes(r.status())) notFound.push(r.url());
    });

    await userPage.goto("/security");
    await userPage.waitForLoadState("networkidle");
    expect(notFound, `rotas inexistentes: ${notFound.join(", ")}`).toEqual([]);

    await context.close();
  });
});

test.describe("Hardening do user-agent", () => {
  test("o backend registra o UA do NAVEGADOR na sessão, não o do runtime", async ({
    page,
    browser,
  }) => {
    const user = await createUser(page.request, "ua");
    // Login pela UI: o BFF encaminha o user-agent do Chromium ao backend.
    const { context, page: userPage } = await loggedContext(browser, user.email);

    const res = await userPage.request.get("/api/auth/sessions");
    const sessions = (await res.json()) as { userAgent: string | null; current: boolean }[];
    const current = sessions.find((s) => s.current)!;
    // O Chromium do Playwright manda um UA com "Chrome" — nunca "node".
    expect(current.userAgent ?? "").toMatch(/Chrome|Mozilla/);
    expect(current.userAgent).not.toBe("node");

    await context.close();
  });
});

test.describe("Segurança do BFF", () => {
  test("id de sessão não-UUID é barrado antes do backend", async ({ page }) => {
    const res = await page.request.delete("/api/auth/sessions/nao-e-uuid");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("revogar sessão inexistente propaga o 404 do backend", async ({ page }) => {
    const res = await page.request.delete(
      "/api/auth/sessions/00000000-0000-4000-8000-000000000000",
    );
    expect(res.status()).toBe(404);
  });

  test("GET /api/auth/sessions devolve o contrato real (sem campos fantasma)", async ({ page }) => {
    const res = await page.request.get("/api/auth/sessions");
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    const current = list.find((s: { current: boolean }) => s.current);
    expect(current).toMatchObject({ id: expect.any(String), current: true });
    // o backend não expõe estes campos
    for (const ghost of ["location", "lastActive", "device", "browser", "os", "revokedAt"]) {
      expect(current).not.toHaveProperty(ghost);
    }
  });
});

test.describe("VIEWER", () => {
  test.use({ storageState: EMPTY_STATE });

  test("VIEWER vê as próprias sessões (auth não exige permissão)", async ({ page }) => {
    // Sessões são do USUÁRIO, não da empresa: nenhuma rota de auth exige
    // permissão nem contexto de empresa. VIEWER acessa normalmente.
    await loginAs(page, VIEWER.email);
    await page.goto("/sessions");
    await expect(page.getByText("Este dispositivo")).toBeVisible();
    await expect(page.getByText(/sess/i).first()).toBeVisible();
  });
});
