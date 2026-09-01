# Code Review Findings Remediation Design

Date: 2026-08-24
Status: Approved

## Context

The August QA defects remained reproducible because earlier corrections were applied at individual UI call sites while authorization, transaction, database, and reporting contracts remained unchanged. The accepted review found related failures across `hrms-database`, `hrms-svc`, `hrms-gateway`, and `hrms-ui`.

This design fixes those root causes as independently testable changes. It preserves unrelated branch and worktree changes, does not commit automatically, and does not run Dart or Flutter commands.

The existing approved attendance-management design remains authoritative for the separate `/attendance` and `/hr/attendance` journeys. This specification adds the security, reporting, time-zone, concurrency, lifecycle, and validation contracts needed to close the review findings.

## Goals

- Keep roles as the administrative assignment mechanism, while using the effective permissions and resource scopes resolved from those roles as the runtime authorization authority.
- Fail closed when authenticated business operations do not have client claims.
- Make approval and attendance transitions atomic under concurrency.
- Use one tenant-specific IANA time zone for every attendance business-date decision.
- Return complete, policy-derived attendance report rows and aggregates from the server.
- Prevent totals of 24 hours or more and prevent overlapping/open duplicate punches.
- Remove raw internal identifiers and incomplete-data reports from user-visible output.
- Deactivate future-dated approved separations when their tenant business date arrives.
- Convert database conflicts and validation failures into stable domain errors.
- Enforce input contracts consistently in React, Rust, and PostgreSQL.

## Non-goals

- Replacing the existing workflow engine.
- Introducing a second role or permission model.
- Guessing absence when an employee has no applicable work schedule.
- Allowing external URLs in direct notification actions.
- Rewriting unrelated UI-modernization work.

## Implementation Units

The remediation is split into four independently verifiable units. Database changes are additive and ordered so older application instances fail safely during rolling deployment.

1. Authorization and approval integrity.
2. Attendance time, mutation, and reporting integrity.
3. Employee lifecycle and boundary validation.
4. React contract adoption and display correctness.

## Authorization Contract

Roles remain the normal way to assign access. At login and token refresh, the authentication service loads the user's active roles, resolves their `role_permission` and `permission_scope` rows, merges the resulting access, and places the effective permissions and scopes in the client session. A scope is merged for the exact `resource:action` permission, so an `ALL` scope for `attendance:read` cannot broaden `attendance:regularize`. Business resolvers authorize against those effective values. They do not bypass that resolution with checks such as `role == HR_ADMIN`.

Therefore, a built-in admin role receives its default access automatically through its configured permission and scope assignments. A custom role can receive the same access without being named "admin", and removing a permission from an admin role removes that capability after the user's session is refreshed.

### Claims

Protected GraphQL business resolvers must call `require_client_claims`. Missing claims return `UNAUTHENTICATED`; they never imply `ALL`, `SELF`, or another data scope. Health checks use dedicated unauthenticated probe fields and cannot invoke business list resolvers.

`data_scope_from_context` becomes fallible and derives scope only from validated `ClientClaims`. Callers must propagate the authentication error. No protected resolver can recover from missing claims by supplying a wider scope.

### Expense and travel approval

`expense:approve` is the sole approval permission for both expense claims and travel requests. Effective row access is the caller's `expense:approve` scope:

- `SELF` cannot approve another employee's request and cannot approve the caller's own request;
- `TEAM` allows direct reports;
- `DEPARTMENT` allows employees in the caller's department;
- `ALL` allows all tenant employees;
- an unlinked caller cannot use `SELF`, `TEAM`, or `DEPARTMENT` approval scope.

Rust, React route/action visibility, and workflow-step resolution use this exact contract. Runtime checks do not inspect `HR_ADMIN`, `TENANT_ADMIN`, `ORG_ADMIN`, or any other role name. Seed/migration code may assign default permissions to built-in roles, but that assignment only produces permission and scope rows; role names do not authorize requests.

Existing sessions must be refreshed after permission or scope changes. Backend enforcement remains authoritative if a stale UI still displays an action.

### Attendance reporting and management

Two explicit permission actions are used:

- `attendance:read` controls the read-only attendance report and is filtered by its attendance scope;
- `attendance:regularize` controls management adjustments and is filtered by its own attendance scope.

`/admin/reports` is not a proxy authorization boundary. The attendance report navigation item, report selector, route guard, GraphQL resolver, aggregate, and export all require `attendance:read`. Unrelated employee-write or payroll-export permissions do not grant attendance access.

The separate `/hr/attendance` management route follows the approved attendance-management specification and requires `attendance:regularize`.

## Approval Transaction Contract

Expense and travel approve/reject operations execute inside one transaction:

