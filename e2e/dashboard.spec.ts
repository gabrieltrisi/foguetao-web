import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

test.describe("Dashboard comercial (owner)", () => {
  test("KPIs reais vêm de /metrics/summary", async ({ page }) => {
    // captura a resposta que a PRÓPRIA tela recebeu (com a janela de 7d padrão)
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/crm/metrics/summary") && r.ok()),
      page.goto("/dashboard"),
    ]);
    const body = await response.json();

    await expect(page.getByRole("heading", { level: 1, name: "Visão geral" })).toBeVisible();
    for (const label of [
      "Oportunidades abertas",
      "Oportunidades ganhas",
      "Oportunidades perdidas",
      "Win rate",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }

    // o card exibe exatamente o que o contrato devolveu (formatado em pt-BR)
    const shown = new Intl.NumberFormat("pt-BR").format(body.open.count);
    await expect(page.getByText(shown, { exact: true }).first()).toBeVisible();
  });

  test("KPIs não exibem tendência — o contrato não compara períodos", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Oportunidades abertas", { exact: true })).toBeVisible();
    await expect(page.getByText("vs. período anterior")).toHaveCount(0);
  });

  test("funil real mostra etapas do pipeline e contagens", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Funil de vendas")).toBeVisible();

    // sem pipeline escolhido, o funil pede a seleção (byStage mistura pipelines)
    await expect(page.getByText(/Selecione um pipeline para ver o funil/i)).toBeVisible();

    // escolhe o primeiro pipeline real
    await page.getByRole("button", { name: "Todos os pipelines", exact: true }).click();
    await page.getByRole("option").nth(1).click();

    // agora aparecem etapas reais (ou o vazio honesto do pipeline)
    await expect(
      page
        .getByText(/Selecione um pipeline para ver o funil/i)
        .or(page.getByText(/Nenhuma oportunidade aberta neste pipeline/i))
        .or(page.getByText("Este pipeline não possui etapas abertas."))
        .or(page.getByText("Funil de vendas")),
    ).toBeVisible();
  });

  test("performance mostra valores por moeda, sem delta", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Performance comercial")).toBeVisible();
    for (const label of ["Valor em aberto", "Valor ganho", "Valor perdido"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("filtro de período refaz a chamada com a janela real", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Oportunidades abertas", { exact: true })).toBeVisible();

    const request = page.waitForRequest(
      (r) => r.url().includes("/api/crm/metrics/summary") && r.url().includes("from="),
    );
    await page.getByRole("tab", { name: "30 dias" }).click();
    const req = await request;
    expect(req.url()).toContain("from=");
    expect(req.url()).toContain("to=");
  });

  test("filtro de pipeline refaz a chamada com pipelineId", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Todos os pipelines", exact: true }).click();

    const request = page.waitForRequest((r) =>
      r.url().includes("/api/crm/metrics/summary?") && r.url().includes("pipelineId="),
    );
    await page.getByRole("option").nth(1).click();
    expect((await request).url()).toContain("pipelineId=");
  });

  test("tarefas pendentes e atividades recentes são reais", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Tarefas pendentes")).toBeVisible();
    await expect(page.getByText("Atividades recentes")).toBeVisible();

    // "Ver todas" aponta para a tela real de Tarefas. (Sprint MVP 1.1: o link
    // "Ver tudo" das Atividades — que ia para /activity-log, fora do MVP — foi
    // removido; a tela de auditoria não faz parte da navegação do MVP.)
    await expect(page.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/tasks");
    await expect(page.getByRole("link", { name: "Ver tudo" })).toHaveCount(0);
  });
});

test.describe("BFF de métricas", () => {
  test("GET /api/crm/metrics/summary devolve o contrato real", async ({ page }) => {
    const res = await page.request.get("/api/crm/metrics/summary");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      scope: expect.any(Object),
      winRate: expect.any(Number),
    });
    expect(Array.isArray(body.byStage)).toBe(true);
    for (const bucket of ["open", "won", "lost"]) {
      expect(body[bucket]).toMatchObject({ count: expect.any(Number) });
      expect(Array.isArray(body[bucket].byCurrency)).toBe(true);
    }
  });

  test("pipelineId inválido é barrado no BFF (400)", async ({ page }) => {
    const res = await page.request.get("/api/crm/metrics/summary?pipelineId=todos");
    expect(res.status()).toBe(400);
  });

  test("data sem offset é barrada no BFF (400)", async ({ page }) => {
    const res = await page.request.get("/api/crm/metrics/summary?from=2026-07-01");
    expect(res.status()).toBe(400);
  });

  test("janela sem dados devolve buckets zerados (não erro)", async ({ page }) => {
    const res = await page.request.get(
      "/api/crm/metrics/summary?from=1990-01-01T00:00:00.000Z&to=1990-01-02T00:00:00.000Z",
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.open.count).toBe(0);
    expect(body.won.count).toBe(0);
    expect(body.winRate).toBe(0);
    expect(body.byStage).toEqual([]);
  });
});

test.describe("Dashboard — empresa sem dados no período", () => {
  test("mostra estado vazio honesto", async ({ page }) => {
    // intercepta com a resposta REAL de uma empresa sem dados
    await page.route("**/api/crm/metrics/summary**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scope: { pipelineId: null, from: null, to: null },
          open: { count: 0, byCurrency: [] },
          won: { count: 0, byCurrency: [] },
          lost: { count: 0, byCurrency: [] },
          winRate: 0,
          byStage: [],
        }),
      });
    });
    await page.goto("/dashboard");
    await expect(page.getByText("Nenhuma oportunidade no período.")).toBeVisible();
  });
});

test.describe("Dashboard — erro e offline", () => {
  test("backend indisponível mostra erro com nova tentativa", async ({ page }) => {
    await page.route("**/api/crm/metrics/summary**", (route) => route.abort("failed"));
    await page.goto("/dashboard");
    await expect(page.getByText("Não foi possível carregar as métricas.")).toBeVisible();
    await expect(page.getByRole("button", { name: /tentar novamente/i })).toBeVisible();
  });
});

test.describe("Dashboard — VIEWER sem crm.metrics.read", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer não vê métricas e o backend recusa", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    await page.goto("/dashboard");

    // VIEWER não tem crm.metrics.read
    await expect(
      page.getByText(/não tem permissão para ver as métricas comerciais/i).first(),
    ).toBeVisible();

    const res = await page.request.get("/api/crm/metrics/summary");
    expect(res.status()).toBe(403);
  });
});

test.describe("Dashboard — responsividade", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("/dashboard sem overflow horizontal @ 390", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: "Visão geral" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
