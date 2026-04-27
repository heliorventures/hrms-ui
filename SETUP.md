# kabipay-ui — Setup

Quick install and project orientation. For **database + Rust + gateway + config.json**, use **[LOCAL_SETUP.md](LOCAL_SETUP.md)** in the monorepo.

## Prerequisites

| Tool | Version / notes |
|------|-----------------|
| **Node.js** | LTS (v20+ recommended) |
| **npm** | Included with Node |
| **Backend (full stack)** | PostgreSQL 16, **kabipay-database**, **kabipay-svc**, **kabipay-gateway** — see sibling repos |

## Install and run

```bash
cd kabipay-ui
npm install
npm run dev
```

App: **http://localhost:5173** (Vite default).

```bash
npm run build    # production bundle
npm run lint
npm run lint -- --fix
```

## Configuration

Runtime URLs live in **`public/config.json`** (not `.env` for API):

- `gatewayUrl` — e.g. `http://127.0.0.1:4009/graphql`
- `authUrl` — e.g. `http://127.0.0.1:4001`
- `devTenantId` — tenant UUID from `kabipay-svc/scripts/provision-tenant.ps1`

Optional GraphQL types: **`npm run codegen`** (gateway must be up; reads `gatewayUrl` from `public/config.json`).

## Project structure

```text
kabipay-ui/
├── public/                 # Static assets; config.json served as /config.json
├── src/
│   ├── api/                # GraphQL client + data loading
│   ├── components/       # Shared UI (common, layout, …)
│   ├── modules/          # Feature routes: auth, dashboard, attendance, leave,
│   │                     # payroll, expenses, notifications, admin, organization,
│   │                     # profile, workplace (recruitment, performance, LMS, …)
│   ├── contexts/         # Auth, tenant, theme
│   ├── hooks/
│   ├── routes/
│   └── …
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── codegen.ts
```

## Features (summary)

Employee: dashboard, attendance/timesheet, leave, payroll, expenses/travel, notifications, profile, organization views.  
Admin: employees, reports, module health, settings.  
Workplace: recruitment, onboarding, performance, learning, benefits, assets, grievance (as routed in `src/modules`).

Detail: **[FEATURES.md](FEATURES.md)**. Architecture and backend mapping: **[README.md](README.md)**.

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, React Router  
- GraphQL via gateway; REST auth  

## Troubleshooting

**Port 5173 in use (Windows PowerShell):**

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

Or: `npm run dev -- --port 3000`

**Clean install:**

```bash
rm -rf node_modules package-lock.json
npm install
```

## License

Proprietary
