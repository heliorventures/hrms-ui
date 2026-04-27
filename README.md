# kabipay-ui

React + TypeScript + Vite SPA for KabiPay: **employee** and **admin** areas. The app uses **kabipay-auth** (REST, JWT) for login and the **kabipay-gateway** federated **GraphQL** API for data.

**End-to-end local stack:** [LOCAL_SETUP.md](LOCAL_SETUP.md) (Postgres / Liquibase → Rust services → gateway → this UI + `public/config.json`).

## Architecture

```text
Browser  →  kabipay-auth (REST)     JWT + refresh
         →  kabipay-gateway (GraphQL)  merged subgraphs from kabipay-svc
         →  PostgreSQL (kabipay_ops + per-tenant schemas)
```

- **Config at runtime:** `public/config.json` — `gatewayUrl`, `authUrl`, `devTenantId` (not baked into the build).
- **Multi-tenant:** `x-tenant-id` and JWT claims scope data; align `devTenantId` with a provisioned tenant UUID.
- **Backend modules** map to GraphQL subgraphs (employee, leave, attendance, payroll, tax, benefits, expense, recruitment, performance, lms, succession, compensation, assets, grievance, workflow, notification, plus ops: operator, tenant, billing). See `kabipay-gateway` and `kabipay-svc` READMEs for ports and details.

## Dependencies

| Requirement | Notes |
|-------------|--------|
| **Node.js** | LTS (v20+ recommended). |
| **npm** | Package manager. |
| **Full functionality** | PostgreSQL 16 + **kabipay-database** migrations, **kabipay-svc** (auth + subgraphs), **kabipay-gateway**. |

## Features (high level)

- **Dashboard** — Punch in/out, leave snapshot, notifications preview, “on leave” / holidays.
- **Attendance & timesheet** — History, timesheet entries, correction requests; admin attendance policy (where implemented).
- **Leave** — Balance, apply, status.
- **Payroll** — Payslips, salary/tax views (aligned with `kabipay-tax` / payroll subgraphs when live).
- **Expenses & travel** — Claims and travel requests.
- **Workplace** — Recruitment, onboarding, performance, learning (LMS), benefits, assets, grievance (routes under workplace / modules).
- **Organization** — Org-style employee directory and related views.
- **Profile** — Settings and documents.
- **Notifications** — List and filters.
- **Admin** — Employees, reports, module health, settings.

See [FEATURES.md](FEATURES.md) for a detailed UI breakdown. Screens may call the live GraphQL API when the gateway and tenant are configured; any remaining mock paths are being phased out in favor of the Rust backend.

## Tech stack

- React 18, TypeScript, Vite, Tailwind CSS, React Router, context for auth/tenant/theme.
- GraphQL over HTTP to `gatewayUrl` (see `src/api` and hooks).

## Configure

Edit **`public/config.json`** (served as `/config.json`):

| Field | Purpose |
|-------|---------|
| `gatewayUrl` | Federated GraphQL URL (e.g. `http://127.0.0.1:4009/graphql`). |
| `authUrl` | `kabipay-auth` base URL, no trailing slash (e.g. `http://127.0.0.1:4001`). |
| `devTenantId` | Default tenant UUID for login and `x-tenant-id` (from `provision-tenant.ps1` output). |

## Getting started

```bash
npm install
npm run dev
```

Default dev server: **http://localhost:5173** (Vite).

```bash
npm run build
npm run lint
```

**GraphQL codegen (optional):** with the gateway running, `npm run codegen` — `codegen.ts` reads `gatewayUrl` from `public/config.json`.

## Typical local order

1. **kabipay-database** — `npm run migrate-ops`, then `provision-tenant` + optional `seed-demo-data` (see **kabipay-svc** scripts).
2. **kabipay-svc** — `kabipay-auth` + subgraphs (e.g. `start-subgraphs.ps1`).
3. **kabipay-gateway** — `npm run dev`.
4. **This UI** — set `public/config.json`, then `npm run dev`.

## Project layout

```text
src/
├── api/            # GraphQL client / loaders
├── components/     # shared UI (common, layout, …)
├── modules/        # feature areas: auth, dashboard, attendance, leave, payroll,
│                   # expenses, notifications, admin, organization, profile, workplace, …
├── hooks/
├── routes/
├── contexts/
└── …
```

## Related repos

- **kabipay-database** — Liquibase, ops + tenant schema.
- **kabipay-svc** — Auth, subgraphs, outbox worker.
- **kabipay-gateway** — Federated GraphQL.

## License

Proprietary
