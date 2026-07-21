import { test, expect, type Page } from "@playwright/test";

/**
 * Sprint 1.3: a suíte foi REPONTADA para os contratos reais. Antes ela usava
 * ids mockados ("conv-1"), o eco local do chat e o QR simulado — nada disso
 * existe mais. Conversas, chat e contas são reais; Inbox/Etiquetas/Filas/
 * Templates seguem em Preview (não há backend para eles).
 */

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };
/** Id real (UUID) — o BFF recusa ids fora do formato. */
const CONV_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/** Payloads do CONTRATO REAL — o seed não cria messaging. */
const CONV = {
  id: CONV_ID,
  companyId: "co1",
  messagingAccountId: "11111111-1111-4111-8111-111111111111",
  type: "DIRECT",
  status: "OPEN",
  title: "Acme",
  assignedToUserId: null,
  contactId: null,
  unreadCount: 0,
  lastMessageAt: "2026-07-16T12:00:00.000Z",
  lastInboundAt: null,
  lastOutboundAt: null,
  createdAt: "2026-07-16T10:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  participants: [
    { id: "p1", type: "CONTACT", phone: "+55 11 9****-**77", displayName: null, contactId: null, isAdmin: false },
  ],
  lastMessage: null,
};

const MESSAGE = {
  id: "22222222-2222-4222-8222-222222222222",
  conversationId: CONV_ID,
  messagingAccountId: CONV.messagingAccountId,
  direction: "INBOUND",
  type: "TEXT",
  status: "RECEIVED",
  preview: "Olá, tudo bem?",
  hasMedia: false,
  mediaId: null,
  externalMessageId: null,
  clientMessageId: "ext-1",
  replyToMessageId: null,
  errorCode: null,
  sentAt: null,
  deliveredAt: null,
  readAt: null,
  failedAt: null,
  receivedAt: "2026-07-16T12:00:00.000Z",
  createdAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
};

/** Serve o detalhe/mensagens dessa conversa com o shape real do contrato. */
async function stubConversation(page: Page, over: Record<string, unknown> = {}) {
  await page.route(`**/api/messaging/conversations/${CONV_ID}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...CONV, ...over }),
    }),
  );
  await page.route(`**/api/messaging/conversations/${CONV_ID}/messages**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [MESSAGE], nextCursor: null, hasMore: false }),
    }),
  );
}

const routes = [
  "/conversations",
  `/conversations/${CONV_ID}`,
  "/whatsapp",
  "/inbox",
  "/templates",
  "/labels",
  "/queues",
  "/ai-assistant",
];

const mobileRoutes = [
  "/conversations",
  `/conversations/${CONV_ID}`,
  "/whatsapp",
  "/inbox",
  "/templates",
  "/queues",
];

