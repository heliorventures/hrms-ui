# Full local setup — database, services, and UI

This guide is for developers who clone **all** KabiPay repositories on one machine and want the browser UI talking to a real Postgres database, auth, and federated GraphQL.

**Repositories (typical layout):** put them as **sibling folders** so scripts that assume `../kabipay-database` keep working:

```text
your-workspace/
├── kabipay-database/    # Liquibase (ops + tenant migrations)
├── kabipay-svc/         # Rust: kabipay-auth + GraphQL subgraphs + outbox worker
├── kabipay-gateway/     # Node: federated GraphQL gateway
└── kabipay-ui/          # This project
```

If your paths differ, adjust commands and any script variables that point at `kabipay-database`.

---

## 1. Prerequisites

| Tool | Purpose |
|------|---------|
| **PostgreSQL 16** | Local install, **Docker**, or a cloud provider (**Neon**, Aiven, …). Neon: use the **`*-pooler`** host in `POSTGRES_*` / `DATABASE_URL` to save connections and compute; set `POSTGRES_SSLMODE=require`. |
| **Rust** (stable) + **Cargo** | Build and run `kabipay-auth`, subgraphs, and optional `kabipay-outbox-worker`. |
| **Node.js** LTS (v20+) + **npm** | `kabipay-database` (Liquibase scripts), `kabipay-gateway`, and this UI. |
| **JRE 17** | Used by bundled Liquibase under `kabipay-database` (downloaded into `vendor/` on first migrate if needed). |
| **PowerShell** (Windows) | Used by `kabipay-svc/scripts` (provision, seed, start-subgraphs). |
| **Git** | Clone the repos. |

**Hardware:** a full `cargo build --workspace` is heavy; on low-RAM Windows machines build crates one at a time or use `cargo build -j 1` (see `kabipay-svc/README.md`).

---

## 2. Database (`kabipay-database`)

### 2.1 PostgreSQL

Use a **cloud** service (e.g. **Neon**, **Aiven**) or **local** PostgreSQL 16. Put host, port, database name, user, password, and (for TLS) `POSTGRES_SSLMODE=require` in **`kabipay-database/.env`** and/or **`kabipay-svc/.env`**. For **Neon**, use the **pooler** connection string for `DATABASE_URL` and matching `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_DB` so apps and Liquibase agree. The same values must be used for Liquibase and Rust services (if both files exist, **kabipay-database/.env** overrides **svc** for overlapping keys).

You can set a single **`DATABASE_URL`** in **`kabipay-svc/.env`** (e.g. `postgresql://…?sslmode=require`) *and* the split `POSTGRES_*` fields for scripts that build JDBC URLs from host/port/db.

For a local server on `localhost` with a non-default port, set `POSTGRES_PORT` to match.

### 2.2 Liquibase — ops plane (once per database)

`liquibase.properties` uses **`KABIPAY_DB_USER`** and **`KABIPAY_DB_PASSWORD`**. From **`kabipay-database/`**, with **`.env`** in this folder (and/or **`kabipay-svc/.env`**) configured, install npm deps and run **ops** migrations (bundled Liquibase + JRE via npm — no global install):

```powershell
cd kabipay-database
npm install
npm run migrate-ops
```

This creates the **`kabipay_ops`** schema and related ops/control-plane objects.

### 2.3 Tenant schema (per customer)

You need at least **one tenant schema** with **tenant-plane** Liquibase applied, or auth/UI data calls will have nothing to work against.

**Recommended (Windows):** from **`kabipay-svc/`**, with Postgres running and DB connection variables in **`kabipay-database/.env` and/or `kabipay-svc/.env`**:

For **cloud** hosts (Aiven, Neon, …), ensure `.env` has the real host and `POSTGRES_SSLMODE=require` as needed; you can pass **`-PostgresSsl`** to the script if you set host on the command line (see `provision-tenant.ps1` help).

```powershell
.\scripts\provision-tenant.ps1 -Name "Demo Co" -Code demo
```

The script:

- Inserts tenant rows in `kabipay_ops`
- Creates a schema (by default `tenant_<first 8 hex of tenant UUID>`)
- Runs **tenant** Liquibase changelogs for that schema

Note the **tenant UUID** printed by the script. You will paste it into **`kabipay-ui/public/config.json`** as **`devTenantId`**.

**Optional demo data** (users, employees, sample rows for many modules) — after provisioning, from **`kabipay-svc/`**:

```powershell
.\scripts\seed-demo-data.ps1 -TenantId "<UUID printed by provision-tenant>" -Schema "<schema printed by provision-tenant, e.g. tenant_342205fc>"
```

`-Schema` must match the PostgreSQL schema name created for that tenant (shown when you run `provision-tenant.ps1`). `-TenantId` is the tenant’s UUID from the same script’s output.

---

## 3. Rust services (`kabipay-svc`)

### 3.1 Environment

From **`kabipay-svc/`**:

```powershell
copy .env.example .env
```

Edit **`.env`** so Postgres matches **§2**:

   - Prefer **`DATABASE_URL`** (`postgresql://` or `postgres://` with `sslmode` for managed DBs), **or** set **`POSTGRES_*`** as in `kabipay-svc/.env.example`. For Neon, use the **pooler** endpoint in `DATABASE_URL` when possible.

Set strong values for:

- **`KABIPAY_CLIENT_JWT_SECRET`**
- **`KABIPAY_OPERATOR_JWT_SECRET`**

