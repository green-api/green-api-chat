# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`sw-console-chat` — a chat module for personal WhatsApp/Telegram/MAX accounts built on [GREEN-API](https://green-api.com), embedded by parent apps as an iframe (or run standalone). Auth/config is handed in via `postMessage` or URL query params (see README.md for the full payload contract) — most of `src/components/layouts/base-layout.component.tsx` exists to parse and react to that handoff.

## Commands

```bash
npm run dev       # vite dev server, port 5174, host: true
npm run build      # tsc (typecheck) then vite build
npm run lint       # eslint vite-project --ext ts,tsx --max-warnings 0
npm run preview    # preview a production build
```

There is no test framework configured in this repo (no jest/vitest, no `*.test.*`/`*.spec.*` files).

## Architecture

### State: `src/store`

Single Redux store (`store/index.ts`, `setupStore`) wrapped in `redux-persist` via a custom `storageWithTimestamp` wrapper that expires persisted state after 3 minutes. Key slices under `store/slices/`:

- **`user.slice.ts`** — logged-in user (`login`, `apiTokenUser`, `idUser`, `projectId`) and `platform`.
- **`instances.slice.ts`** — the active GREEN-API instance: `selectedInstance`, `tariff`, `typeInstance` (`'whatsapp' | 'v3' | 'telegram'`, where `'v3'` = MAX), `instanceList`, auth/sending status flags. Hydrated from URL query params or `localStorage['selectedInstance']`.
- **`chat.slice.ts`** — active chat UI state, `type` (`ChatType`: tab/console-page/instance-view-page/partner-iframe/one-chat-only/mobile-mode), `isMiniVersion`, and a `lastMessagesByChatId` cache that's cleared whenever the selected instance changes.
- **`theme.slice.ts`** — current theme, seeded from localStorage/`prefers-color-scheme` (only when embedded in an iframe).
- Smaller UI slices: `message-menu.slice.ts`, `contacts-modal.slice.ts`, `qr-instruction.slice.ts`.

`store/actions/index.ts` merges every slice's actions into one `actionCreators` object consumed via an `useActions()` hook. `store/auth-middleware.ts` is a `createListenerMiddleware` that syncs cookies/session/localStorage whenever `login`/`logout`/`setSelectedInstance`/`setIsChatWorking` fire — this is what makes auth survive reloads and iframe re-init.

### API layer: `src/services`

Two separate RTK Query APIs, both wired into the store:

- **`services/app/app.service.ts`** (`appAPI`) — GREEN-API's own backend. Injects `Authorization: Bearer APP_API_TOKEN` and `x-ga-user-id`/`x-ga-user-token` from `userReducer`; auto-logs-out and redirects to `Routes.auth` on a 401 (unless embedded in an iframe). Endpoints under `services/app/endpoints/{auth,instances,profile}.app.endpoints.ts`.
- **`services/green-api/green-api.service.ts`** (`greenAPI`) — talks directly to the customer's own instance (`apiUrl`/`mediaUrl` come from the selected instance, not a fixed base URL). Has a custom `customQuery` `BaseQueryFn` that special-cases the `lastMessages` endpoint: fires `lastIncomingMessages`/`lastOutgoingMessages` in parallel and merges against cached data, with a different lookback window for mini-chat vs full-chat vs `partner-iframe`. Endpoints under `services/green-api/endpoints/*.green-api.endpoints.ts` (sending, receiving, account, group, journals, statuses, waba, service-methods, read-mark, persisted-methods).

There's no push channel for messages — new messages are picked up via **RTK Query polling** (`pollingInterval`) at several call sites (chat list, chat view, status history, MAX/Telegram auth). The one real WebSocket, `hooks/use-qr-websocket.hook.ts`, is only used for the QR-login flow, not message delivery.

### Entry, routing & auth handoff

`main.tsx` → `Provider`/`PersistGate`/`ErrorBoundary` → `App.tsx` (antd `ConfigProvider`, theme class on `<html>`) → `RouterProvider`. `src/router/index.tsx` is minimal: essentially one route (`Routes.main` → `pages/main.page.tsx`), rendered through `components/layouts/base-layout.component.tsx`.

