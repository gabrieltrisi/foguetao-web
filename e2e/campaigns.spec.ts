import { test, expect, type Page } from "@playwright/test";

/**
 * Campanhas — Sprint 1.5A-1 Etapa 2. Backend REAL (/campaigns + 6 ações).
 *
 * Nenhuma métrica de mídia existe no contrato (spent, leads, CPL, CPC, CPM,
 * conversões, receita, ROAS, ROI, CTR, alcance, frequência), então nenhuma
 * pode aparecer na tela — há um cenário dedicado a provar isso.
 */
const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const PREFIX = "E2E Camp";

function name(suffix = "") {
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

/**
 * KPIs de mídia que o contrato NÃO fornece. Casados com limite de palavra e
 * apenas dentro de <main> — a navegação lateral cita outros módulos, e
 * "Geração de leads" é o rótulo REAL do objetivo, não uma métrica.
 */
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
  "conversões",
  "receita",
  "alcance",
  "frequência",
  "leads gerados",
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

/** Cria via API real do BFF — o form tem cenário próprio. */
async function createCampaign(page: Page, body: Record<string, unknown>) {
  const res = await page.request.post("/api/marketing/campaigns", { data: body });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as { id: string; name: string; status: string };
}

async function act(page: Page, id: string, action: string) {
  const res = await page.request.post(`/api/marketing/campaigns/${id}/${action}`);
  expect(res.ok(), await res.text()).toBe(true);
  return res;
}

/** Remove as campanhas do spec para não poluir listagens de outras suítes. */
async function purge(page: Page) {
  const res = await page.request.get(
    `/api/marketing/campaigns?limit=100&search=${encodeURIComponent(PREFIX)}`,
  );
  if (!res.ok()) return;
  const body = (await res.json()) as { items: { id: string; name: string }[] };
  for (const c of body.items.filter((x) => x.name.startsWith(PREFIX))) {
    await page.request.delete(`/api/marketing/campaigns/${c.id}`);
  }
}

test.describe("Campanhas — dados reais (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purge(page);
  });

  /* ---------- 1. Listagem ---------- */

  test("1. lista campanhas reais vindas do backend", async ({ page }) => {
    const c = await createCampaign(page, { name: name(), channel: "META_ADS" });
    await page.goto("/campaigns");
    await expect(page.getByRole("heading", { level: 1, name: "Campanhas" })).toBeVisible();
    await expect(page.getByRole("link", { name: c.name })).toBeVisible();
  });

  test("2. a lista consome o BFF de campanhas (browser nunca fala com o backend)", async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on("request", (r) => urls.push(r.url()));
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    expect(urls.some((u) => u.includes("/api/marketing/campaigns"))).toBe(true);
    // nenhuma chamada direta ao backend (porta 3000)
    expect(urls.filter((u) => u.includes(":3000/api/v1"))).toEqual([]);
  });

  test("3. /campaigns NÃO exibe banner de Preview", async ({ page }) => {
    await page.goto("/campaigns");
    await expect(page.getByText("Preview — disponível em breve.")).toHaveCount(0);
  });

  test("4. zero métricas de mídia na listagem", async ({ page }) => {
    await createCampaign(page, { name: name(), budget: "1500.00" });
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await expectNoMediaMetrics(page, "a listagem");
  });

  test("5. filtra por status", async ({ page }) => {
    const draft = await createCampaign(page, { name: name(" draft") });
    const active = await createCampaign(page, { name: name(" active") });
    await act(page, active.id, "activate");
    await page.goto("/campaigns");
    await page.getByRole("button", { name: "Todos os status" }).click();
    await page.getByRole("option", { name: "Ativa", exact: true }).click();
    await expect(page.getByRole("link", { name: active.name })).toBeVisible();
    await expect(page.getByRole("link", { name: draft.name })).toHaveCount(0);
  });

  test("6. filtra por canal", async ({ page }) => {
    const meta = await createCampaign(page, { name: name(" meta"), channel: "META_ADS" });
    const internal = await createCampaign(page, { name: name(" int"), channel: "INTERNAL" });
    await page.goto("/campaigns");
    await page.getByRole("button", { name: "Todos os canais" }).click();
    await page.getByRole("option", { name: "Meta Ads", exact: true }).click();
    await expect(page.getByRole("link", { name: meta.name })).toBeVisible();
    await expect(page.getByRole("link", { name: internal.name })).toHaveCount(0);
  });

  test("7. filtra por objetivo", async ({ page }) => {
    const sales = await createCampaign(page, { name: name(" sales"), objective: "SALES" });
    const leadgen = await createCampaign(page, { name: name(" lead") });
    await page.goto("/campaigns");
    await page.getByRole("button", { name: "Todos os objetivos" }).click();
    await page.getByRole("option", { name: "Vendas", exact: true }).click();
    await expect(page.getByRole("link", { name: sales.name })).toBeVisible();
    await expect(page.getByRole("link", { name: leadgen.name })).toHaveCount(0);
  });

  test("8. busca por nome", async ({ page }) => {
    const target = await createCampaign(page, { name: `${PREFIX} Zebra ${Date.now()}` });
    const other = await createCampaign(page, { name: `${PREFIX} Girafa ${Date.now()}` });
    await page.goto("/campaigns");
    await page.getByPlaceholder("Buscar campanhas…").fill("Zebra");
    await expect(page.getByRole("link", { name: target.name })).toBeVisible();
    await expect(page.getByRole("link", { name: other.name })).toHaveCount(0);
  });

  test("9. filtro ativo aparece e pode ser limpo", async ({ page }) => {
    await page.goto("/campaigns");
    await page.getByRole("button", { name: "Todos os status" }).click();
    await page.getByRole("option", { name: "Rascunho", exact: true }).click();
    await expect(page.getByText("Rascunho").first()).toBeVisible();
    await page.getByRole("button", { name: /limpar/i }).click();
    await expect(page.getByRole("button", { name: "Todos os status" })).toBeVisible();
  });

  test("10. alterna para a visão de cards sem métricas", async ({ page }) => {
    await createCampaign(page, { name: name(), budget: "900.00" });
    await page.goto("/campaigns");
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("tab", { name: "Cards" }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("roas");
    expect(body).not.toContain("investido");
  });

  test("11. estado vazio quando nada casa com a busca", async ({ page }) => {
    await page.goto("/campaigns");
    await page.getByPlaceholder("Buscar campanhas…").fill("zzz-nao-existe-zzz");
    await expect(page.getByText("Nenhuma campanha encontrada.").first()).toBeVisible();
  });

  test("12. backend indisponível mostra erro, não tela quebrada", async ({ page }) => {
    await page.route("**/api/marketing/campaigns?**", (r) =>
      r.fulfill({ status: 503, body: "{}" }),
    );
    await page.goto("/campaigns");
    await expect(page.getByText("Não foi possível carregar as campanhas.")).toBeVisible();
  });

  /* ---------- 2. Criação ---------- */

  test("13. cria campanha pelo form real e ela nasce como rascunho", async ({ page }) => {
    const n = name();
    await page.goto("/campaigns/new");
    await page.getByLabel("Nome").fill(n);
    await page.getByLabel("Descrição").fill("Criada pelo e2e");
    await page.getByLabel("Orçamento").fill("1500.00");
    await page.getByRole("button", { name: "Salvar campanha" }).click();
    await page.waitForURL(/\/campaigns\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { level: 1, name: n })).toBeVisible();
    await expect(page.getByText("Rascunho").first()).toBeVisible();
  });

  test("14. o form NÃO exibe Preview nem campos fora do contrato", async ({ page }) => {
    await page.goto("/campaigns/new");
    await expect(page.getByText("Preview — disponível em breve.")).toHaveCount(0);
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("metadata");
    expect(body).not.toContain("versão");
    expect(body).not.toContain("status"); // status não é editável no form
  });

  test("15. orçamento inválido é barrado no cliente", async ({ page }) => {
    await page.goto("/campaigns/new");
    await page.getByLabel("Nome").fill(name());
    await page.getByLabel("Orçamento").fill("10,50");
    await expect(page.getByText(/2 casas decimais/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar campanha" })).toBeDisabled();
  });

  test("16. datas incoerentes são barradas antes de salvar", async ({ page }) => {
    await page.goto("/campaigns/new");
    await page.getByLabel("Nome").fill(name());
    await page.getByLabel("Início").fill("2026-08-31");
    await page.getByLabel("Término").fill("2026-08-01");
    await expect(page.getByText(/não pode ser anterior/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar campanha" })).toBeDisabled();
  });

  test("17. nome é obrigatório", async ({ page }) => {
    await page.goto("/campaigns/new");
    await expect(page.getByRole("button", { name: "Salvar campanha" })).toBeDisabled();
  });

  test("18. o orçamento vai como string decimal para o BFF (nunca float)", async ({ page }) => {
    let sent: string | null = null;
    page.on("request", (r) => {
      if (r.method() === "POST" && r.url().includes("/api/marketing/campaigns")) {
        sent = r.postData();
      }
    });
    await page.goto("/campaigns/new");
    await page.getByLabel("Nome").fill(name());
    await page.getByLabel("Orçamento").fill("1500.00");
    await page.getByRole("button", { name: "Salvar campanha" }).click();
    await page.waitForURL(/\/campaigns\/[0-9a-f-]{36}$/);
    expect(sent).toContain('"budget":"1500.00"');
  });

  /* ---------- 3. Detalhe e máquina de estados ---------- */

  test("19. detalhe exibe apenas campos do contrato", async ({ page }) => {
    const c = await createCampaign(page, {
      name: name(),
      budget: "2500.00",
      channel: "WHATSAPP",
      objective: "SALES",
    });
    await page.goto(`/campaigns/${c.id}`);
    await expect(page.getByRole("heading", { level: 1, name: c.name })).toBeVisible();
    await expect(page.getByText("R$ 2.500,00")).toBeVisible();
    await expect(page.getByText("WhatsApp").first()).toBeVisible();
    await expect(page.getByText("Vendas").first()).toBeVisible();
  });

  test("20. zero métricas de mídia no detalhe", async ({ page }) => {
    const c = await createCampaign(page, { name: name(), budget: "2500.00" });
    await page.goto(`/campaigns/${c.id}`);
    await page.waitForLoadState("networkidle");
    await expectNoMediaMetrics(page, "o detalhe");
  });

  test("21. rascunho oferece ativar/cancelar/arquivar — nunca pausar ou concluir", async ({
    page,
  }) => {
    const c = await createCampaign(page, { name: name() });
    await page.goto(`/campaigns/${c.id}`);
    await expect(page.getByRole("button", { name: "Ativar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Arquivar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pausar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Concluir" })).toHaveCount(0);
  });

  test("22. ativa a campanha e o status muda de verdade", async ({ page }) => {
    const c = await createCampaign(page, { name: name() });
    await page.goto(`/campaigns/${c.id}`);
    await page.getByRole("button", { name: "Ativar" }).click();
    await expect(page.getByText("Ativa").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  });

  test("23. pausa e reativa", async ({ page }) => {
    const c = await createCampaign(page, { name: name() });
    await act(page, c.id, "activate");
    await page.goto(`/campaigns/${c.id}`);
    await page.getByRole("button", { name: "Pausar" }).click();
    await expect(page.getByText("Pausada").first()).toBeVisible();
    await page.getByRole("button", { name: "Ativar" }).click();
    await expect(page.getByText("Ativa").first()).toBeVisible();
  });

  test("24. conclui a campanha e só resta arquivar", async ({ page }) => {
    const c = await createCampaign(page, { name: name() });
    await act(page, c.id, "activate");
    await page.goto(`/campaigns/${c.id}`);
    await page.getByRole("button", { name: "Concluir" }).click();
    await expect(page.getByText("Concluída").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Arquivar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ativar" })).toHaveCount(0);
  });

  test("25. arquivada é somente leitura: sem editar, só restaurar", async ({ page }) => {
    const c = await createCampaign(page, { name: name() });
    await act(page, c.id, "archive");
    await page.goto(`/campaigns/${c.id}`);
    await expect(page.getByText("Arquivada").first()).toBeVisible();
    await expect(page.getByText(/somente leitura/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Restaurar" })).toBeVisible();
  });

  test("26. restaurar sempre volta para rascunho", async ({ page }) => {
    const c = await createCampaign(page, { name: name() });
    await act(page, c.id, "activate");
    await act(page, c.id, "complete");
    await act(page, c.id, "archive");
    await page.goto(`/campaigns/${c.id}`);
    await page.getByRole("button", { name: "Restaurar" }).click();
    await expect(page.getByText("Rascunho").first()).toBeVisible();
  });

  test("27. o backend é a autoridade: transição inválida vira mensagem, não tela quebrada", async ({
    page,
  }) => {
    const c = await createCampaign(page, { name: name() });
    await page.goto(`/campaigns/${c.id}`);
    // a UI já carregou o rascunho e oferece "Ativar"...
    await expect(page.getByRole("button", { name: "Ativar" })).toBeVisible();
    // ...e então outra sessão arquiva a campanha por trás da UI
    await act(page, c.id, "archive");
    await page.getByRole("button", { name: "Ativar" }).click();
    // a mensagem é a REAL do backend (409 CAMPAIGN_STATUS_TRANSITION_INVALID)
    await expect(
      page.getByText(/transição inválida|não é permitida|arquivada/i).first(),
    ).toBeVisible();
  });

  test("28. campanha inexistente mostra 'não encontrada'", async ({ page }) => {
    await page.goto("/campaigns/3f2504e0-4f89-41d3-9a0c-0305e82c3301");
    await expect(page.getByText("Campanha não encontrada.")).toBeVisible();
  });

  /* ---------- 4. Edição ---------- */

  test("29. edita a campanha e o dado real muda", async ({ page }) => {
    const c = await createCampaign(page, { name: name(), budget: "100.00" });
    const novo = `${c.name} editada`;
    await page.goto(`/campaigns/${c.id}/edit`);
    await page.getByLabel("Nome").fill(novo);
    await page.getByLabel("Orçamento").fill("2000.00");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await page.waitForURL(`**/campaigns/${c.id}`);
    await expect(page.getByRole("heading", { level: 1, name: novo })).toBeVisible();
    await expect(page.getByText("R$ 2.000,00")).toBeVisible();
  });

  /* ---------- 5. Exclusão ---------- */

  test("30. exclui a campanha e ela some da listagem", async ({ page }) => {
    const c = await createCampaign(page, { name: name() });
    await page.goto(`/campaigns/${c.id}`);
    await page.getByRole("button", { name: "Excluir campanha" }).click();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();
    await page.waitForURL("**/campaigns");
    await expect(page.getByRole("link", { name: c.name })).toHaveCount(0);
  });

  /* ---------- 6. Layout ---------- */

  test("31. as três rotas não têm overflow nem erro de console (desktop e mobile)", async ({
    page,
  }) => {
    const c = await createCampaign(page, { name: name() });
    const errors = trackErrors(page);
    for (const size of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const label = size.width === 1440 ? "desktop" : "mobile";
      await page.setViewportSize(size);
      for (const route of ["/campaigns", "/campaigns/new", `/campaigns/${c.id}`]) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(await hasHorizontalOverflow(page), `overflow em ${route} @ ${size.width}`).toBe(
          false,
        );
        const slug = route === `/campaigns/${c.id}` ? "detail" : route.slice(1).replace("/", "-");
        await page.screenshot({ path: `e2e/screenshots/${slug}-${label}.png`, fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
});

test.describe("Campanhas — RBAC real", () => {
  test.use({ storageState: EMPTY_STATE });

  test("32. VIEWER lê mas não cria nem age", async ({ page }) => {
    await loginAs(page, "viewer@foguetao.dev");
    await page.goto("/campaigns");
    await expect(page.getByRole("heading", { level: 1, name: "Campanhas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nova campanha" })).toHaveCount(0);
    await page.goto("/campaigns/new");
    await expect(page.getByText(/não tem permissão para criar/i)).toBeVisible();
  });
});
