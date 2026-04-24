# kabipay-ui

React + TypeScript + Vite client for KabiPay (employee and admin areas). Talks to **kabipay-auth** (REST) and the **kabipay-gateway** GraphQL endpoint.

**Full stack on your machine:** step-by-step Postgres, Liquibase, Rust services, gateway, `config.json`, and verification — see **[LOCAL_SETUP.md](LOCAL_SETUP.md)**.

## Dependencies

| Requirement | Notes |
|-------------|--------|
| **Node.js** | LTS (v20+ recommended). |
| **npm** | Comes with Node. |
| **Backend** | For full functionality: Postgres + **kabipay-svc** (auth + subgraphs) + **kabipay-gateway** running; see those repos’ READMEs. |

## Configure

Runtime URLs are **not** baked into the build. Edit **`public/config.json`** (served as static `/config.json`):

| Field | Purpose |
|-------|---------|
| `gatewayUrl` | Federated GraphQL HTTP URL (e.g. `http://127.0.0.1:4009/graphql`). |
| `authUrl` | `kabipay-auth` base URL, no trailing slash (e.g. `http://127.0.0.1:4001`). |
| `devTenantId` | Default tenant UUID for login and `x-tenant-id` when needed. |

## Features

- **Employee Dashboard** - Punch in/out, leave balance, notifications
- **Attendance & Timesheet** - Track attendance, submit timesheets, correction requests
- **Leave Management** - Apply for leave, view balance, track status
- **Payroll** - View payslips, salary breakdown, tax calculations
- **Expenses & Travel** - Submit expense claims, travel requests
- **Notifications** - Company and personal notifications
- **Admin Panel** - Employee management, reports, analytics

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- GraphQL client against the federated gateway (`public/config.json`)
- Multi-tenant architecture (frontend)

## Getting Started

### Installation

```bash
npm install
```

### GraphQL codegen (optional)

When the gateway exposes a live schema, generate typed documents:

```bash
npm run codegen
```

`codegen.ts` reads `gatewayUrl` from `public/config.json`. Run the gateway first.

### Development

```bash
npm run dev
```

Default dev server: **http://localhost:5173** (Vite).

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Typical local order

1. **kabipay-database** — Postgres + migrations.
2. **kabipay-svc** — `kabipay-auth` and subgraphs.
3. **kabipay-gateway** — stitch subgraphs.
4. This UI — set `public/config.json`, then `npm run dev`.

## Related repositories

- **kabipay-database**, **kabipay-svc**, **kabipay-gateway** — see each README.

## Project Structure

```
src/
├── api/              # GraphQL-style API interfaces
├── components/       # Reusable UI components
│   ├── common/       # Common components (buttons, inputs, etc.)
│   ├── layout/       # Layout components (sidebar, header, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   └── forms/        # Form components
├── modules/          # Feature modules
│   ├── attendance/   # Attendance & timesheet
│   ├── leave/        # Leave management
│   ├── payroll/      # Payroll
│   ├── expenses/     # Expenses & travel
│   ├── notifications/# Notifications
│   └── admin/        # Admin panel
├── hooks/            # Custom React hooks
├── profile/          # Profile defaults derived from auth user
├── routes/           # Route configuration
├── theme/            # Theme configuration
├── utils/            # Utility functions
└── contexts/         # React contexts

```

## Architecture

### API and auth

- Runtime URLs come from `public/config.json` (`gatewayUrl`, `authUrl`, `devTenantId`).
- The GraphQL client sends `Authorization` and `x-tenant-id` when a session is active.

### Multi-Tenant Model

- All data is tenant-aware
- Tenant context tracks the active tenant id (from the signed-in user or `devTenantId` before login)
- Client GraphQL calls include `x-tenant-id`

### Role-Based Access

- Two roles: Employee and Admin
- Role-based routing and component rendering
- Admin routes hidden from employees

## Backend

The UI targets the KabiPay gateway and `kabipay-auth` services (Rust, PostgreSQL, JWT).

## License

Proprietary
