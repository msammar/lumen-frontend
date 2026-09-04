# Enhanced Prompt — Big Data Analytics Platform Architecture

> Fill in every `[BRACKETED]` slot before sending. The bracketed fields are the ones your original prompt left implicit — they're the difference between a generic answer and an actionable one.

---

## ROLE

Act as a **Principal Software Architect** who has shipped multiple production OLAP / interactive-analytics platforms. You have hands-on scars from columnar stores, query-latency tuning, and browser rendering limits. Be opinionated: make a decision and defend it. Do not present a menu and leave the choosing to me.

## RULES OF ENGAGEMENT

1. If any missing detail below would **materially change** your recommendation, ask up to 5 clarifying questions **before** answering. Otherwise, state your assumptions explicitly in a table at the top and proceed.
2. Every technology choice must name **at least one rejected alternative** and the concrete reason it lost.
3. Tie every recommendation to a **number** from the constraints below (row count, latency budget, concurrency, budget). Reject any advice that would be equally true for a to-do app.
4. Distinguish **MVP** from **later phase** for every component. Do not design the 100x system on day one, but flag where the MVP creates a wall.
5. Where the honest answer is "it depends," give me the **decision rule** — the specific threshold or measurement that resolves it.
6. **One scoped exception to rule (be opinionated):** for the **big-data storage & query engine** specifically, give me **two fully-developed candidate options** I can prototype and benchmark myself — not a menu of five names, but two committed paths, each spec'd end-to-end. Still state which one you'd bet on and why; I want to test both against my real data before committing. This exception applies **only** to the data layer — everywhere else, pick one.

---

## PROJECT

Interactive analytics platform. Users load large datasets, explore them in a filterable data table, build charts, and run statistical analyses. The product must feel **instant** under interaction — filtering and re-charting should not feel like submitting a job.

## DATA PROFILE  ← *most important section*

| Attribute | Value |
|---|---|
| Source format | `[CSV / Parquet / Arrow / JDBC pull / S3 drop / Kafka stream / API]` |
| Rows per dataset | `[e.g. 5M]` |
| Total rows at rest (year 1) | `[e.g. 2B]` |
| Raw size on disk | `[e.g. 400 GB]` |
| Growth rate | `[e.g. 20 GB/month]` |
| Columns / typical width | `[e.g. 80 cols, mixed numeric + low-cardinality categorical]` |
| Cardinality of main filter dimensions | `[e.g. 10k entities × 50 categories × daily dates]` |
| Ingest cadence | `[hourly batch / user-triggered upload / continuous stream]` |
| Mutability | `[append-only / late-arriving corrections / full updates]` |
| Schema stability | `[fixed / user-defined columns / evolving]` |
| Retention & archival | `[e.g. hot 90d, cold 3y]` |

## USERS & TRAFFIC

- **`[100–500]`** — specify: total registered users, or peak concurrent?
- Realistic **peak concurrency**: `[e.g. 30 simultaneous active sessions]`
- Queries per active session per minute: `[e.g. 10–20 during exploration]`
- Internal tool or public product? `[  ]`
- Multi-tenant? Does row-level data isolation between tenants/teams matter? `[  ]`
- Geography / network conditions: `[  ]`

## PERFORMANCE BUDGET (define "fast and smooth" as SLOs)

| Interaction | Target (p95) |
|---|---|
| Cold dashboard load | `[e.g. < 2.0 s]` |
| Apply filter → table + charts repaint | `[e.g. < 200 ms]` |
| Aggregate query across full dataset | `[e.g. < 1.5 s]` |
| Regression / correlation on `[N]` rows | `[e.g. < 3 s]` |
| Ingest + index `[X GB]` | `[e.g. < 10 min]` |
| Scroll / pan / zoom | 60 fps, no dropped frames |
| Max rows materialized in the browser | `[e.g. 1M via columnar in-memory, virtualized rendering]` |
| Server event → notification visible in UI | `[e.g. < 500 ms]` |
| Read replica / read-path staleness tolerance | `[e.g. < 5 s behind primary]` |

## FUNCTIONAL REQUIREMENTS

- **Data table:** server-side or client-side filter, sort, paginate over the full dataset; virtualized rendering; column-level filters; multi-condition predicates.
- **Charts:** bar, line, scatter, histogram, box plot, heatmap `[add/remove]` — **rendered to images on the server** (see directive 4) and delivered to the client as pictures. Specify per chart type whether any client-side interactivity is retained.
- **Cross-filtering:** selecting in one chart filters all others. `[required? yes/no]`
- **Statistics:** linear & multiple regression, correlation matrices, `[ANOVA / chi-square / distribution fitting / outlier detection]`. These run **server-side** (see directives below); recommend the specific execution tier for each.
- **Notifications / real-time push:** the backend must be able to push events to the front end without polling. Event types: `[ingest job started/progress/finished/failed, long-running calculation ready, dataset refreshed, shared view updated, system alerts]`. Specify: `[in-session toast only / persistent notification centre with history / read-unread state / email or external fallback]`. Delivery scope: `[per-user / per-team broadcast / global]`.
- **Exports:** `[CSV / Parquet / PNG / PDF report]`.
- **Saved state:** saved views, shareable filter URLs, scheduled reports? `[  ]`

