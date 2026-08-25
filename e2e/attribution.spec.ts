import { test, expect, type Page } from "@playwright/test";

/**
 * Origens de lead e atribuição — Sprint 1.5A-2. Backend REAL.
 *
 * O domínio NÃO tem métrica de mídia: não há gasto, CPL, receita, ROAS nem
 * conversão. `contactCount` é contagem de contatos do CRM. Há cenário dedicado
 * a provar que nada disso aparece.
 */
const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const PREFIX = "E2E Origem";

function uniq(suffix = "") {
  return `${PREFIX} ${Date.now()}${suffix}`;
}

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}

/** KPIs que NÃO existem em nenhum contrato desta sprint. */
const BANNED_METRICS = [
  "investido",
  "roas",
  "roi",
  "cpl",
  "cpc",
  "cpm",
  "ctr",
  "impressões",
  "cliques",
  "conversão",
  "conversões",
  "receita",
  "alcance",
  "frequência",
];

async function expectNoMediaMetrics(page: Page, where: string) {
  const main = (await page.locator("main").innerText()).toLowerCase();
  for (const metric of BANNED_METRICS) {
    const re = new RegExp(`(^|[^a-zà-ú])${metric}([^a-zà-ú]|$)`, "i");
    expect(re.test(main), `métrica de mídia proibida em ${where}: ${metric}`).toBe(false);
  }
}

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

async function createSource(page: Page, body: Record<string, unknown>) {
  const res = await page.request.post("/api/marketing/lead-sources", { data: body });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as { id: string; name: string };
}

async function firstContactId(page: Page): Promise<string> {
  const res = await page.request.get("/api/crm/contacts?limit=1");
  expect(res.ok()).toBe(true);
  const body = (await res.json()) as { items: { id: string }[] };
  expect(body.items.length).toBeGreaterThan(0);
  return body.items[0].id;
}

async function createCampaign(page: Page, name: string) {
  const res = await page.request.post("/api/marketing/campaigns", { data: { name } });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as { id: string; name: string };
}

/** Limpa o que o spec criou: atribuições, origens e campanhas. */
async function purge(page: Page) {
  const contactId = await firstContactId(page);
  const attrs = await page.request.get(`/api/crm/contacts/${contactId}/attributions`);
  if (attrs.ok()) {
    const body = (await attrs.json()) as { items: { id: string }[] };
    for (const a of body.items) await page.request.delete(`/api/marketing/attributions/${a.id}`);
  }
  const sources = await page.request.get("/api/marketing/lead-sources");
  if (sources.ok()) {
    const body = (await sources.json()) as { items: { id: string; name: string }[] };
    for (const s of body.items.filter((x) => x.name.startsWith(PREFIX))) {
      await page.request.delete(`/api/marketing/lead-sources/${s.id}`);
    }
  }
  const campaigns = await page.request.get(
    `/api/marketing/campaigns?limit=100&search=${encodeURIComponent(PREFIX)}`,
  );
  if (campaigns.ok()) {
    const body = (await campaigns.json()) as { items: { id: string; name: string }[] };
    for (const c of body.items.filter((x) => x.name.startsWith(PREFIX))) {
      await page.request.delete(`/api/marketing/campaigns/${c.id}`);
    }
  }
}

