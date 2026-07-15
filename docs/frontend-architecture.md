# Arquitetura de Frontend — Foguetão Web

## App Router (Next.js 16)

Rotas organizadas em dois **route groups** (não afetam a URL):

- `src/app/(public)` — landing (`/`) e login (`/login`). Sem AppShell.
- `src/app/(app)` — área autenticada. `layout.tsx` envolve tudo no `SidebarProvider` + `AppShell`.

O **root layout** (`src/app/layout.tsx`) carrega as fontes (`next/font`: Sora + Inter), define a
metadata base/SEO e monta o `ToastProvider`.

Turbopack é o bundler padrão (dev e build). Não há configuração de webpack.

## Layouts e shell

- [`AppShell`](../src/components/layout/app-shell.tsx): grid `sidebar + (header + main)`, altura
  `100dvh`, conteúdo rolável com `max-w-7xl`.
- [`Sidebar`](../src/components/layout/sidebar.tsx): desktop, expandida (256px) ou recolhida (68px).
- [`MobileDrawer`](../src/components/layout/mobile-drawer.tsx): Radix Dialog (focus trap, Escape,
  clique externo) para `< lg`.
- [`SidebarBody`](../src/components/layout/sidebar-body.tsx): navegação + rodapé, compartilhado
  entre sidebar e drawer.
- [`AppHeader`](../src/components/layout/app-header.tsx): menu, breadcrumb, busca global (Ctrl/⌘+K),
  seletor de empresa, `+ Criar`, notificações, avatar.

### Estado da sidebar

[`use-sidebar`](../src/hooks/use-sidebar.tsx) expõe `collapsed` (persistido em `localStorage` via
`useSyncExternalStore`, seguro para hidratação) e `mobileOpen`. O snapshot do servidor é sempre
"expandida", evitando mismatch de hidratação.

## Navegação

- [`config/nav.ts`](../src/config/nav.ts): grupos e itens da sidebar (rótulo, href, ícone Lucide,
  badge "Em breve", `disabled`).
- [`config/routes.ts`](../src/config/routes.ts): metadados por rota (título, descrição, empty state,
  ação) — usados pelos placeholders e pelo breadcrumb.
- [`RoutePlaceholder`](../src/components/layout/route-placeholder.tsx): renderiza `PageHeader` +
  `EmptyState` a partir de `routeMeta`.

## Camada de dados

O projeto está em migração de mocks para a API real, domínio a domínio.

**Domínios reais** (browser → BFF → backend, com Zod validando a resposta):
autenticação e contexto de empresa, CRM (contatos, organizações, pipelines,
oportunidades, kanban, tarefas) e **integrações**.

- contratos: [`src/types/api`](../src/types/api) — schemas Zod derivados dos DTOs reais;
- serviços server-only e clients: [`src/lib/api`](../src/lib/api);
- BFF: [`src/app/api`](../src/app/api) — `withCompany()`, `requireUuid`, validação de entrada;
- cache: [`src/lib/query/keys.ts`](../src/lib/query/keys.ts) (keys centralizadas + invalidação escopada).

**Ainda em mock** (`src/mocks`): marketing, automações, mensageria, analytics e o
restante da administração (equipe, papéis, API keys, segurança, marketplace).

Formatação pt-BR centralizada em [`src/lib/format.ts`](../src/lib/format.ts). Tipos de
mock em [`src/types`](../src/types); contratos reais em [`src/types/api`](../src/types/api).

Regra: nos domínios ainda mockados, **valores não são espalhados** em componentes —
sempre importados dos mocks.

## Formulários e validação

React Hook Form + Zod. O schema de login vive em
[`src/lib/validations/auth.ts`](../src/lib/validations/auth.ts). O `LoginForm` cobre os estados
`idle`, `loading`, erro de validação, credenciais inválidas e sucesso (redireciona para
`/dashboard`) — hoje contra a API real.

## Como migrar um domínio de mock para a API real

Roteiro já aplicado em CRM e integrações — repita na mesma ordem:

1. **Auditar o contrato real** no backend (controller, DTOs, service, enums,
   erros, guards). Não presuma pela documentação.
2. `src/types/api/<dominio>.ts` — schemas Zod a partir dos DTOs reais.
3. `src/lib/api/<dominio>/{service,client}.ts` — service server-only (`backendFetch`
   com `schema`) e client (`clientFetch` → BFF).
4. Handlers em `src/app/api/<dominio>/**` com `withCompany()`, `requireUuid` e
   parser de query dedicado em `src/lib/api/validation.ts`.
5. Query keys em `src/lib/query/keys.ts` + hooks com `enabled` checando permissão.
6. Trocar os componentes e **remover o mock**, junto com os tipos órfãos.
7. Testes unit (schemas, validações do BFF, cache, permissões) + e2e contra o
   backend real.

## Autenticação

Real: sessão em cookies httpOnly (`fg_at`, `fg_rt`, `fg_cid`), refresh deduplicado,
o grupo `(app)` protegido por `proxy.ts` (Next 16) e usuário/empresas/permissões
vindos de `SessionProvider` → `/api/session`.

## Acessibilidade

HTML semântico, labels associados, foco visível, navegação por teclado, `aria-label` em botões só
com ícone, drawer com focus trap (Radix), toggle de senha acessível, `aria-live` nos toasts,
suporte a `prefers-reduced-motion`.

## Testes

- **Vitest + Testing Library** ([`src/**/__tests__`](../src)): componentes base, navegação da
  sidebar, colapso, drawer, validação/redirect do login, metric cards, placeholders.
- **Playwright** ([`e2e/`](../e2e)): carregamento das telas, ausência de overflow horizontal nos 4
  viewports, colapso da sidebar, drawer mobile, fluxo de login e ausência de erros de console.

## SEO

Metadata base + Open Graph/Twitter no root; `title` por rota (template `%s · Foguetão`); `manifest`
via `src/app/manifest.ts`; favicon via `src/app/icon.svg`. Login e área `(app)` marcados como
`noindex`.