(32+ random characters each.)

### 3.2 Build

```powershell
cd kabipay-svc
cargo build --workspace
```

If the workspace build fails on memory, build per crate or use `-j 1` (see `kabipay-svc/README.md`).

### 3.3 Run auth (REST)

In a **dedicated terminal**:

```powershell
cd kabipay-svc
cargo run -p kabipay-auth
```

Default: **`http://127.0.0.1:4001`** (`KABIPAY_AUTH_PORT`).

### 3.4 Run subgraphs (GraphQL)

Each subgraph serves **`http://127.0.0.1:<port>/graphql`**. You can run individual crates, e.g.:

```powershell
cargo run -p kabipay-employee
```

To start **all** subgraphs on ports **4010–4028** after a **debug** build:

```powershell
.\scripts\start-subgraphs.ps1
```

Keep **`kabipay-auth`** running in its own process; the script only starts the subgraph executables.

The **gateway** will **skip** any subgraph that is down at startup, but missing subgraphs mean missing parts of the API and possible UI errors—best practice is to run the full set for a full UI test.

---

## 4. Gateway (`kabipay-gateway`)

From **`kabipay-gateway/`**:

```powershell
copy .env.example .env
npm install
npm run dev
```

Defaults:

- **`KABIPAY_SUBGRAPH_BASE_URL=http://127.0.0.1`** — must match where subgraphs listen (no trailing slash).
- **`KABIPAY_GATEWAY_PORT=4009`** — federated endpoint:

**`http://127.0.0.1:4009/graphql`**

Wait until subgraphs are up before starting the gateway if you want every module stitched; you can restart the gateway after starting more subgraphs.

---

## 5. This UI (`kabipay-ui`)

### 5.1 Configure runtime URLs

Edit **`public/config.json`** (served at `/config.json` in dev and production):

```json
{
  "gatewayUrl": "http://127.0.0.1:4009/graphql",
  "authUrl": "http://127.0.0.1:4001",
  "devTenantId": "<tenant-uuid-from-provision-tenant>"
}
```

- **`gatewayUrl`** — must end with **`/graphql`** and match **`KABIPAY_GATEWAY_PORT`**.
- **`authUrl`** — **`kabipay-auth`** base URL, **no** trailing slash.
- **`devTenantId`** — UUID of the tenant you provisioned (e.g. from `provision-tenant.ps1`).

### 5.2 Install and run

```powershell
cd kabipay-ui
npm install
npm run dev
```

Open **http://localhost:5173** (Vite default).

### 5.3 GraphQL codegen (optional)

When the gateway is up and exposes the full schema:

```powershell
npm run codegen
```

`codegen.ts` reads **`gatewayUrl`** from `public/config.json`.

---

## 6. Reference — default ports

| Service | Default URL / port |
|---------|-------------------|
| Postgres | Values from `kabipay-database/.env` and/or `kabipay-svc/.env` (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, etc.) |
| `kabipay-auth` | `http://127.0.0.1:4001` |
| Subgraphs | `http://127.0.0.1:4010` … `4028`, path `/graphql` |
| Gateway | `http://127.0.0.1:4009/graphql` |
| UI (Vite) | `http://localhost:5173` |

Subgraph names ↔ ports match **`kabipay-gateway/src/subgraphs.ts`** (operator 4010 … notification 4028).

---

## 7. Smoke checks

1. **Postgres:** `psql` or your GUI can connect using the same `POSTGRES_*` as `kabipay-database/.env` / `kabipay-svc/.env`.
2. **Auth:** browser or `curl` to `http://127.0.0.1:4001` (expect 404 on `/` is normal; login is `POST /auth/client/login` with JSON body).
3. **Gateway:** open `http://127.0.0.1:4009/graphql` — GraphiQL/Yoga UI if enabled, or run a simple query.
4. **UI:** login page loads; after **seed-demo-data**, a common demo user is **`demo@kabipay.local`** with password **`ChangeMe!123`** (see `seed-demo-data.ps1` comments—rotate in real environments).

---

## 8. Troubleshooting

| Symptom | Things to check |
|---------|------------------|
| Liquibase cannot connect | **`.env`** (database and/or svc), `npm run migrate-ops` JDBC URL, and TLS (`sslmode`) must match the server. |
| `provision-tenant.ps1` fails “kabipay-database not found” | Run from `kabipay-svc` with **`kabipay-database`** as a sibling directory, or edit `$DatabaseDir` in the script. |
| Gateway shows 0 subgraphs | Subgraphs not running, wrong **`KABIPAY_SUBGRAPH_BASE_URL`**, or firewall blocking `127.0.0.1` ports. |
| UI “cannot reach auth” | **`authUrl`** in `config.json`, **`kabipay-auth`** running, CORS is usually permissive for local dev. |
| Login 401 / wrong tenant | **`devTenantId`** matches provisioned tenant; user exists in that tenant (run **seed** or create user via ops). |
| `npm run codegen` fails | Gateway up; **`gatewayUrl`** in `config.json` correct; try opening the URL in a browser. |

---

## 9. Repo-specific docs

For deeper detail in each codebase:

- **`kabipay-database/README.md`** — migration rules, tenant vs ops changelogs.
- **`kabipay-svc/README.md`** — Cargo targets, scripts, ports.
- **`kabipay-gateway/README.md`** — env vars and run modes.
- **`kabipay-ui/README.md`** — UI-only quick start and structure.
