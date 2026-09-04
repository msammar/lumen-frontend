# Feature modules

Each feature is self-contained (components, hooks, api calls, types). Structure maps
to the architecture blueprint's front-end strategy (section 7).

| Folder | Responsibility |
|---|---|
| `filters/` | Cross-filter state. `filterStore.ts` is a **factory** (`createFilterStore`), instantiated per-request by `FilterStoreProvider` — never a module singleton (would leak between tenants during SSR). Consume via the `useFilterStore(selector)` hook. Serialises to the request/render hash. |
| `data-table/` | Virtualised rows over **server-paginated** live data (not an image). Column filters, sort, multi-condition predicates — all server-side. |
| `charts/` | Requests a server-rendered chart **image** per (dataset version + filter state + chart spec); swaps a plain `<img>` without layout jank; client-side hover/tooltip overlay where retained. Do **not** route chart images through `next/image` — they are effectively unique per interaction, so the optimizer just adds a re-encode hop and cache churn on the 200 ms path. |
| `statistics/` | Kicks off server-side regression / correlation / etc.; long jobs return via notification, result opened on demand. |
| `realtime/` | WebSocket notification channel: connection lifecycle, replay, dedupe, toast + notification centre. |
| `datasets/` | Upload / list / dataset version metadata. |

Nothing here is implemented yet — this is an empty scaffold.
