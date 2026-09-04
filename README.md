# Analytics Platform — Frontend

Empty scaffold for the interactive big-data analytics platform frontend.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript | File-based routing + code splitting; middleware for auth/tenant gating; BFF rewrite layer. |
| Server state | @tanstack/react-query | Caches server-computed result sets; request dedupe/cancellation for rapid filter changes. |
| UI / filter state | zustand | High-frequency filter updates without cascading React re-renders. |
| Table virtualization | @tanstack/react-virtual | Render only visible rows over server-paginated live data. |
| Charts | server-rendered images (`<img>`) | Per directive 4 — client displays pictures, does not draw data points. |
| Real-time | native WebSocket | Push notifications, server→client, per-user (directive 3). |
| Styling / components | Tailwind CSS v4 + shadcn/ui (`new-york`, `neutral`) | CSS-first config, no `tailwind.config.js`; components are copied into the repo (`src/components/ui/`), not a dependency. |

> The architecture doc (`architecture-prompt-enhanced.md`) is a template with unfilled
> `[BRACKETED]` slots — these are sensible defaults, revisit once the blueprint is finalised.

### Why Next.js over a plain SPA

The directives (thin client, server-rendered chart images, all compute server-side)
mean SSR/RSC data-fetching buys little here. Next.js is used mainly as a batteries-
included SPA shell: routing, code splitting, `middleware.ts` for auth, and `rewrites`
as a same-origin proxy to the read-path API. Cost: a Node runtime to operate instead
of static files on a CDN.

## Getting started

```bash
npm install
cp .env.example .env.local        # defaults assume a backend on :8080
npx playwright install --with-deps # once, for e2e tests
npm run dev
```

Env vars are validated at load (`src/lib/env.ts`) — a missing `NEXT_PUBLIC_*` throws
in production instead of silently falling back to a localhost default.

## Scripts

| Script | Action |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:watch` | Vitest unit/component tests (jsdom) |
| `npm run test:e2e` | Playwright — builds, starts, hits `:3000` |

## Layout

```
src/
  app/          App Router
    layout.tsx  providers.tsx  page.tsx  globals.css
    loading.tsx  error.tsx  not-found.tsx  global-error.tsx
  features/     self-contained feature modules (see features/README.md)
    filters/      filterStore.ts (factory) + FilterStoreProvider + useFilterStore hook
    realtime/     notificationSocket.ts — WebSocket push channel skeleton
    data-table/ charts/ statistics/ datasets/  — empty
  components/   shared presentational components
    ui/         shadcn/ui primitives (generated — button.tsx seeded)
  hooks/        shared hooks
  lib/          env, config, apiClient (+ ApiError), queryClient (factory), utils (cn)
  types/        shared TS types
e2e/            Playwright specs
```

### Adding shadcn components

```bash
npx shadcn@latest add dialog table dropdown-menu   # etc.
```

Config in `components.json`. Tailwind theme tokens (CSS variables + `@theme inline`)
live in `src/app/globals.css`; `cn()` is in `src/lib/utils.ts`.

## Notes

- `next.config.mjs` `rewrites` proxies `/api/*` to `API_PROXY_TARGET` **in dev only**
  (returns `[]` in production — terminate `/api` at the ingress/CDN there, don't put
  the Node server in the query hot path). WebSocket upgrades are never proxied by
  rewrites — the push channel connects directly via `NEXT_PUBLIC_WS_URL`.
- No `middleware.ts` yet — add it when auth lands.
- `tsconfig.json` is partly Next-managed: `next build` forces `allowJs: true` and
  `jsx: "react-jsx"` (Next 16 automatic runtime) and injects `.next/**/types` globs.
- Next 16 defaults to **Turbopack** for `dev` and `build`. Pass `--webpack` to opt out.
- ESLint uses `eslint-config-next`'s native flat config (v16+); no `FlatCompat` shim.