`BaseLayout` is where auth actually gets applied: it listens for `window.addEventListener('message', ...)` and handles `MessageEventTypeEnum.INIT` / `SET_CREDENTIALS` / `LOCALE_CHANGE` / `SET_THEME`, and separately parses URL query params for the partner-iframe flow (`isPartnerChat`). If neither source provides credentials it throws `NO_INSTANCE_CREDENTIALS`. It posts `IFRAME_READY` to the parent on mount, and later posts `LOCALE_CHANGE` back whenever the resolved language changes.

`pages/main.page.tsx` picks the actual screen: sending-status screens (`isSendingStatus`) → instance auth (`isAuthorizingInstance`, branching to `MaxAuth`/`TelegramAuth`/`AuthInstance` via the hooks below) → `ContactChat` or `HomeView`. `BaseLayout` separately picks `MiniChat` vs `FullChat` based on `selectMiniVersion`.

### Components: full-chat vs mini-chat

`components/full-chat` and `components/mini-chat` are two independent top-level UI modes selected by `isMiniVersion`. `full-chat` composes `aside/` (instance/contact rail), `user-side/` (chat list, contacts, settings, WhatsApp Status), and `content-side/` (message thread — `contact-chat/` for an open conversation, `contact-info/` for the detail panel). `mini-chat` is a compact single-conversation widget that reuses `components/shared/` (chat-header, chat-list, group-contact-list, message) and `components/forms/` (chat-form, send-preview-form, buttons-form).

### Multi-platform (WhatsApp/Telegram/MAX)

Channel is modeled as `TypeInstance = 'whatsapp' | 'v3' | 'telegram'` (`'v3'` = MAX) in `instancesReducer.typeInstance` (`src/types/index.ts`), normalized from URL params / instance-settings responses via `getTypeInstanceFromQuery`. There is no polymorphic channel abstraction — behavior branches procedurally via `hooks/use-is-max-instance.ts` and `hooks/use-is-telegram-instance.ts`, used to pick auth components, switch request shapes (e.g. `chatId` vs `groupId` for group lookups), and gate queries.

### Theming & i18n

`configs/themes/{default,dark}-theme.config.ts` export antd `ThemeConfig` objects built on CSS custom properties from `src/styles/themes/{default,dark}.scss`. Theme can change at runtime via the `SET_THEME` postMessage. `src/i18n.ts` configures i18next (`i18next-http-backend` loading `/locales_{version}/{{lng}}/translation.json`, `i18next-browser-languagedetector`), `supportedLngs: ['en','ru','he','tr']`; language can also arrive via `INIT`/`LOCALE_CHANGE` postMessage or the `lng` query param.

## Conventions

- **Imports**: no `@/` alias — `tsconfig.json` sets `baseUrl: "./src"` only, so use bare root-relative imports (`'store'`, `'types'`, `'hooks'`, `'services/green-api/endpoints'`, etc.), resolved at build time by the `vite-tsconfig-paths` plugin.
- **ESLint** (`.eslintrc`, legacy config, not flat): `@typescript-eslint/no-explicit-any` is an **error** — no `any`. `@typescript-eslint/ban-ts-comment` is also an error. `import/order` is enforced (grouped/alphabetized, `react` first, `*.scss` imports last).
- **Prettier**: single quotes, `printWidth: 100`, trailing commas (es5), always-parens arrow functions.

## Deployment

Multi-stage `Dockerfile`: `node:16.13-alpine` builds (`npm ci && npm run build`, embedding `VITE_CAB_VERSION` from the `DOCKER_TAG` build arg), then `dist/` is served by `nginx:1.23.3-alpine`. At **container runtime**, `entrypoint.sh` `sed`-replaces the placeholder token `__VITE_APP_API_URL__` inside the built JS bundle with the real `$VITE_APP_API_URL` env var before starting nginx — this lets one image be deployed per-environment without a rebuild.
