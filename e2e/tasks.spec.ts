import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const VIEWER = { email: "viewer@foguetao.dev", password: "Str0ng!Passw0rd" };
const TASK_RE = /\/tasks\/[0-9a-f-]{36}/;
const OWNER_NAME = "Owner Dev";

/** Combobox solto (filtros): o nome acessível vem do texto do gatilho. */
async function pickOption(page: Page, trigger: string | RegExp, option: string | RegExp) {
  await page.getByRole("button", { name: trigger }).click();
  await page.getByRole("option", { name: option }).click();
}

/** Combobox dentro de um FormField: o <label> associado é o nome acessível. */
async function pickField(page: Page, label: string, option: string | RegExp) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option }).click();
}

async function createTask(page: Page, title: string, opts: { deal?: string; due?: string } = {}) {
  await page.goto("/tasks/new");
  await page.getByRole("textbox", { name: "Título", exact: true }).fill(title);
  await pickField(page, "Responsável", OWNER_NAME);
  if (opts.due) await page.getByLabel("Prazo").fill(opts.due);
  if (opts.deal) await pickField(page, "Oportunidade", opts.deal);
  await page.getByRole("button", { name: "Criar tarefa" }).click();
  await page.waitForURL(TASK_RE);
}

test.describe("Tarefas — listagem (owner)", () => {
  test("lista tarefas reais do backend", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.getByRole("heading", { level: 1, name: "Tarefas" })).toBeVisible();
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
    // responsável real, resolvido pelo mapa de membros (não por fetch por linha)
    await expect(page.getByText(OWNER_NAME).first()).toBeVisible();
  });

  test("a listagem não faz uma requisição por tarefa (sem N+1)", async ({ page }) => {
    const detailCalls: string[] = [];
    page.on("request", (r) => {
      if (/\/api\/crm\/tasks\/[0-9a-f-]{36}/.test(r.url())) detailCalls.push(r.url());
    });
    await page.goto("/tasks");
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(detailCalls).toEqual([]);
  });

  test("filtra por status", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.locator("tbody tr").first()).toBeVisible();

    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/crm/tasks?")) requests.push(r.url());
    });

    await pickOption(page, "Todos os status", "Concluída");
    await expect.poll(() => requests.some((u) => u.includes("status=COMPLETED"))).toBe(true);
  });

  test("filtra por prioridade", async ({ page }) => {
    await page.goto("/tasks");
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/crm/tasks?")) requests.push(r.url());
    });
    await pickOption(page, "Todas as prioridades", "Urgente");
    await expect.poll(() => requests.some((u) => u.includes("priority=URGENT"))).toBe(true);
  });

  test("busca com debounce e volta para a página 1", async ({ page }) => {
    await page.goto("/tasks");
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/crm/tasks?")) requests.push(r.url());
    });

    await page.getByPlaceholder("Buscar tarefas…").fill("Tarefa 100");
    await expect.poll(() => requests.filter((u) => u.includes("search=")).length).toBeGreaterThan(0);
    // debounce: uma digitação inteira não gera uma requisição por tecla
    expect(requests.filter((u) => u.includes("search=")).length).toBeLessThan(5);
    expect(requests.filter((u) => u.includes("search=")).every((u) => u.includes("page=1"))).toBe(true);
  });

  test("filtro de atrasadas usa o contrato do backend e marca a tarefa", async ({ page }) => {
    await page.goto("/tasks");
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/crm/tasks?")) requests.push(r.url());
    });

    await pickOption(page, "Todos os prazos", "Somente atrasadas");
    await expect.poll(() => requests.some((u) => u.includes("overdue=true"))).toBe(true);
    await expect(page.getByText("Atrasada").first()).toBeVisible();
  });

  test("Kanban agrupa por status sem novas requisições por card", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.locator("tbody tr").first()).toBeVisible();

    const detailCalls: string[] = [];
    page.on("request", (r) => {
      if (/\/api\/crm\/tasks\/[0-9a-f-]{36}/.test(r.url())) detailCalls.push(r.url());
    });

    await page.getByRole("tab", { name: "Kanban" }).click();
    await expect(page.getByRole("region", { name: "Em andamento" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Pendente" })).toBeVisible();
    expect(detailCalls).toEqual([]);
  });

  test("Calendário mostra o mês corrente", async ({ page }) => {
    await page.goto("/tasks");
    await page.getByRole("tab", { name: "Calendário" }).click();
    const now = new Date();
    const month = now.toLocaleString("pt-BR", { month: "long" });
    const label = new RegExp(`${month[0].toUpperCase()}${month.slice(1)} de ${now.getFullYear()}`, "i");
    await expect(page.getByText(label)).toBeVisible();
  });
});

