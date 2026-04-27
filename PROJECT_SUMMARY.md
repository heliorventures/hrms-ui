# kabipay-ui — Project summary

SPA for **KabiPay** (HRMS): React + TypeScript + Vite, styled with Tailwind. It targets a real **Rust** backend in the same monorepo: **kabipay-auth** (REST) and **kabipay-gateway** (federated GraphQL over stitched **kabipay-svc** subgraphs) with **PostgreSQL** schemas from **kabipay-database** (Liquibase).

## Documentation map

| Doc | Purpose |
|-----|---------|
| [README.md](README.md) | Overview, architecture, config, related repos |
| [LOCAL_SETUP.md](LOCAL_SETUP.md) | Full local stack: DB → migrations → Rust → gateway → UI |
| [SETUP.md](SETUP.md) | UI-only install and structure |
| [FEATURES.md](FEATURES.md) | Feature and module breakdown |

## What the UI covers

- **Core:** Dashboard, attendance/timesheet, leave, payroll (incl. tax-related views), expenses and travel, notifications, profile, organization-style pages.
- **Workplace-style modules:** Recruitment, onboarding, performance, learning, benefits, assets, grievance (see `src/modules/workplace` and routes).
- **Admin:** Employees, reports, module health, settings.
- **Auth / tenant:** Login against `authUrl`; GraphQL calls use `gatewayUrl`, `Authorization`, and `x-tenant-id` (from session or `devTenantId`).

## Backend alignment

| UI area | Typical subgraphs / services |
|---------|------------------------------|
| Auth | `kabipay-auth` (not in gateway) |
| Operator / billing (if exposed in UI) | `operator`, `tenant`, `billing` |
| HR / time / pay | `employee`, `leave`, `attendance`, `payroll`, `tax`, `benefits` |
| Spend / travel | `expense`, workflow |
| Talent / growth | `recruitment`, `performance`, `lms`, `succession`, `compensation` |
| Ops / compliance | `assets`, `grievance`, `workflow`, `notification` |

Ports **4010–4028** and plane (ops vs tenant) are listed in **`kabipay-gateway/src/subgraphs.ts`**.

## Local quick start (short)

1. Migrate and provision a tenant (**kabipay-database** + `kabipay-svc/scripts`).  
2. Run **auth** + subgraphs + **gateway**.  
3. Set **`public/config.json`**, then **`npm run dev`** in **kabipay-ui**.

## Quality and tooling

- ESLint + Prettier  
- Optional **GraphQL codegen** when the gateway schema is available  

## License

Proprietary