test.describe("Comunicação — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} sem overflow nem erros`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await stubConversation(page);
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Comunicação — mobile 390", () => {
  for (const route of mobileRoutes) {
    test(`${route} sem overflow @ 390`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await stubConversation(page);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Conversas (owner)", () => {
  test("lista real carrega com o envelope de cursor do contrato", async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/messaging/conversations") && r.ok()),
      page.goto("/conversations"),
    ]);
    const body = await response.json();
    expect(body).toMatchObject({ hasMore: expect.any(Boolean) });
    expect(Array.isArray(body.items)).toBe(true);
    expect(body).toHaveProperty("nextCursor");

    await expect(page.getByPlaceholder("Buscar conversas…")).toBeVisible();
    await expect(page.getByText("Selecione uma conversa")).toBeVisible();
  });

  test("filtro de status usa o enum real do contrato", async ({ page }) => {
    await page.goto("/conversations");
    await expect(page.getByPlaceholder("Buscar conversas…")).toBeVisible();
    const request = page.waitForRequest((r) => r.url().includes("status=OPEN"));
    await page.getByRole("tab", { name: "Abertas" }).click();
    expect((await request).url()).toContain("status=OPEN");
  });

  test("busca envia o termo ao servidor", async ({ page }) => {
    await page.goto("/conversations");
    const request = page.waitForRequest((r) => r.url().includes("search=acme"));
    await page.getByPlaceholder("Buscar conversas…").fill("acme");
    expect((await request).url()).toContain("search=acme");
  });

  test("sem conversas, estado vazio honesto", async ({ page }) => {
    await page.route("**/api/messaging/conversations?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      }),
    );
    await page.goto("/conversations");
    await expect(page.getByText("Nenhuma conversa encontrada.")).toBeVisible();
  });

  test("offline mostra alerta na lista", async ({ page }) => {
    await page.route("**/api/messaging/conversations?**", (route) => route.abort("failed"));
    await page.goto("/conversations");
    await expect(page.getByText("Não foi possível carregar as conversas.")).toBeVisible();
  });

  test("conversa inexistente vira erro sem derrubar a lista (404)", async ({ page }) => {
    await page.goto(`/conversations/${CONV_ID}`);
    await expect(
      page.getByText(/Conversa não encontrada|Não foi possível carregar a conversa/),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Buscar conversas…")).toBeVisible();
  });

  test("id inválido é barrado no BFF", async ({ page }) => {
    expect((await page.request.get("/api/messaging/conversations/conv-1")).status()).toBe(400);
  });
});

test.describe("Chat com o contrato real", () => {
  test("abre a conversa e mostra a thread com telefone mascarado", async ({ page }) => {
    await stubConversation(page);
    await page.goto(`/conversations/${CONV_ID}`);
    await expect(page.getByText("Acme").first()).toBeVisible();
    await expect(page.getByText("Olá, tudo bem?")).toBeVisible();
    // o telefone chega mascarado do backend e é exibido como veio
    await expect(page.getByText("+55 11 9****-**77")).toBeVisible();
    // "Aberta" (badge de status) vs "Abertas" (aba do filtro) — exige exato
    await expect(page.getByText("Aberta", { exact: true })).toBeVisible();
  });

  test("envia usando o contrato (tipo TEXT + clientMessageId idempotente)", async ({ page }) => {
    await stubConversation(page);
    await page.goto(`/conversations/${CONV_ID}`);
    await expect(page.getByText("Olá, tudo bem?")).toBeVisible();

    const request = page.waitForRequest(
      (r) => r.url().includes("/api/messaging/messages") && r.method() === "POST",
    );
    await page.route("**/api/messaging/messages", (route) =>
      route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ ...MESSAGE, direction: "OUTBOUND", status: "QUEUED" }),
      }),
    );

    await page.getByLabel("Mensagem").fill("Mensagem de teste automatizada");
    await page.getByRole("button", { name: "Enviar" }).click();

    const body = (await request).postDataJSON();
    expect(body.type).toBe("TEXT");
    expect(body.content).toEqual({ text: "Mensagem de teste automatizada" });
    expect(body.messagingAccountId).toBe(CONV.messagingAccountId);
    expect(String(body.clientMessageId)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  });

  test("conversa resolvida não permite enviar", async ({ page }) => {
    await stubConversation(page, { status: "RESOLVED" });
    await page.goto(`/conversations/${CONV_ID}`);
    await expect(page.getByText("Reabra a conversa para enviar mensagens.")).toBeVisible();
  });
});