test.describe("Origens de lead (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  test("1. lista o catálogo REAL e não exibe Preview", async ({ page }) => {
    await page.goto("/lead-sources");
    await expect(page.getByRole("heading", { level: 1, name: "Origens de lead" })).toBeVisible();
    await expect(page.getByText("Preview — disponível em breve.")).toHaveCount(0);
    // as origens padrão do seed existem de verdade. Uso `row` porque a origem
    // padrão "Instagram" também é do agrupamento "Instagram": há duas células
    // com o mesmo texto na linha.
    await expect(page.getByRole("row", { name: /^Instagram Instagram/ })).toBeVisible();
  });

  test("2. consome o BFF (o browser nunca fala com o backend)", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => urls.push(r.url()));
    await page.goto("/lead-sources");
    await page.waitForLoadState("networkidle");
    expect(urls.some((u) => u.includes("/api/marketing/lead-sources"))).toBe(true);
    expect(urls.filter((u) => u.includes(":3000/api/v1"))).toEqual([]);
  });

  test("3. zero métricas de mídia no catálogo", async ({ page }) => {
    await page.goto("/lead-sources");
    await page.waitForLoadState("networkidle");
    await expectNoMediaMetrics(page, "o catálogo de origens");
  });

  test("4. cria origem personalizada e ela aparece", async ({ page }) => {
    const name = uniq();
    await page.goto("/lead-sources");
    await page.getByRole("button", { name: "Nova origem" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill(name);
    await modal.getByRole("button", { name: "Criar origem" }).click();
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
  });

  test("5. nome duplicado mostra o erro real do backend", async ({ page }) => {
    const name = uniq();
    await createSource(page, { name });
    await page.goto("/lead-sources");
    await page.getByRole("button", { name: "Nova origem" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill(name.toUpperCase());
    await modal.getByRole("button", { name: "Criar origem" }).click();
    await expect(page.getByText(/já existe uma origem com este nome/i)).toBeVisible();
  });

  test("6. filtra por agrupamento", async ({ page }) => {
    const name = uniq(" ref");
    await createSource(page, { name, kind: "REFERRAL" });
    await page.goto("/lead-sources");
    await page.getByRole("button", { name: "Todos os agrupamentos" }).click();
    await page.getByRole("option", { name: "Indicação", exact: true }).click();
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("row", { name: /^Instagram Instagram/ })).toHaveCount(0);
  });

  test("7. origem padrão não pode ser excluída — o backend recusa", async ({ page }) => {
    await page.goto("/lead-sources");
    await page.getByRole("button", { name: "Excluir Instagram" }).click();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();
    await expect(page.getByText(/origem padrão não pode ser excluída/i)).toBeVisible();
    // continua no catálogo
    await expect(page.getByRole("row", { name: /^Instagram Instagram/ })).toBeVisible();
  });

  test("8. edita e desativa uma origem", async ({ page }) => {
    const name = uniq();
    const source = await createSource(page, { name });
    await page.goto("/lead-sources");
    await page.getByRole("button", { name: `Editar ${source.name}` }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Origem ativa").click();
    await modal.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Origem atualizada")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Inativa", exact: true })).toBeVisible();
  });

  test("9. erro de backend mostra estado de erro, não tela quebrada", async ({ page }) => {
    await page.route("**/api/marketing/lead-sources**", (r) =>
      r.fulfill({ status: 503, body: "{}" }),
    );
    await page.goto("/lead-sources");
    await expect(page.getByText("Não foi possível carregar as origens.")).toBeVisible();
  });
});