## CONSTRAINTS

- Team: `[N engineers, skills: ...]`
- Budget ceiling: `[$X/month infra]`
- Deployment: `[cloud (which) / on-prem / air-gapped / hybrid]`
- Compliance: `[none / HIPAA / GDPR / SOC 2 / internal data-residency]`
- Timeline to first usable version: `[  ]`

## NON-NEGOTIABLE DESIGN DIRECTIVES

These are decisions I have already made. Design around them. If you believe one is wrong at my stated scale, say so once, in a clearly labelled paragraph, with the numeric threshold at which it becomes wrong — then proceed as instructed.

1. **Server-side computation.** Regression, correlation, aggregation, filtering, sorting, and grouping execute on the server or in the query engine. The browser receives result sets, not raw data to crunch. Client-side work is limited to rendering, layout, and trivial UI-local state. Design the API and wire format on that assumption.
2. **Dedicated read path.** The system needs a read-optimized layer separate from the write/ingest path, so heavy analytical reads never contend with ingestion. Recommend the concrete mechanism — `[read replicas / CQRS with a separate read model / a columnar read store fed from the OLTP primary / connection-pooled reader service / materialized-view layer]` — and explain routing, replication lag handling, and failover.
3. **Push-based notifications.** No client polling for state changes. Real-time transport is required between backend and front end.
4. **Server-side chart rendering.** Charts are rendered to images **on the server** and the finished image is sent to the browser — the client displays a picture, it does not receive data points and draw them. Recommend the concrete server rendering approach (`[headless browser + JS charting lib / a server-native plotting library / a dedicated render service]`), the image format and transport (`[PNG / SVG / WebP; inline base64 / object storage + URL / streamed]`), and how interactivity that users expect from charts (hover, zoom, cross-filter, tooltips) is preserved or deliberately traded away when the chart is a flat image. State the interaction-latency cost this imposes and how you keep it inside the SLO — caching rendered images by (dataset + filter + chart-spec) hash, pre-rendering, and re-render triggers. Give the data-volume or interactivity threshold at which flat server images stop being the right call and a hybrid (server-rendered static base + thin client-side interaction layer) wins.

---

## DELIVERABLE

Produce a structured architecture blueprint with these sections:

**1. Executive summary.** Assumptions table, then 2–3 candidate architectures scored against my SLOs and constraints, then your pick in one paragraph.

**2. Tech stack.** Table: layer → choice → why (tied to a number above) → rejected alternative → the risk this choice introduces. Cover front-end, back-end, query/compute engine, storage, read path, chart-render engine, real-time transport, caching, background job queue, auth, hosting/DevOps.

**3. Architecture type.** Monolith / microservices / serverless / hybrid, justified at *this* scale — explicitly argue against over-engineering. Include a component diagram (Mermaid) plus sequence diagrams for the three hot paths: **(a) ingest**, **(b) user applies filter → server computes → server renders chart image → client swaps image**, **(c) long-running server calculation → notification pushed → user opens result**.

**4. Data layer & read-path design — TWO CANDIDATE OPTIONS.** Per rule 6, present **two fully-developed data-storage/query-engine options** (call them Option A and Option B), each spec'd end-to-end so I can prototype both. For **each** option cover: engine choice and why, the ingest→store path, on-disk layout (partitioning, sort/ordering keys, compression), pre-aggregations or materialized views and which queries they accelerate, expected latency at my row counts, operational burden, and monthly cost at my scale. Then give:
- A **head-to-head comparison table** (A vs B) across latency, ingest throughput, concurrency ceiling, ops complexity, cost, and lock-in.
- Your **bet** — which one you'd back and the single measurement that would change your mind.
- A concrete **benchmark plan**: the exact queries and dataset sizes I should run against both to decide, and the numbers that constitute a pass.

Shared across both options: core entities and relationships (ERD in Mermaid), and the row-store-vs-columnar reasoning behind each pick. Then design the **read path** specifically:
- Mechanism (replica / CQRS read model / separate analytical store) and how data gets there.
- Read/write routing: who decides, at what layer, and how the app handles replication lag and read-your-own-writes.
- Connection pooling and concurrency limits at my stated peak concurrency.
- Failover behaviour when the read layer is unavailable or stale.
- The threshold at which one reader stops being enough, and the scale-out plan.