1. Load the request with `FOR UPDATE` and verify it is still `PENDING`.
2. Load or create the workflow instance and lock it before reading its current step.
3. Re-evaluate permission, data scope, self-approval prohibition, and configured workflow eligibility.
4. Insert exactly one workflow action for the transition.
5. Conditionally update the request and workflow state.
6. Insert the outbox event in the same transaction.
7. Commit once.

A database uniqueness constraint prevents duplicate workflow actions for the same workflow instance, step, actor, and terminal action. A request no longer in `PENDING` returns `CONFLICT`; it does not generate another action or event. Reject and approve share the same locked transition helper.

## Attendance Time Contract

### Tenant business clock

The control-plane tenant `timezone` column stores the canonical IANA identifier, such as `Asia/Kolkata`. Provisioning assigns `UTC` when no time zone is supplied. Invalid IANA values are rejected at tenant create/update boundaries.

Attendance receives a `TenantBusinessClock` through request state. The clock loads the tenant time zone by tenant ID from the control plane and exposes:

- current UTC instant;
- tenant-local business date and wall time for an instant;
- conversion of a tenant-local date/time into a UTC instant;
- explicit errors for ambiguous or nonexistent DST wall times.

The service does not read a process-global fixed-offset environment variable. Live punches, manual entries, policy windows, punch summaries, reports, and scheduled offboarding use the same clock contract.

### Stored values and compatibility

Attendance adds `check_in_at` and `check_out_at` `TIMESTAMPTZ` columns. New live and manual mutations write these instant columns and continue deriving legacy `work_date`, `check_in_time`, and `check_out_time` columns during the compatibility window.

Existing completed rows are backfilled by interpreting their legacy date/time in the tenant's configured IANA zone. Ambiguous or nonexistent legacy values are recorded in a migration-audit table and left for explicit correction; they are never silently shifted. Existing open rows receive `check_in_at` only.

Reads prefer instant columns and derive display date/time using the tenant clock. Legacy columns remain until all deployed readers and historical rows have migrated.

## Attendance Mutation Contract

Every live or manual mutation opens a transaction and obtains a transaction-scoped advisory lock for tenant, employee, and tenant business date. An update moving a segment between dates locks both keys in deterministic order.

Inside the lock the service re-reads all affected rows and enforces:

- no more than one open segment;
- check-in precedes check-out;
- no overlap with another segment;
- completed daily duration after the proposed change is strictly less than 24 hours;
- live punch-out also runs the daily-duration check;
- manual and management paths use the same validator;
- writes and attendance-adjustment audit rows commit atomically.

The database additionally has a partial unique index for one open attendance row per tenant and employee, and a check constraint requiring a valid completed segment. Application locks provide the cross-row duration/overlap invariant; database constraints provide final defense against malformed direct writes.

## Attendance Reporting Contract

### Server-owned report model

The attendance service exposes a cursor-paginated daily report. Each row contains:

- employee ID for machine use only;
- employee full name and employee code for display;
- business date and tenant time zone;
- first punch-in and last punch-out instants;
- completed logged minutes consolidated across all segments;
- expected working minutes, when a schedule is configured;
- explicit status: `PRESENT`, `HALF_DAY`, `ABSENT`, `ON_LEAVE`, `HOLIDAY`, `WEEKLY_OFF`, `INCOMPLETE`, or `UNSCHEDULED`;
- segment count.

The backend derives expected work from the employee's effective shift, employment dates, holiday calendar, approved leave, and weekly-off policy. If no applicable schedule can be resolved, it returns `UNSCHEDULED`; it never guesses an absence from hard-coded eight/four-hour thresholds.

The summary endpoint aggregates the same filtered dataset and returns totals for logged minutes and each status. The export endpoint streams or pages through the same server-side query. Summary and export do not depend on rows loaded in the browser.

Cursor ordering is stable by business date descending, employee code, and employee ID. Page size defaults to 50 and is capped at 100. Employee scope is applied in SQL before search, pagination, aggregation, or export.

### Display contract

Employee identity travels with every report row. React never joins a capped employee directory to label attendance and never renders a full or shortened UUID as a fallback. If an authorized row lacks identity because of corrupt data, the server returns a stable `DATA_INTEGRITY_ERROR`, and the UI shows a report-level recovery message rather than a misleading identifier.

## Employee Lifecycle Contract

Approval of a separation with a future last-working date records the approved state and an offboarding-due event. The outbox worker periodically scans due approved separations for every active tenant using the tenant business date.

For each due separation, one transaction locks the separation and employee, confirms it is still approved and due, deactivates the employee's user, increments/revokes the user's active-session version, marks the offboarding timestamp, and writes an outbox/audit event. A uniqueness constraint on the offboarding marker makes repeated scans idempotent. Immediate separations call the same function rather than maintaining separate logic.

Cancelled or superseded separations are skipped after the locked recheck.

## Boundary Validation Contract

### Employee uniqueness