test.describe("BFF de messaging", () => {
  test("status fora do enum real é barrado (400)", async ({ page }) => {
    expect((await page.request.get("/api/messaging/conversations?status=closed")).status()).toBe(400);
  });

  test("limit acima de 100 é barrado (400)", async ({ page }) => {
    expect((await page.request.get("/api/messaging/conversations?limit=101")).status()).toBe(400);
  });

  test("tipo não-enviável é barrado (400)", async ({ page }) => {
    const res = await page.request.post("/api/messaging/messages", {
      data: {
        messagingAccountId: CONV_ID,
        to: "+5511988887777",
        type: "AUDIO",
        content: { text: "x" },
        clientMessageId: "web-1",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("clientMessageId inválido é barrado (400)", async ({ page }) => {
    const res = await page.request.post("/api/messaging/messages", {
      data: {
        messagingAccountId: CONV_ID,
        to: "+5511988887777",
        type: "TEXT",
        content: { text: "x" },
        clientMessageId: "tem espaço",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("assign exige UUID (400)", async ({ page }) => {
    const res = await page.request.post(`/api/messaging/conversations/${CONV_ID}/assign`, {
      data: { assignedToUserId: "eu" },
    });
    expect(res.status()).toBe(400);
  });

  test("GET /api/messaging/accounts responde o contrato", async ({ page }) => {
    const res = await page.request.get("/api/messaging/accounts");
    expect(res.status()).toBe(200);
    expect(Array.isArray((await res.json()).items)).toBe(true);
  });
});

test.describe("WhatsApp — contas reais", () => {
  test("contas reais e QR marcado como indisponível", async ({ page }) => {
    await page.goto("/whatsapp");
    // O QR não tem contrato — a tela diz isso em vez de simular
    await expect(page.getByText(/pareamento por QR Code ainda não tem contrato/i)).toBeVisible();
    await expect(page.getByText("disponível em breve")).toBeVisible();
    // sem contas no seed → estado vazio honesto
    await expect(page.getByText("Nenhuma conta de mensageria.")).toBeVisible();
  });
});

test.describe("Telas em Preview (sem backend)", () => {
  for (const route of ["/inbox", "/labels", "/queues", "/templates"]) {
    test(`${route} avisa que é Preview e não persiste`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByText("Preview — disponível em breve.")).toBeVisible();
      await expect(page.getByText(/nada é salvo/i)).toBeVisible();
    });
  }

  test("templates segue navegável em Preview (filtro por favoritos)", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.getByRole("heading", { level: 1, name: "Templates" })).toBeVisible();
    await page.getByRole("button", { name: "Favoritos", exact: true }).click();
    await expect(page.getByText("Boas-vindas")).toBeVisible();
  });
});

test.describe("Dashboard — sem card de Conversas (MVP 1.1)", () => {
  test("não expõe o módulo de Conversas no dashboard", async ({ page }) => {
    // Sprint MVP 1.1: o card "Conversas recentes" foi removido do dashboard
    // para não surgir um caminho a um módulo fora do MVP.
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: "Visão geral" })).toBeVisible();
    await expect(page.getByText("Conversas recentes")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Abrir inbox" })).toHaveCount(0);
  });
});

test.describe("Messaging — VIEWER (somente leitura)", () => {
  test.use({ storageState: EMPTY_STATE });

  /**
   * O contrato REAL dá ao VIEWER messaging.{accounts,conversations,messages}.read
   * — ele LÊ conversas, mas não envia, atribui, resolve nem arquiva.
   */
  test("viewer lê a lista de conversas (200)", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    await page.goto("/conversations");
    await expect(page.getByPlaceholder("Buscar conversas…")).toBeVisible();
    await expect(page.getByText(/não tem permissão para ver conversas/i)).toHaveCount(0);
    expect((await page.request.get("/api/messaging/conversations")).status()).toBe(200);
  });

  test("viewer não vê o compositor e o backend recusa o envio (403)", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    await stubConversation(page);
    await page.goto(`/conversations/${CONV_ID}`);
    await expect(page.getByText("Você não tem permissão para enviar mensagens.")).toBeVisible();
    await expect(page.getByLabel("Mensagem")).toHaveCount(0);

    const res = await page.request.post("/api/messaging/messages", {
      data: {
        messagingAccountId: CONV_ID,
        to: "+5511988887777",
        type: "TEXT",
        content: { text: "x" },
        clientMessageId: "web-viewer",
      },
    });
    expect(res.status()).toBe(403);
  });
});
