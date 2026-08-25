# Notification Center — Frontend (Sprint F7.7)

Central de notificações do Foguetão (feature `src/features/notifications`). **Isolada
e aditiva**: não altera Inbox, Copilot, Topbar nem query keys existentes. Infraestrutura
pronta para o Topbar, mas **não montada no header** nesta sprint.

## Arquitetura (espelha os padrões reais)

- **Tipos + schemas Zod**: `src/types/api/notifications.ts` (validação defensiva das
  respostas). O backend nunca devolve `companyId`/`recipientUserId`.
- **BFF (browser nunca fala com o backend)**:
  - Client → BFF: `src/lib/api/notifications/client.ts` (`notificationsApi`, `clientFetch`).
  - Route handlers: `src/app/api/notifications/**` (`route()` + `withCompany`).
  - Server → backend: `src/lib/api/notifications/service.ts` (`"server-only"`,
    `backendFetch` + Zod). Tokens ficam em cookies httpOnly; header `x-company-id`
    injetado no servidor.
- **React Query (v5)**: `notificationKeys`/`notificationInvalidation`
  (`query-keys.ts`, root próprio `"notifications"`). Hooks anexam `activeCompanyId` à
  key; invalidação por prefixo. `useNotifications` (`useInfiniteQuery`, página → página),
  `useUnreadCount` (query INDEPENDENTE, `select` → número), mutações
  (`markRead/markAllRead/archive/delete`) que invalidam listas + contador.
- **Componentes** (`components/`): `NotificationBell` (Popover, auto-gate, badge, painel
  **lazy** via `next/dynamic`), `NotificationBadge`, `NotificationPanel` (cabeçalho +
  filtros + lista + estados), `NotificationList` (loading/erro/vazio + "carregar mais"),
  `NotificationCard` (`React.memo`; ícone/prioridade/tipo/título/mensagem/tempo/ações),
  `NotificationFilters` (Todas/Não lidas/Lidas/Arquivadas), `NotificationTypeIcon`.
- **Design System**: `Badge`, `Popover`, `EmptyState`, `ErrorState`, `Skeleton`, `cn` +
  tokens (`ink`, `line`, `brand`, `text-body2`). Prioridades: LOW cinza, NORMAL azul,
  HIGH laranja, URGENT vermelho.
- **Formatação**: `format.ts` (`formatNotificationTime(iso, now)` — puro, `now` injetado).

## Feature Flag

`NEXT_PUBLIC_ENABLE_NOTIFICATION_CENTER` (default off) em `src/lib/env.ts`. Off → o sino
não renderiza (self-gate em `NotificationBell`); nenhuma query sai. O header
(`app-header.tsx` / `notifications.tsx`) **não é alterado** — a integração ao Topbar é o
próximo passo.

## Segurança / RBAC

Todo hook gateia por `Boolean(activeCompanyId) && can("notifications.read") && flag`.
As ações de mutação só aparecem com `notifications.update`. O escopo por empresa/usuário
é garantido no backend (o BFF injeta `x-company-id`; o destinatário é o usuário da sessão).

## Performance

Paginação (page-based, `useInfiniteQuery`), contador independente, painel **lazy**,
`NotificationCard` memoizado, invalidação por prefixo (nunca blanket), `enabled` desliga
queries fora de contexto.

## Testes (Vitest)

`src/features/notifications/__tests__` (19): `format`, `presentation`, `use-notifications`
(gate/paginação/contador), `notification-card` (render/ações/permissão), `notification-bell`
(self-gate flag+permissão). Gates: typecheck + lint + 1127 testes + build.

## Como integrar ao Topbar (próximo passo — fora desta sprint)

Importar `NotificationBell` de `@/features/notifications` e montá-lo no cluster de ações
do `app-header.tsx` (substituindo/ao lado do `Notifications` atual). O sino já se
auto-gate na flag e na permissão.