Pre-insert checks remain helpful UX but are not authoritative. Named PostgreSQL unique constraints are mapped at the repository/service boundary:

- user email conflict -> `USER_EMAIL_CONFLICT`;
- tenant-scoped username conflict -> `USER_USERNAME_CONFLICT`;
- employee code conflict -> `EMPLOYEE_CODE_CONFLICT`.

The same mapping applies to create and update races. Unknown database failures retain `DATABASE_ERROR` and are logged without exposing SQL or personal data.

### Timesheet decimal hours

Hours accept zero to two decimal places only. React parses and normalizes the submitted decimal; Rust rejects a scale greater than two and values outside existing duration limits; PostgreSQL adds a scale check and stores the normalized value. Existing values with more than two decimals are inventoried before the constraint and normalized using the approved half-up rule.

### Notification actions

Direct notifications accept a typed internal action, represented as an application route plus optional entity identifier. The server normalizes the route and rejects schemes, hosts, protocol-relative values, traversal, control characters, and unregistered route prefixes. Persisted legacy `action_url` remains readable only after passing the same normalizer; unsafe legacy values behave as no action.

### Required fields

Required form controls use shared `Input`, `Textarea`, `Select`, or `FormField` primitives so the visible marker, `required`/`aria-required`, label association, and validation message are generated from one contract. A source inventory test fails when a required raw `input`, `select`, or `textarea` with a handwritten label is introduced in application modules.

## React Data and Display Contract

- `OnLeaveToday` uses the authored generated GraphQL operation and requests backend `employeeName` and `employeeCode`; it does not fetch or join the organization chart.
- Attendance report and management screens use generated operations and server-owned labels, summaries, and cursors.
- Report summary/export controls are enabled only from complete server aggregate/export responses, never inferred from a capped page.
- Timesheet inputs preserve the user's valid value while normalizing only at submission boundaries.
- Attendance duration rounds total seconds to whole minutes first, then derives hours and remaining minutes; `60m` is impossible.
- Conflict, validation, and authorization errors use centralized actionable messages in `graphqlUserMessage.ts`.

React effects use stable dependencies and cancellation/retained-query patterns already established in the branch. Independent requests may run concurrently, but duplicate operations and browser-side joins are removed.

## Error Handling and Observability

Domain failures use stable GraphQL codes: `UNAUTHENTICATED`, `FORBIDDEN`, `CONFLICT`, `VALIDATION_ERROR`, and the named employee conflict codes. User messages do not expose role names, database details, employee existence outside scope, or internal IDs.

Concurrency conflicts include request, tenant, entity type, and entity ID as structured tracing fields. Logs exclude notification content, email addresses, names, and other personal data. Each error is logged once at the service boundary.

## Deployment Order

1. Apply additive database constraints, columns, indexes, and permission rows.
2. Deploy Rust services and worker with dual-read/dual-write attendance compatibility.
3. Restart attendance/employee/expense/notification subgraphs, then restart the gateway so stitched schema reflects new fields.
4. Regenerate and deploy React GraphQL artifacts and UI callers.
5. Backfill attendance instants and normalize historical timesheet precision after dry-run inventories are reviewed.
6. Reissue or refresh client sessions so new permissions and scopes are present.
7. Remove compatibility columns only in a later separately approved migration.

## Regression Coverage

Tests are written before production changes and must cover:

- missing claims never return protected rows;
- approval with permission/scope succeeds and role name without permission fails;
- concurrent approve/reject produces one workflow action and one outbox event;
- tenant-local midnight and DST conversion;
- concurrent punch-in, punch-out, overlap, and daily-duration enforcement;
- consolidated report duration and each explicit status, including `UNSCHEDULED`;
- scoped report pagination, summary, export, and employee labels;
- due offboarding idempotency and session invalidation;
- concurrent duplicate email/username/employee-code error mapping;
- notification route normalization and rejection;
- two-decimal validation in React, Rust, and migration checks;
- required marker/accessibility inventory;
- no UUID fallback in attendance or leave dashboard;
- duration rounding across the 59m59s boundary;
- `git diff --check` cleanliness.

Focused tests run after each unit. Broader Cargo, React, gateway, migration, and browser acceptance checks run only after focused verification and are reported separately. No test result is claimed unless its command completed successfully.

## Acceptance Criteria

- Removing a permission removes the corresponding action after session refresh, regardless of role name.
- Direct unauthenticated subgraph business queries fail closed.
- Concurrent terminal actions cannot create duplicate workflow or attendance state.
- Every attendance path uses the same tenant IANA time zone and instant representation.
- Attendance reports contain complete employee identity, consolidated duration, explicit policy-derived status, server aggregates, and uncapped export semantics.
- Future approved separations deactivate access on the due tenant business date.
- User-visible validation is stable under database races and alternate API clients.
- No raw employee UUID is used as a display label.
- All changed repositories remain uncommitted for user review.
