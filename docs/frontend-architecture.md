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

## Camada de dados (mocks)

Todos os dados vêm de [`src/mocks`](../src/mocks):

- `dashboard.ts` — métricas, funil, KPIs, atividades, tarefas, conversas, períodos.
- `account.ts` — usuário atual, empresas (workspaces), credenciais de demonstração.
- `landing.ts` — features e pilares da landing.

Formatação pt-BR centralizada em [`src/lib/format.ts`](../src/lib/format.ts). Tipos de domínio em
[`src/types`](../src/types).

Regra: **valores não são espalhados** em componentes — sempre importados dos mocks.

## Formulários e validação

React Hook Form + Zod. O schema de login vive em
[`src/lib/validations/auth.ts`](../src/lib/validations/auth.ts). O `LoginForm` cobre os estados
`idle`, `loading`, erro de validação, credenciais inválidas (mock) e sucesso (redireciona para
`/dashboard`). Sem chamada de rede real.

## Futura camada de API

1. Criar `src/lib/api/` (cliente HTTP + funções tipadas reaproveitando `src/types`).
2. Mover o data fetching para os Server Components do grupo `(app)` (ou adotar React Query).
3. Substituir imports de `@/mocks/*` pelas funções de API.

## Futura autenticação

1. Trocar o `onSubmit` do `LoginForm` por autenticação real; sessão em cookies httpOnly.
2. Proteger o grupo `(app)` via middleware/`proxy` (Next 16) com redirecionamento para `/login`.
3. Popular usuário/empresas a partir da sessão (hoje em `src/mocks/account.ts`).

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