test.describe("Tarefas — criação e responsável (owner)", () => {
  test("cria tarefa com responsável real e abre o detalhe", async ({ page }) => {
    const title = `E2E Tarefa ${Date.now()}`;
    await createTask(page, title);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText(OWNER_NAME).first()).toBeVisible();
    await expect(page.getByText("Pendente").first()).toBeVisible();
  });

  test("o seletor de responsável só oferece papéis elegíveis (VIEWER fora)", async ({ page }) => {
    await page.goto("/tasks/new");
    await page.getByRole("button", { name: "Responsável", exact: true }).click();
    await expect(page.getByRole("option", { name: OWNER_NAME })).toBeVisible();
    await expect(page.getByRole("option", { name: "Commercial Dev" })).toBeVisible();
    // VIEWER não pode receber tarefas (AssigneePolicy) — nem aparece
    await expect(page.getByRole("option", { name: "Viewer Dev" })).toHaveCount(0);
  });

  test("criar exige responsável", async ({ page }) => {
    await page.goto("/tasks/new");
    await page.getByRole("textbox", { name: "Título", exact: true }).fill("Sem responsável");
    await expect(page.getByRole("button", { name: "Criar tarefa" })).toBeDisabled();
  });

  test("prazo informado não desloca o dia (fuso local preservado)", async ({ page }) => {
    const title = `E2E Prazo ${Date.now()}`;
    // 00:30 local: uma conversão UTC ingênua jogaria para o dia seguinte
    await createTask(page, title, { due: "2026-12-01T00:30" });
    await expect(page.getByText(/01 de dez\.? de 2026, 00:30/i).first()).toBeVisible();

    await page.getByRole("link", { name: "Editar" }).click();
    await expect(page.getByLabel("Prazo")).toHaveValue("2026-12-01T00:30");
  });

  test("reatribui o responsável (POST /assign)", async ({ page }) => {
    const title = `E2E Assign ${Date.now()}`;
    await createTask(page, title);

    await pickOption(page, "Reatribuir para…", "Commercial Dev");
    await page.getByRole("button", { name: "Atribuir" }).click();
    await expect(page.getByText("Responsável atualizado")).toBeVisible();
    await expect(page.getByText("Commercial Dev").first()).toBeVisible();
  });
});

test.describe("Tarefas — ações (owner)", () => {
  test("concluir e reabrir", async ({ page }) => {
    const title = `E2E Ciclo ${Date.now()}`;
    await createTask(page, title);

    await page.getByRole("button", { name: "Concluir" }).click();
    await expect(page.getByText("Tarefa concluída").first()).toBeVisible();
    await expect(page.getByText("Concluída").first()).toBeVisible();
    // concluída não pode ser editada (o backend recusaria o PATCH)
    await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Concluir" })).toHaveCount(0);

    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Reabrir" }).click();
    await expect(page.getByText("Tarefa reaberta")).toBeVisible();
    await expect(page.getByRole("link", { name: "Editar" })).toBeVisible();
  });

  test("edita título e prioridade", async ({ page }) => {
    const title = `E2E Edit ${Date.now()}`;
    await createTask(page, title);

    await page.getByRole("link", { name: "Editar" }).click();
    await page.getByRole("textbox", { name: "Título", exact: true }).fill(`${title} atualizado`);
    await pickField(page, "Prioridade", "Urgente");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await page.waitForURL(TASK_RE);
    await expect(page.getByRole("heading", { level: 1, name: `${title} atualizado` })).toBeVisible();
    await expect(page.getByText("Urgente").first()).toBeVisible();
  });

  test("exclui a tarefa e volta para a listagem", async ({ page }) => {
    const title = `E2E Delete ${Date.now()}`;
    await createTask(page, title);

    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Excluir tarefa" }).click();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();

    await page.waitForURL("**/tasks");
    await expect(page.getByText("Tarefa excluída")).toBeVisible();
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });

  test("vínculo com oportunidade leva ao deal real", async ({ page }) => {
    const dealTitle = `E2E Deal Task ${Date.now()}`;
    await page.goto("/deals/new");
    await page.getByRole("textbox", { name: "Título", exact: true }).fill(dealTitle);
    await page.getByRole("button", { name: "Criar oportunidade" }).click();
    await page.waitForURL(/\/deals\/[0-9a-f-]{36}/);

    await createTask(page, `E2E Vínculo ${Date.now()}`, { deal: dealTitle });
    await page.getByRole("link", { name: dealTitle }).click();
    await page.waitForURL(/\/deals\/[0-9a-f-]{36}/);
    await expect(page.getByRole("heading", { level: 1, name: dealTitle })).toBeVisible();
  });

  test("tarefa inexistente mostra não encontrada", async ({ page }) => {
    await page.goto("/tasks/00000000-0000-4000-8000-000000000000");
    await expect(page.getByText("Tarefa não encontrada.")).toBeVisible();
  });

  test("id inválido é barrado no BFF, sem chegar ao backend", async ({ page }) => {
    const res = await page.request.get("/api/crm/tasks/task-1");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("filtro inválido é barrado no BFF", async ({ page }) => {
    const res = await page.request.get("/api/crm/tasks?sortBy=title");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });
});

test.describe("Tarefas — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer lê mas não vê ações de escrita", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VIEWER.email);
    await page.getByLabel("Senha", { exact: true }).fill(VIEWER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/tasks");
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Nova tarefa" })).toHaveCount(0);

    await page.locator("tbody tr").first().getByRole("link").first().click();
    await page.waitForURL(TASK_RE);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Concluir" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mais ações" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Atribuir" })).toHaveCount(0);
  });
});
