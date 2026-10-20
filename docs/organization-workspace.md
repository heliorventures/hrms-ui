# Organization workspace

The workspace is opt-in. Build the React application with `VITE_ORGANIZATION_ENABLED=true` to expose `/organization-workspace`. Its navigation entry requires a signed-in source account; every organization, company, field and action is authorized by the organization and source services.

The user stays signed into their employment company. Organization requests send that session's tenant as both `x-tenant-id` and `x-login-company-id`. The business target is a separate membership variable and never changes authentication headers.

Organization metadata administration does not grant payroll or employee workflow authority. The workspace uses the server's current organization flags and per-company capabilities. History is separate from progress reporting. Company acceptance additionally requires the login company's explicit `role:manage` permission with `ALL` scope.

Business commands retain their original command UUID, source resource version and payload in memory for retries. `SUBMITTED` and uncertain transport mean awaiting source confirmation. Only a matching `COMMITTED` source receipt produces success feedback. On reload, the workspace recovers actor-scoped pending references from the service before showing workflow forms. Recovered entries support source status checks; retry requires the original payload still in memory. No business payload is persisted in browser storage. Logout, source-session changes and detected revocation discard cached data and revoked command payloads.

Pending commands also offer **Cancel if not executed**, including after a reload or while the original request is in flight. Explicit confirmation asks the source to check the original command ID. An already executed command retains its original result; `CANCELLED_NOT_EXECUTED` confirms a durable source cancellation that blocks late execution. Uncertain cancellation keeps the original pending reference and blocks replacement commands. Cancellation never undoes a committed change. A confirmed cancellation refreshes access and source details before another decision; terminal journal entries discard their payloads.

A complete refreshed pending-command response also reconciles obsolete journal entries, including when a role is replaced and reinstalled with the same visible capabilities. Omitted entries lose their payloads and force fresh access/source reads; omission is not presented as business success. Commands created or made in flight after that query began are preserved. Failed or incomplete pagination cannot clear an intent.

Source directory synchronization is paginated. Continue until the UI confirms all pages have been synchronized for every active company before proposing manager relationships. Manager assignments use verified employment references and current graph versions; person-level cycles are rejected by the central service. Source grant and relationship installation must be confirmed separately before authority is active.

Company membership shows configuration and confirmed source versions separately. Activate accepted memberships in the source. Suspension preserves manager assignments and reporting ownership; resumption requires the new source membership state and fresh grant confirmations. Reassign incoming reports before detachment, then install the detaching membership and await source retirement confirmation. The login company and the final organization management anchor are protected by service policy.

Changing an assignment's manager reserves a new version of the same relationship. The source keeps its previous installed snapshot until the replacement is installed and confirmed. The UI offers this replacement directly so callers do not need an end/create sequence.

Payroll requires an explicit target company and a current company payroll grant. Finalization sends the exact protected source draft revision/fingerprint that was reviewed, together with explicit acknowledgements for every provisional-tax employee. Source policy and immutable draft validation remain authoritative.

Payroll draft/finalize delivery returns `ACCEPTED` when a source job is queued. That receipt does not report completed payroll. **Source payroll processing jobs** lists processing state and failure codes, reads a selected job at its current version, and offers cancellation only while queued. Refresh jobs and source cycles to observe execution results.

**Company HR administration** is available from per-company `employee:manage`, `role:manage`, `workflow:manage` and `onboarding:manage` grants even when organization metadata flags are false. Each section requires its own capability and a source-confirmed active membership. Employee forms use source department/designation/type/status references; account forms use source roles; workflow definitions use ordered approval steps; exits expose source rejection, pre-execution approval cancellation and individual clearance updates. Every edit sends its selected source resource and current version. Exit approval and final settlement keep separate Finance authority.

Account initial passwords are request input only. The form clears the password on submission and the command journal retains only a reference, including when delivery is uncertain. Such a command supports status/cancellation checks without replaying a password. No account password is written to browser storage, history or logs.

An employee without a linked login can be provisioned from its current source detail when the selected company also grants `role:manage`. This dedicated operation creates and links a new account through the source onboarding transaction. It never accepts an arbitrary existing account link, and its initial password has the same reference-only journal handling as account creation.

Progress is shown per company with freshness and partial status. Missing or invalid totals are unavailable. Decimal string totals are formatted exactly using integer arithmetic; unsafe JavaScript numbers are refused. Retained history rows must match the selected authorized source companies.

Operational reporting separately shows daily attendance, whole leave requests intersecting the selected period and project time. Leave hundredths are formatted without floating-point conversion. Missing categories and unknown attendance durations stay unavailable. These activity records do not measure productivity or completed work.

Business history archives require both `history:read` and `history:export` for the explicitly selected company. Export uses a stable archive UUID for uncertain retries and a bounded UTC range with source-confirmed coverage. Retrieval checks the current grants; the UI validates archive/company/tenant identity and record count before displaying the manifest and permitted history columns. Historical membership versions remain immutable and may precede the current membership version. Archive data is held only in component memory.

Administrators can view **Configuration activity** for at most 31 UTC days. This is observed metadata with coverage explicitly **not attested**, separate from company business history. It shows organization principal references and exact version strings, without raw changes, command payloads or source account identifiers.

## Generated GraphQL contract

The organization client is generated from the service's exported SDL, without contacting a live gateway:

```powershell
npm run codegen:organization -- --schema-path ..\hrms-gateway\schemas\organization.graphql
npm run codegen:organization-employee -- --schema-path ..\hrms-svc\crates\kabipay-employee\schema.graphql
```

This updates `src/api/organization` and the normal federated codegen extension. Operations live in `src/api/documents/organization.graphql`; production TypeScript imports generated documents. Unsupported JSON document schema versions and unavailable source versions fail closed.

Source collection reads use the selected company's membership UUID and membership version. Resource detail reads use the selected record UUID and its current source version. In particular, `PayrollList` reads the company cycle collection and rejects `cycle_id`; `PayrollDetail` reads the selected cycle and sends its UUID both as `resourceId` and `payload.cycle_id`. A membership version cannot substitute for a cycle version. The payroll review component contract test checks this distinction with different versions for each.

The second command generates `src/api/organization-employee` from the Employee service. Tenant employee/profile/directory consumers read the canonical manager name and explicit organization ownership flag. Local manager fields are disabled and omitted from update payloads under organization ownership; department/designation editing remains available. Foreign managers never fall back to the old tenant-local manager ID.

## Focused checks

```powershell
npx vitest run src/modules/organization-workspace --maxWorkers=1 --minWorkers=1
npx tsc -p tsconfig.build.json --pretty false
npm run graphql:check
```

Synthetic helper/component checks prove UI behavior only. Browser fixtures, source-service integration, company databases, migrations and Kafka/ClickHouse acceptance require their own evidence.