test.describe("Atribuição no contato (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  test("10. contato sem origem mostra estado honesto, sem inventar toque", async ({ page }) => {
    const contactId = await firstContactId(page);
    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await expect(page.getByText("Origem não registrada.")).toBeVisible();
    await expect(page.getByText(/nada é presumido/i)).toBeVisible();
  });

  test("11. registra a origem e ela aparece no histórico", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const contactId = await firstContactId(page);
    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await page.getByRole("button", { name: "Registrar origem" }).click();

    const modal = page.getByRole("dialog");
    await modal.getByLabel("Origem").click();
    await page.getByRole("option", { name: source.name, exact: true }).click();
    await modal.getByLabel("utm_source").fill("Instagram");
    await modal.getByLabel("URL de destino").fill("https://site.com/promo");
    await modal.getByRole("button", { name: "Registrar" }).click();

    await expect(page.getByText("Origem registrada")).toBeVisible();
    await expect(page.getByText("Primeiro toque")).toBeVisible();
    // a UTM é gravada normalizada pelo backend
    await expect(page.getByText("instagram").first()).toBeVisible();
  });

  test("12. URL inválida é barrada antes de enviar", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const contactId = await firstContactId(page);
    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await page.getByRole("button", { name: "Registrar origem" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Origem").click();
    await page.getByRole("option", { name: source.name, exact: true }).click();
    await modal.getByLabel("URL de destino").fill("nao-e-url");
    await expect(page.getByText(/use uma url http\(s\) completa/i)).toBeVisible();
    await expect(modal.getByRole("button", { name: "Registrar" })).toBeDisabled();
  });

  test("13. origem é obrigatória", async ({ page }) => {
    const contactId = await firstContactId(page);
    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await page.getByRole("button", { name: "Registrar origem" }).click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Registrar" }),
    ).toBeDisabled();
  });

  test("14. histórico preserva os toques e deriva primeiro/último", async ({ page }) => {
    const instagram = await createSource(page, { name: uniq(" ig"), kind: "INSTAGRAM" });
    const indicacao = await createSource(page, { name: uniq(" ind"), kind: "REFERRAL" });
    const contactId = await firstContactId(page);

    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: { leadSourceId: instagram.id, capturedAt: "2026-03-01T10:00:00.000Z" },
    });
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: { leadSourceId: indicacao.id, capturedAt: "2026-07-20T10:00:00.000Z" },
    });

    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await expect(page.getByText("Histórico (2 toques)")).toBeVisible();

    // nada foi sobrescrito: os dois toques continuam lá
    const first = page.locator("text=Primeiro toque").locator("xpath=..");
    await expect(first).toContainText(instagram.name);
    const last = page.locator("text=Último toque").locator("xpath=..");
    await expect(last).toContainText(indicacao.name);
  });

  test("15. a mesma captura não duplica o histórico (idempotente)", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const contactId = await firstContactId(page);
    const body = { leadSourceId: source.id, capturedAt: "2026-08-01T10:00:00.000Z" };
    const first = await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: body,
    });
    expect(first.status()).toBe(201);
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, { data: body });

    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await expect(page.getByText("Histórico (1 toque)")).toBeVisible();
  });

  test("16. remove um toque do histórico", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const contactId = await firstContactId(page);
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: { leadSourceId: source.id },
    });
    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await page.getByRole("button", { name: "Remover toque" }).click();
    await page.getByRole("button", { name: "Remover", exact: true }).click();
    await expect(page.getByText("Origem não registrada.")).toBeVisible();
  });

  test("17. zero métricas de mídia na aba Origem", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const contactId = await firstContactId(page);
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: { leadSourceId: source.id, utmSource: "instagram" },
    });
    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await page.waitForLoadState("networkidle");
    await expectNoMediaMetrics(page, "a aba Origem do contato");
  });

  test("18. campanha arquivada não é oferecida para vínculo novo", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const campaign = await createCampaign(page, uniq(" camp"));
    await page.request.post(`/api/marketing/campaigns/${campaign.id}/archive`);
    const contactId = await firstContactId(page);

    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await page.getByRole("button", { name: "Registrar origem" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Origem").click();
    await page.getByRole("option", { name: source.name, exact: true }).click();
    await modal.getByLabel("Campanha").click();
    await expect(page.getByRole("option", { name: campaign.name, exact: true })).toHaveCount(0);
  });

  test("19. o vínculo sobrevive ao arquivamento da campanha", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const campaign = await createCampaign(page, uniq(" camp"));
    const contactId = await firstContactId(page);
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: { leadSourceId: source.id, campaignId: campaign.id },
    });
    await page.request.post(`/api/marketing/campaigns/${campaign.id}/archive`);

    await page.goto(`/contacts/${contactId}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    // o histórico continua mostrando a campanha, sinalizada como arquivada
    // (o nome aparece no card de primeiro toque e no card do touchpoint)
    await expect(page.getByText(campaign.name).first()).toBeVisible();
    await expect(page.getByText("Arquivada").first()).toBeVisible();
  });
});

test.describe("Leads da campanha (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  test("20. campanha sem leads mostra estado vazio honesto", async ({ page }) => {
    const campaign = await createCampaign(page, uniq(" camp"));
    await page.goto(`/campaigns/${campaign.id}`);
    await expect(page.getByText("Nenhum lead atribuído a esta campanha.")).toBeVisible();
  });

  test("21. mostra os leads e a contagem de CONTATOS distintos", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const campaign = await createCampaign(page, uniq(" camp"));
    const contactId = await firstContactId(page);
    // dois toques do MESMO contato: 2 toques, 1 contato
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: {
        leadSourceId: source.id,
        campaignId: campaign.id,
        capturedAt: "2026-08-01T10:00:00.000Z",
      },
    });
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: {
        leadSourceId: source.id,
        campaignId: campaign.id,
        capturedAt: "2026-08-02T10:00:00.000Z",
      },
    });

    await page.goto(`/campaigns/${campaign.id}`);
    await expect(page.getByText("Leads atribuídos")).toBeVisible();
    await expect(page.getByText("1 contato", { exact: true })).toBeVisible();
  });

  test("22. zero métricas de mídia no detalhe da campanha", async ({ page }) => {
    const source = await createSource(page, { name: uniq() });
    const campaign = await createCampaign(page, uniq(" camp"));
    const contactId = await firstContactId(page);
    await page.request.post(`/api/crm/contacts/${contactId}/attributions`, {
      data: { leadSourceId: source.id, campaignId: campaign.id },
    });
    await page.goto(`/campaigns/${campaign.id}`);
    await page.waitForLoadState("networkidle");
    await expectNoMediaMetrics(page, "o detalhe da campanha");
  });
});

test.describe("UTM Builder", () => {
  test("23. gera a URL final, sem Preview e sem histórico falso", async ({ page }) => {
    await page.goto("/utm-builder");
    await expect(page.getByText("Preview — disponível em breve.")).toHaveCount(0);
    // o histórico mockado saiu
    await expect(page.getByText("Histórico recente")).toHaveCount(0);

    await page.getByLabel("URL de destino").fill("https://site.com/promo");
    await page.getByLabel("Source").fill("Instagram");
    await page.getByLabel("Medium").fill("Stories");
    await page.getByLabel("Campaign").fill("Black Week");
    await expect(page.getByLabel("URL gerada")).toHaveText(
      "https://site.com/promo?utm_source=instagram&utm_medium=stories&utm_campaign=black-week",
    );
  });

  test("24. deixa claro que não rastreia cliques nem salva o link", async ({ page }) => {
    await page.goto("/utm-builder");
    await expect(page.getByText(/não rastreia cliques/i)).toBeVisible();
    await expect(page.getByText(/não salva os links/i)).toBeVisible();
  });

  test("25. URL base inválida não gera link", async ({ page }) => {
    await page.goto("/utm-builder");
    await page.getByLabel("URL de destino").fill("nao-e-url");
    await expect(page.getByText(/informe uma url http\(s\) completa/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Copiar link" })).toBeDisabled();
  });

  test("26. preserva a query que já existe na URL base", async ({ page }) => {
    await page.goto("/utm-builder");
    await page.getByLabel("URL de destino").fill("https://site.com/promo?plano=anual");
    await page.getByLabel("Source").fill("google");
    const url = await page.getByLabel("URL gerada").innerText();
    expect(url).toContain("plano=anual");
    expect(url).toContain("utm_source=google");
  });
});

test.describe("Layout e Preview das demais telas", () => {
  test("27. as telas novas não têm overflow nem erro (desktop e mobile)", async ({ page }) => {
    const errors = trackErrors(page);
    const contactId = await firstContactId(page);
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      for (const route of ["/lead-sources", "/utm-builder", `/contacts/${contactId}`]) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(await hasHorizontalOverflow(page), `overflow em ${route} @ ${size.width}`).toBe(
          false,
        );
        const slug = route.startsWith("/contacts") ? "contact" : route.slice(1);
        const label = size.width === 1440 ? "desktop" : "mobile";
        await page.screenshot({ path: `e2e/screenshots/${slug}-${label}.png`, fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });

  test("28. as telas fora do escopo continuam Preview", async ({ page }) => {
    for (const route of [
      "/performance",
      "/meta-ads",
      "/google-ads",
      "/tiktok-ads",
      "/landing-pages",
      "/forms",
      "/tracking",
      "/affiliates",
      "/commissions",
    ]) {
      await page.goto(route);
      await expect(
        page.getByText("Preview — disponível em breve.").first(),
        `${route} deveria continuar Preview`,
      ).toBeVisible();
    }
  });
});

test.describe("RBAC real", () => {
  test.use({ storageState: EMPTY_STATE });

  test("29. VIEWER lê o catálogo mas não gerencia", async ({ page }) => {
    await loginAs(page, "viewer@foguetao.dev");
    await page.goto("/lead-sources");
    await expect(page.getByRole("heading", { level: 1, name: "Origens de lead" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova origem" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Editar / })).toHaveCount(0);
  });

  test("30. VIEWER lê a origem do contato mas não registra", async ({ page }) => {
    await loginAs(page, "viewer@foguetao.dev");
    const res = await page.request.get("/api/crm/contacts?limit=1");
    const body = (await res.json()) as { items: { id: string }[] };
    await page.goto(`/contacts/${body.items[0].id}`);
    await page.getByRole("tab", { name: "Origem" }).click();
    await expect(page.getByRole("button", { name: /Registrar/ })).toHaveCount(0);
  });
});