**5. Server-side compute strategy.** Given that computation is server-side by directive:
- Placement of each workload — pushed down into the query engine (SQL/UDF), an application-tier compute service, or a dedicated worker pool — with the data-volume threshold that moves it.
- Synchronous request/response vs asynchronous job for each operation, and the latency cutoff that decides.
- Job queue, worker sizing, backpressure, cancellation of superseded requests (critical when a user rapidly changes filters), and idempotency.
- Precompute vs on-demand; caching layers and invalidation strategy.
- Wire format between server and browser (JSON vs Arrow/binary) with a payload-size and parse-time justification.
- How you keep a chatty, server-computed UI inside a `[200 ms]` interaction budget: request coalescing, debouncing, result caching, partial/streaming responses.

**5b. Server-side chart rendering pipeline.** Since charts are server-rendered images by directive:
- Rendering engine choice (headless-browser JS lib vs server-native plotting lib vs render service) with the rejected alternative and why.
- Image format and transport (PNG / SVG / WebP; base64 inline vs object-storage URL vs stream) justified by payload size and the notification/interaction budget.
- **Render caching** keyed by (dataset version + filter state + chart spec) hash: hit rate you expect, eviction, and invalidation when data refreshes.
- Where rendering runs (inline in the API tier vs a dedicated render worker pool), sizing at my peak concurrency, and how a burst of filter changes doesn't queue-starve the renderer (coalescing, cancellation of superseded renders).
- Sync vs async: when a render returns in-band vs when it becomes a job that fires a notification on completion.
- The threshold at which flat images stop working and you'd move to a hybrid (static server base + thin client interaction layer).

**6. Real-time notification layer.** Transport choice — **WebSockets vs Server-Sent Events vs long-polling fallback** — decided against my actual event pattern (mostly server→client, low volume, per-user). Then:
- Connection lifecycle: auth on connect, reconnection with backoff, resume-after-disconnect and missed-event replay.
- Message contract: event envelope schema, versioning, ordering and delivery guarantees (at-most-once vs at-least-once) and which ones this product actually needs.
- Fan-out: how an event reaches the right user/team, and how this survives more than one backend instance — pub/sub broker, sticky sessions, or a managed service. Name the choice.
- Persistence: which notifications are durable and queryable after the fact vs ephemeral in-session.
- Scale and cost of holding `[N]` concurrent open connections; what breaks and where.
- Front-end integration: client state store, deduplication, toast vs notification centre, and how notifications trigger UI refresh without full re-fetch.
- Rejected alternative: why not just poll — with the numbers.

**7. Front-end strategy (thin client).** Computation is server-side and charts arrive as images, so the client is a display and interaction-routing layer — design it accordingly. Cover: how a filter change maps to a server render request and how the returned image swaps in without layout jank; image caching/preloading on the client; row virtualization over server-paginated table data (the table is still live data, not an image); state management for high-frequency filter updates and inbound push events without cascading re-renders; and loading, skeleton, progressive, and stale-image UX for the round trips this architecture makes unavoidable. Address the UX cost of losing native chart interactivity (hover/zoom/tooltip on a flat image) and your mitigation.

**8. Auth, authorization, security.** AuthN choice, role model, row/column-level access if multi-tenant, upload validation, query-injection surface, secrets, audit logging. Include **authentication and authorization on the real-time channel** — token refresh on a long-lived connection, and preventing cross-tenant event leakage.

**9. Infrastructure & DevOps.** Environments, CI/CD, IaC, containerization, observability (what metrics prove the SLOs above are met — including notification delivery latency, replica lag, job queue depth, chart-render time, and render-cache hit rate), backup/DR, and a rough **monthly cost estimate** at my stated scale. Note any load-balancer or ingress requirements imposed by persistent connections.

**10. Trade-offs, risks, and scaling cliffs.** Table: risk → likelihood → impact → mitigation → early-warning signal. Explicitly answer: **what breaks first at 10x data and 10x users, and what is the fix?** Cover at minimum: server CPU/GPU saturation from centralized computation **and image rendering**, the render pool becoming the bottleneck under rapid filtering, replication lag under heavy ingest, connection exhaustion on the real-time layer, and render-cache/query-cache stampede. Call out vendor lock-in and the realistic exit cost of each managed service.

**11. Execution roadmap.** Phase-by-phase, each with scope, **exit criteria** (measurable, tied to the SLO table), and duration estimate. Phase 0 must be a thin end-to-end walking skeleton — real data, real server-side query, one real server-rendered chart image delivered to the browser, one real pushed notification — that validates the riskiest performance assumption before feature work begins. Include a "deliberately deferred" list.

**12. Architecture Decision Records.** 5–8 one-line ADRs in the form: *Decision — Context — Consequence.* Include one each for compute placement, read-path mechanism, real-time transport, and server-side chart rendering.

**13. Open questions** you need answered before this plan is safe to build against.

## OUTPUT FORMAT

Markdown. Tables for anything comparative. Mermaid for diagrams. Prioritize decisions and numbers over prose. No filler, no restating my requirements back to me.
