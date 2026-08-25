# Code Review Findings Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every accepted August review finding by enforcing authorization, concurrency, attendance, lifecycle, and validation invariants across PostgreSQL, Rust GraphQL services, and React.

**Architecture:** Roles remain the administrative assignment mechanism. Login resolves action-specific permissions and scopes into claims; runtime code authorizes from those effective claims. Additive Liquibase migrations establish database defenses, Rust services own transactions and policy calculations, GraphQL returns complete domain DTOs, and React consumes generated operations without capped joins or identifier fallbacks.

**Tech Stack:** PostgreSQL 16, Liquibase XML, Rust 1.89, SeaORM 1.1, async-graphql 7, Tokio, chrono/chrono-tz, React 18, TypeScript 5, GraphQL Code Generator, and Vitest.

**Spec:** `docs/superpowers/specs/2026-08-24-code-review-findings-remediation-design.md`

## Global Constraints

- Preserve unrelated modified and untracked files in every repository.
- Do not commit, pull, fetch, push, or post remote comments.
- Do not run Dart or Flutter commands.
- Write a failing regression test before each production behavior change and verify the expected failure.
- Use authored `.graphql` operations as source; regenerate `src/api/graphql/*` rather than editing generated files.
- Use additive migrations after existing uncommitted migration `0063_attendance_management`.
- Keep role names out of runtime authorization checks; role names may only seed default role-permission assignments.
- Never display an employee UUID as a user-facing label.
- Do not claim database, runtime, or browser verification unless the corresponding command completed successfully.

---

### Task 1: Resolve action-specific authorization claims and fail closed

**Files:**
- Modify: `../hrms-svc/crates/kabipay-auth/src/rbac.rs`
- Modify: `../hrms-svc/crates/kabipay-auth/src/jwt.rs`
- Modify: `../hrms-svc/crates/kabipay-auth/src/handlers.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/context.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/client_data_scope.rs`
- Modify: Rust callers returned by `rg -n 'data_scope_from_context\(' ../hrms-svc/crates`
- Modify: `src/auth/clientSession.ts`
- Modify: `src/auth/approvalScope.ts`
- Create: `src/auth/clientSession.test.ts`
- Create: `src/auth/approvalScope.test.ts`

**Interfaces:**
- Produces Rust claim field `permission_scopes: HashMap<String, String>` keyed by exact permission code such as `attendance:read`.
- Produces `data_scope_from_context(ctx, permission) -> async_graphql::Result<ScopeType>`.
- Produces UI `permissionScopes` and `scopeForPermission(session, permission)`.

- [ ] **Step 1: Write failing Rust claim-resolution tests**

Add a pure merge test in `rbac.rs` proving `attendance:read=ALL` does not broaden `attendance:regularize=SELF`. Add an async-graphql schema test in `client_data_scope.rs` that calls the scope helper without claims and expects GraphQL code `UNAUTHENTICATED`.

```rust
let merged = merge_permission_scopes([
    ("attendance", "read", "ALL"),
    ("attendance", "regularize", "SELF"),
]);
assert_eq!(merged["attendance:read"], "ALL");
assert_eq!(merged["attendance:regularize"], "SELF");
```

- [ ] **Step 2: Run focused Rust tests and confirm RED**

```powershell
cargo test -p kabipay-auth rbac
cargo test -p kabipay-common client_data_scope
```

Expected: missing `permission_scopes`, merge helper, and fallible scope helper.

- [ ] **Step 3: Implement claim generation and fail-closed scope access**

Build permission keys only when a role grants the matching permission. Merge qualifying role scopes using `ScopeType::rank`. Retain legacy `resource_scopes` in serialized claims for one compatibility release, but do not use it for approval, reports, or regularization.

```rust
pub fn data_scope_from_context(
    ctx: &Context<'_>,
    permission: &str,
) -> async_graphql::Result<ScopeType> {
    let claims = require_client_claims(ctx)?;
    Ok(claims.scope_for_permission(permission))
}
```

Update protected callers with exact actions: `attendance:read`, `attendance:regularize`, `timesheet:approve`, `employee:read`, `leave:approve`, and `expense:approve`. Self-service lists explicitly use `SELF` after requiring claims.

- [ ] **Step 4: Write and run failing React session tests**

Assert distinct values from `permission_scopes` and exact lookup. Run:

```powershell
npm test -- --run src/auth/clientSession.test.ts src/auth/approvalScope.test.ts
```

- [ ] **Step 5: Parse action-specific claims in React and rerun GREEN**

Add `permissionScopes` to `ParsedClientSession` and normalized exact lookup:

```ts
export function scopeForPermission(session: ParsedClientSession | null, permission: string) {
  return session?.permissionScopes[permission.toLowerCase()]?.trim().toUpperCase() ?? 'SELF';
}
```

Run the Rust and React commands from Steps 2 and 4 again.

### Task 2: Remove expense/travel role fallbacks and permission-scope bypasses

**Files:**
- Modify: `../hrms-svc/crates/kabipay-common/src/context.rs`
- Modify: `../hrms-svc/crates/kabipay-expense/src/resolvers/mutation.rs`
- Modify: `../hrms-svc/crates/kabipay-expense/src/resolvers/types.rs`
- Modify: `../hrms-svc/crates/kabipay-expense/src/services/expense_service.rs`
- Modify: `../hrms-svc/crates/kabipay-expense/src/services/travel_request_service.rs`
- Modify: `src/auth/permissionService.ts`
- Create: `src/auth/permissionService.test.ts`
- Create: `../hrms-svc/crates/kabipay-expense/tests/approval_authorization.rs`

**Interfaces:**
- Consumes exact `expense:approve` permission and scope from Task 1.
- Produces `ExpenseApprovalAuthority` for both expense and travel mutations.

- [ ] **Step 1: Write failing role-without-permission tests**

```ts
expect(serviceWith({ roles: ['HR_ADMIN'], permissions: [] })
  .canCapability('action.expense.approve')).toBe(false);
expect(serviceWith({ permissions: ['expense:approve'] })
  .canCapability('action.expense.approve')).toBe(true);
```

Rust constructs HR-admin claims without permission and expects denial, then adds permission plus `ALL` and expects authority creation.

- [ ] **Step 2: Run tests RED**

```powershell
cargo test -p kabipay-expense --test approval_authorization
npm test -- --run src/auth/permissionService.test.ts
```

Expected: role-only caller currently succeeds.

- [ ] **Step 3: Implement permission-only authority**

Make `can_approve_expense` exact-permission only. Delete the React role/scope fallbacks for this capability. Resolve an authority before service entry:

```rust
pub struct ExpenseApprovalAuthority {
    pub actor_user_id: Uuid,
    pub actor_employee_id: Option<Uuid>,
    pub scope: ScopeType,
}
```

Apply `resolve_employee_scope_filter` before approval and always deny self-approval.

- [ ] **Step 4: Run focused tests GREEN**

Run the commands from Step 2.

### Task 3: Make expense and travel terminal actions concurrency-safe

**Files:**
- Create: `../hrms-database/changelog/migrations/0064_approval_integrity/approval_integrity.xml`
- Modify: `../hrms-database/changelog/tenant.changelog-master.xml`
- Create: `../hrms-database/scripts/test-approval-integrity-migration.ps1`
- Modify: `../hrms-svc/crates/kabipay-common/src/workflow_approval.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/workflow_current_step.rs`
- Modify: `../hrms-svc/crates/kabipay-expense/src/services/expense_service.rs`
- Modify: `../hrms-svc/crates/kabipay-expense/src/services/travel_request_service.rs`
- Create: `../hrms-svc/crates/kabipay-expense/tests/approval_concurrency_postgres.rs`

**Interfaces:**
- Produces `lock_pending_workflow_transition(txn, tenant_id, instance_id)`.
- Produces partial unique index `uq_workflow_action_terminal_actor`.

- [ ] **Step 1: Write migration assertions and concurrent tests**

The migration test requires:

```sql
CREATE UNIQUE INDEX uq_workflow_action_terminal_actor
ON workflow_action (tenant_id, instance_id, workflow_step_id, performed_by, action)
WHERE action IN ('APPROVE', 'REJECT');
```

The PostgreSQL test starts two tasks behind a `tokio::sync::Barrier` and asserts one success, one conflict, one workflow action, and one terminal outbox event for expense, travel, and approve-versus-reject.

- [ ] **Step 2: Run migration test RED**

```powershell
powershell -NoProfile -File scripts/test-approval-integrity-migration.ps1
```

Expected: migration/index absent. Run PostgreSQL tests only with an approved disposable `KABIPAY_TEST_DATABASE_URL`.

- [ ] **Step 3: Add workflow permission and idempotency schema**

Add the index and `workflow_step.approver_permission VARCHAR(150)`. Migrate expense/travel steps to `approver_type='PERMISSION'`, `approver_permission='expense:approve'`, and `approver_role_id=NULL`.

- [ ] **Step 4: Lock request and workflow rows in one transaction**

Use `FOR UPDATE`; re-read status after locking. Pass `&DatabaseTransaction` to every helper. Insert action, conditional request update, workflow update, and outbox event before one commit. A non-pending request or unique-index race returns `Conflict`.

- [ ] **Step 5: Run focused checks GREEN**

```powershell
powershell -NoProfile -File scripts/test-approval-integrity-migration.ps1
cargo test -p kabipay-common workflow_approval
cargo test -p kabipay-expense
```

With approved disposable PostgreSQL:

```powershell
cargo test -p kabipay-expense --test approval_concurrency_postgres -- --nocapture
```

### Task 4: Finish attendance-management permission migration

**Files:**
- Modify: `../hrms-database/changelog/migrations/0063_attendance_management/attendance_management.xml`
- Modify: `../hrms-database/scripts/test-attendance-management-migration.ps1`
- Modify: `../hrms-database/scripts/seed-demo-data.ps1`
- Verify: `../hrms-svc/crates/kabipay-db-entities/src/tenant/d0063_attendance_management.rs`

**Interfaces:**
- Produces default role assignments while runtime remains permission-only.
- Preserves existing uncommitted audit-table work.

- [ ] **Step 1: Extend migration tests before SQL changes**

Assert `attendance:regularize` creation, tenant-correlated role/permission/scope inserts, admin `ALL` seed, optional manager `TEAM` seed, and absence of runtime role-check functions/triggers.

- [ ] **Step 2: Run migration test RED**

```powershell
powershell -NoProfile -File scripts/test-attendance-management-migration.ps1
```

- [ ] **Step 3: Correct tenant correlation and comments**

Correlate permission, role, subscription, and scope rows by tenant ID. Keep role names only in migration/seed assignment selection. State that resolvers use `attendance:regularize` and its scope.

- [ ] **Step 4: Regenerate only 0063 and verify**

From `hrms-svc`:

```powershell
python scripts/generate_db_entities.py --only 0063_attendance_management
cargo check -p kabipay-db-entities
```

### Task 5: Introduce the tenant IANA business clock and attendance instants

**Files:**
- Create: `../hrms-database/changelog/migrations/0065_attendance_time_integrity/attendance_time_integrity.xml`
- Modify: `../hrms-database/changelog/tenant.changelog-master.xml`
- Create: `../hrms-database/scripts/test-attendance-time-migration.ps1`
- Modify: `../hrms-svc/Cargo.toml`
- Modify: `../hrms-svc/crates/kabipay-attendance/Cargo.toml`
- Create: `../hrms-svc/crates/kabipay-common/src/tenant_business_clock.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/lib.rs`
- Modify: `../hrms-svc/crates/kabipay-ops/src/services/provision_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_service.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/src/bin/backfill_attendance_instants.rs`
- Modify: `../hrms-svc/crates/kabipay-db-entities/src/tenant/d0010_time_shift_roster.rs`
- Create: `../hrms-svc/crates/kabipay-common/tests/tenant_business_clock.rs`

**Interfaces:**
- Produces `TenantBusinessClock::load(ops_db, tenant_id)` and local/UTC conversion methods.
- Adds nullable `attendance.check_in_at` and `attendance.check_out_at` timestamps.

- [ ] **Step 1: Write clock tests for midnight and DST**

```rust
assert_eq!(clock("Asia/Kolkata").business_date(utc("2026-08-23T19:00:00Z")), date("2026-08-24"));
assert!(clock("America/New_York").to_utc(date("2026-03-08"), time("02:30:00")).is_err());
assert!(clock("America/New_York").to_utc(date("2026-11-01"), time("01:30:00")).is_err());
```

Provisioning tests require absent timezone to become `UTC` and invalid identifiers to fail validation.

- [ ] **Step 2: Run clock tests RED**

```powershell
cargo test -p kabipay-common --test tenant_business_clock
cargo test -p kabipay-ops timezone
```

- [ ] **Step 3: Add `chrono-tz` and implement the clock**

Parse `ops.tenant.timezone` into `chrono_tz::Tz`. Return validation errors for `LocalResult::Ambiguous` and `LocalResult::None`; never choose an arbitrary DST side. Use the ops connection already present in GraphQL schema state.

- [ ] **Step 4: Write migration assertions RED**

Require both `TIMESTAMPTZ` columns, an open-row partial unique index, a completed-segment check, and a backfill-audit table. Liquibase adds schema only; a dry-run-capable Rust command backfills per tenant because each tenant has an independent IANA zone.

- [ ] **Step 5: Add migration and generated entity fields**

```sql
CREATE UNIQUE INDEX uq_attendance_one_open
ON attendance (tenant_id, employee_id)
WHERE check_out_at IS NULL AND status = 'OPEN';
```

The completed check allows an open row without checkout or requires `check_out_at > check_in_at` for a completed row.

- [ ] **Step 6: Replace fixed-offset attendance helpers**

Delete `KABIPAY_ATTENDANCE_TIMEZONE_OFFSET_MINUTES`. Live/manual paths receive a clock and dual-write instant plus legacy fields. Summary defaults use `clock.today()`.

- [ ] **Step 7: Add dry-run attendance-instant backfill**

The binary iterates active tenants from the ops database, interprets legacy wall times through `TenantBusinessClock`, and defaults to dry-run. `--apply --tenant-id <UUID>` is required to write one tenant. Ambiguous/nonexistent local times insert an audit row and remain unchanged. Already populated timestamps are skipped, making reruns idempotent.

- [ ] **Step 8: Run focused tests GREEN**

```powershell
powershell -NoProfile -File scripts/test-attendance-time-migration.ps1
cargo test -p kabipay-common --test tenant_business_clock
cargo test -p kabipay-attendance attendance_business
```

### Task 6: Serialize all attendance mutations and enforce the strict daily cap

**Files:**
- Create: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_transaction.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/mod.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/mutation.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/tests/attendance_concurrency_postgres.rs`

**Interfaces:**
- Produces `with_locked_attendance_day` and `validate_day_segments` for live, self-manual, and managed mutations.

- [ ] **Step 1: Write pure invariant tests**

Cover duplicate opens, overlap, adjacent non-overlap, 23:59 acceptance, exact 24:00 rejection, and live punch-out pushing a day to 24 hours.

```rust
assert!(validate_day_segments(&segments_totaling_minutes(1439)).is_ok());
assert!(matches!(validate_day_segments(&segments_totaling_minutes(1440)), Err(KabiPayError::Validation(_))));
```

- [ ] **Step 2: Run unit tests RED**

```powershell
cargo test -p kabipay-attendance attendance_transaction
```

- [ ] **Step 3: Implement deterministic advisory locking**

Hash tenant ID, employee ID, and business date into PostgreSQL advisory-lock keys and call `pg_advisory_xact_lock`. Sort two date keys before locking an edit that moves dates. Re-query affected rows through the transaction after locking.

- [ ] **Step 4: Route every mutation through one transaction**

Move open-row lookup, overlap checks, total calculation, insert/update, and management audit insert inside the callback. Helpers accept `&DatabaseTransaction`; none opens a normal connection or commits independently.

- [ ] **Step 5: Add PostgreSQL race tests**

Use barriers for concurrent punch-in, overlapping manual inserts, and simultaneous punch-outs. Assert persisted database state.

- [ ] **Step 6: Run focused tests GREEN**

```powershell
cargo test -p kabipay-attendance attendance_transaction
```

With approved disposable PostgreSQL:

```powershell
cargo test -p kabipay-attendance --test attendance_concurrency_postgres -- --nocapture
```

### Task 7: Complete self and managed attendance GraphQL contracts

**Files:**
- Modify: `../hrms-svc/crates/kabipay-common/src/context.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/query.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/mutation.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/types.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/src/services/managed_attendance_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/mod.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/tests/managed_attendance_postgres.rs`

**Interfaces:**
- Produces `myAttendance`, `managedAttendance`, `addManagedAttendanceSegment`, and `updateManagedAttendanceSegment`.

- [ ] **Step 1: Write resolver authorization tests**

Assert `myAttendance` has no employee argument and ignores broad scope. Managed fields require `attendance:regularize`; HR role without permission fails; `TEAM` includes self/direct reports only; nonexistent and out-of-scope targets return identical denial.

- [ ] **Step 2: Run tests RED**

```powershell
cargo test -p kabipay-attendance managed_attendance
```

- [ ] **Step 3: Implement stable cursor and identity DTO**

Use opaque base64 JSON containing `(work_date, created_at, id)`. Join authorized employee name/code in SQL. Reject ranges over 92 days and page sizes over 100. Never derive labels from IDs.

- [ ] **Step 4: Implement managed writes using Task 6**

Require reason length 5..=500. Derive employee from stored row on update. Compare `expected_updated_at`. Serialize explicit before/after audit snapshots and commit attendance plus audit once.

- [ ] **Step 5: Run tests GREEN**

```powershell
cargo test -p kabipay-attendance managed_attendance
```

With approved disposable PostgreSQL:

```powershell
cargo test -p kabipay-attendance --test managed_attendance_postgres -- --nocapture
```

### Task 8: Build policy-derived attendance report, summary, and export data

**Files:**
- Create: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_report_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/mod.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/query.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/types.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/tests/attendance_report_postgres.rs`

**Interfaces:**
- Produces `attendanceDailyReport`, `attendanceReportSummary`, and paged export rows using one filtered model.

- [ ] **Step 1: Write status-calculation tests**

Cover `PRESENT`, `HALF_DAY`, `ABSENT`, `ON_LEAVE`, `HOLIDAY`, `WEEKLY_OFF`, `INCOMPLETE`, and `UNSCHEDULED`. Assert multiple segments consolidate to one total and no fixed eight/four-hour thresholds exist.

```rust
assert_eq!(classify_day(expected(480), logged(480), false), AttendanceDayStatus::Present);
assert_eq!(classify_day(no_schedule(), logged(0), false), AttendanceDayStatus::Unscheduled);
```

- [ ] **Step 2: Run report tests RED**

```powershell
cargo test -p kabipay-attendance attendance_report
```

- [ ] **Step 3: Implement one policy projection**

Resolve effective roster slot first, then employee shift; then location holiday, approved leave, employment dates, and weekly off. No roster/shift produces `UNSCHEDULED`. Aggregate segment seconds and round total minutes once.

- [ ] **Step 4: Apply authorization before pagination/aggregation**

Require `attendance:read`, derive its exact scope, and filter employee IDs in SQL before search, cursor, summary, or export.

- [ ] **Step 5: Return complete identity and run GREEN**

Return name/code, timezone, first/last instants, logged/expected minutes, status, and segment count. Missing employee joins return `DataIntegrity`.

```powershell
cargo test -p kabipay-attendance attendance_report
```

With approved disposable PostgreSQL:

```powershell
cargo test -p kabipay-attendance --test attendance_report_postgres -- --nocapture
```

### Task 9: Add idempotent due-separation offboarding

**Files:**
- Create: `../hrms-database/changelog/migrations/0066_lifecycle_validation_integrity/lifecycle_validation_integrity.xml`
- Modify: `../hrms-database/changelog/tenant.changelog-master.xml`
- Create: `../hrms-database/scripts/test-lifecycle-validation-migration.ps1`
- Modify: `../hrms-svc/crates/kabipay-db-entities/src/tenant/d0017_onboarding_offboarding.rs`
- Modify: `../hrms-svc/crates/kabipay-employee/src/services/separation_service.rs`
- Create: `../hrms-svc/crates/kabipay-common/src/due_offboarding.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/lib.rs`
- Modify: `../hrms-svc/crates/kabipay-outbox-worker/src/main.rs`
- Create: `../hrms-svc/crates/kabipay-outbox-worker/tests/due_offboarding_postgres.rs`

**Interfaces:**
- Adds `separation.offboarded_at` and `separation.offboarding_event_id`.
- Produces `process_due_separations(ops_db, tenant_db, tenant_id, business_date)`.

- [ ] **Step 1: Write migration and service tests RED**

Assert columns/event uniqueness. Integration cases: future approved stays active; due approved deactivates user/sessions; second run is a no-op; cancelled separation is skipped.

- [ ] **Step 2: Add lifecycle schema**

Add nullable timestamp/event marker, an index on approved not-offboarded rows by `last_working_date`, and uniqueness for non-null event IDs.

- [ ] **Step 3: Extract one locked offboarding transaction**

Lock separation, employee, user, and active session rows; recheck status/date; set employee/user inactive; revoke existing sessions using current auth semantics; set `offboarded_at`; insert one audit/outbox event. Immediate approval calls the same function.

- [ ] **Step 4: Schedule tenant scans in the worker**

Load active tenants/timezones from ops DB. Call the due processor each worker interval before event delivery and record structured counts without personal data.

- [ ] **Step 5: Run focused checks GREEN**

```powershell
powershell -NoProfile -File scripts/test-lifecycle-validation-migration.ps1
cargo test -p kabipay-employee separation
cargo test -p kabipay-outbox-worker due_offboarding
```

With approved disposable PostgreSQL:

```powershell
cargo test -p kabipay-outbox-worker --test due_offboarding_postgres -- --nocapture
```

### Task 10: Map uniqueness errors and enforce two-decimal timesheets

**Files:**
- Modify: `../hrms-svc/crates/kabipay-common/src/error.rs`
- Create: `../hrms-svc/crates/kabipay-common/src/db_constraint.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/lib.rs`
- Modify: `../hrms-svc/crates/kabipay-employee/src/services/employee_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/mutation.rs`
- Modify: `../hrms-database/changelog/migrations/0066_lifecycle_validation_integrity/lifecycle_validation_integrity.xml`
- Modify: `src/modules/timesheet/timesheetRules.ts`
- Modify: `src/modules/timesheet/timesheetRules.test.ts`
- Modify: `src/utils/graphqlUserMessage.ts`
- Modify: `src/utils/graphqlUserMessage.test.ts`

**Interfaces:**
- Produces named conflicts for `uq_user_tenant_email`, `uq_user_tenant_username`, and `uq_employee_tenant_code`.
- Produces timesheet parsing with zero to two decimal places.

- [ ] **Step 1: Write failing constraint-name tests**

```rust
assert_eq!(map_constraint("uq_user_tenant_email"), DomainConflict::UserEmail);
assert_eq!(map_constraint("uq_user_tenant_username"), DomainConflict::Username);
assert_eq!(map_constraint("uq_employee_tenant_code"), DomainConflict::EmployeeCode);
```

Unknown names remain database errors.

- [ ] **Step 2: Write failing precision tests**

React rejects `1.234`, accepts `1`, `1.2`, `1.23`, and normalizes `.5` to `0.50` at submission. Rust rejects `Decimal::new(1234, 3)`. Migration test requires historical half-up normalization before:

```sql
CHECK (hours_worked = ROUND(hours_worked, 2))
```

- [ ] **Step 3: Run focused tests RED**

```powershell
cargo test -p kabipay-common db_constraint
cargo test -p kabipay-attendance timesheet_precision
npm test -- --run src/modules/timesheet/timesheetRules.test.ts src/utils/graphqlUserMessage.test.ts
```

- [ ] **Step 4: Implement authoritative boundary handling**

Read SQLx constraint names through SeaORM errors and translate only known constraints to stable GraphQL codes. Keep prechecks for fast UX, but map create/update race failures. Change UI regex to `^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$`; normalize with decimal strings. Rust requires normalized scale `<= 2`. Add cleanup/check to migration `0066`.

- [ ] **Step 5: Run focused tests GREEN**

```powershell
cargo test -p kabipay-common db_constraint
cargo test -p kabipay-employee employee_conflict
cargo test -p kabipay-attendance timesheet_precision
npm test -- --run src/modules/timesheet/timesheetRules.test.ts src/utils/graphqlUserMessage.test.ts
```

### Task 11: Validate notification actions on the server

**Files:**
- Create: `../hrms-svc/crates/kabipay-notification/src/services/notification_action.rs`
- Modify: `../hrms-svc/crates/kabipay-notification/src/services/mod.rs`
- Modify: `../hrms-svc/crates/kabipay-notification/src/services/notification_service.rs`
- Modify: `../hrms-svc/crates/kabipay-notification/src/resolvers/mutation.rs`
- Modify: `src/utils/actionUrl.ts`
- Modify: `src/utils/actionUrl.test.ts`
- Modify: `src/modules/admin/components/DirectNotificationComposer.tsx`

**Interfaces:**
- Produces `NotificationAction::parse_internal_route(&str)` and canonical relative route storage.

- [ ] **Step 1: Write failing parser tests**

Accept `/leave/requests/123` and `/expenses?id=123`. Reject absolute/protocol-relative URLs, `javascript:`, backslashes, encoded traversal, control characters, and unknown route roots.

- [ ] **Step 2: Run parser tests RED**

```powershell
cargo test -p kabipay-notification notification_action
```

- [ ] **Step 3: Implement canonical allowlist parser**

Allow only `/attendance`, `/expenses`, `/leave`, `/notifications`, `/profile`, `/timesheet`, `/hr`, `/admin`, `/organization`, `/payroll`, and `/workplace`. Normalize repeated slashes and reject traversal before and after percent decoding. Empty input stores `NULL`.

- [ ] **Step 4: Apply parser on create/update and align React**

Resolvers parse raw input; services accept `Option<NotificationAction>`. Legacy reads still suppress invalid stored values using the React normalizer.

- [ ] **Step 5: Run focused tests GREEN**

```powershell
cargo test -p kabipay-notification notification_action
npm test -- --run src/utils/actionUrl.test.ts
```

### Task 12: Replace capped attendance report UI with generated contracts

**Files:**
- Modify: `src/api/schema-extensions/hrms-timesheet-attendance.graphql`
- Modify: `src/api/documents/clientOperations.graphql`
- Generate: `src/api/graphql/gql.ts`
- Generate: `src/api/graphql/graphql.ts`
- Generate: `src/api/graphql/index.ts`
- Modify: `src/auth/permissions.ts`
- Modify: `src/auth/permissionService.ts`
- Modify: `src/navigation/navigationModel.ts`
- Modify: `src/routes/appRouteConfig.tsx`
- Modify: `src/modules/admin/AdminReportsPage.tsx`
- Modify: `src/modules/admin/components/AttendanceReportDetails.tsx`
- Delete: `src/modules/admin/attendanceReportStats.ts`
- Modify: `src/modules/admin/attendanceReportStats.test.ts`
- Create: `src/modules/admin/AdminReportsPage.test.tsx`
- Create: `src/modules/admin/components/AttendanceReportDetails.test.tsx`

**Interfaces:**
- Consumes Task 8 page/summary/export fields.
- Produces permission-gated reports with server totals and row-owned identity.

- [ ] **Step 1: Write permission/report tests RED**

Assert attendance report requires `attendance:read`; employee-write/payroll-export alone do not grant it. Assert cursor variables, filter reset, server summary use, row-owned name/code, and absence of UUID text.

- [ ] **Step 2: Author GraphQL operations and extension**

Add `AdminAttendanceDailyReport`, `AdminAttendanceReportSummary`, and export-page operations selecting complete fields/page info. Extend local schema with exact additive types until the gateway restarts.

- [ ] **Step 3: Run codegen/tests and confirm RED**

```powershell
npm run codegen
npm test -- --run src/auth/permissionService.test.ts src/modules/admin/AdminReportsPage.test.tsx src/modules/admin/components/AttendanceReportDetails.test.tsx
```

- [ ] **Step 4: Implement generated paginated UI**

Remove the ad-hoc combined query and 500-row attendance limit. Request attendance page/summary independently. Render server status and consolidated minutes. Export iterates server export pages and does not export browser rows.

- [ ] **Step 5: Remove hard-coded stats and identity join**

Delete production use of `buildAttendanceReportStats`. Remove employee-map props and UUID fallback. Show retryable data-integrity errors.

- [ ] **Step 6: Run focused tests GREEN**

Run the Step 3 test command again.

### Task 13: Adopt self-only and managed-attendance React journeys

**Files:**
- Modify: `src/api/schema-extensions/hrms-timesheet-attendance.graphql`
- Modify: `src/api/documents/clientOperations.graphql`
- Generate: `src/api/graphql/gql.ts`
- Generate: `src/api/graphql/graphql.ts`
- Generate: `src/api/graphql/index.ts`
- Modify: `src/modules/attendance/AttendancePage.tsx`
- Create: `src/modules/attendance/AttendancePage.test.tsx`
- Create: `src/modules/hr/HrAttendanceManagementPage.tsx`
- Create: `src/modules/hr/HrAttendanceManagementPage.test.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendanceFilters.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendanceTable.tsx`
- Create: `src/modules/hr/attendance/AttendanceRegularizationModal.tsx`
- Create: focused tests for each new managed-attendance component
- Modify: `src/auth/permissionService.ts`
- Modify: `src/navigation/navigationModel.ts`
- Modify: `src/routes/appRouteConfig.tsx`
- Modify: `src/routes/routeRegistry.test.ts`

**Interfaces:**
- Consumes Task 7 self/managed GraphQL fields.
- Produces `/attendance` self-only data and `/hr/attendance` permission/scope-managed data.

- [ ] **Step 1: Write failing self-page tests**

Assert the employee page uses `MyAttendanceBoardDocument`, sends no `employeeId`, and never renders another employee. Add cursor-stack tests for next/previous and month-filter reset.

- [ ] **Step 2: Write failing management route/list/modal tests**

Assert only `attendance:regularize` exposes `/hr/attendance`; an admin role or `employee:write` alone fails. Table rows always render employee name/code. Add/edit modal keeps employee immutable, requires a 5..=500 character reason, sends `expectedUpdatedAt` on edit, and refreshes the first page after success.

- [ ] **Step 3: Run tests RED**

```powershell
npm test -- --run src/modules/attendance/AttendancePage.test.tsx src/modules/hr/HrAttendanceManagementPage.test.tsx src/modules/hr/attendance src/auth/permissionService.test.ts src/routes/routeRegistry.test.ts
```

- [ ] **Step 4: Author operations and regenerate**

Add `MyAttendanceBoard`, `ManagedAttendancePage`, `AddManagedAttendanceSegment`, and `UpdateManagedAttendanceSegment` to `clientOperations.graphql`; mirror exact additive local schema fields; run `npm run codegen`.

- [ ] **Step 5: Replace generic self query and build managed components**

Delete the local generic attendance document. Keep self and management state separate. Management search is server-side, debounced 300 ms, range-limited to 92 days, page size 50, and cursor-paginated. Use generated types and centralized GraphQL messages.

- [ ] **Step 6: Run focused tests GREEN**

```powershell
npm run codegen
npm test -- --run src/modules/attendance/AttendancePage.test.tsx src/modules/hr/HrAttendanceManagementPage.test.tsx src/modules/hr/attendance src/auth/permissionService.test.ts src/routes/routeRegistry.test.ts
```

### Task 14: Adopt backend leave labels and complete required-field semantics

**Files:**
- Modify: `src/api/documents/clientOperations.graphql`
- Generate: `src/api/graphql/gql.ts`
- Generate: `src/api/graphql/graphql.ts`
- Generate: `src/api/graphql/index.ts`
- Modify: `src/modules/dashboard/components/OnLeaveToday.tsx`
- Modify: `src/modules/dashboard/components/OnLeaveToday.test.tsx`
- Modify: `src/modules/expenses/components/SubmitTravelModal.tsx`
- Modify: `src/modules/admin/components/AddEditEmployeeModal.tsx`
- Modify: `src/modules/workplace/GrievancePage.tsx`
- Modify: `src/modules/admin/components/LeaveBalancesSection.tsx`
- Modify: `src/modules/admin/components/LeavePoliciesSection.tsx`
- Create: `src/components/common/requiredControlInventory.test.ts`

**Interfaces:**
- Consumes backend leave `employeeName`/`employeeCode`.
- Enforces shared required controls throughout `src/modules`.

- [ ] **Step 1: Rewrite failing On Leave tests**

Require `DashboardOnLeaveTodayDocument`, no org-chart request, `Asha Rao (EMP-0042)`, and no employee UUID. Remove the test accepting long fallback identifiers.

- [ ] **Step 2: Add failing required-control inventory**

Scan `.tsx` under `src/modules`; fail on raw required input/select/textarea with handwritten labels. Initial failures must include travel purpose, employee address, and grievance category.

- [ ] **Step 3: Run tests RED**

```powershell
npm test -- --run src/modules/dashboard/components/OnLeaveToday.test.tsx src/components/common/requiredControlInventory.test.ts
```

- [ ] **Step 4: Replace duplicate leave query and joins**

Select labels in the authored operation, regenerate, import the generated document, and delete ad-hoc query/org-chart join/identifier fallback. Missing labels produce a card-level data error.

- [ ] **Step 5: Migrate required controls**

Use shared primitives with `required`, stable `id`, associated errors, and `aria-describedby`. Preserve payloads and validation timing.

- [ ] **Step 6: Run focused tests GREEN**

```powershell
npm run codegen
npm test -- --run src/modules/dashboard/components/OnLeaveToday.test.tsx src/components/common/requiredControlInventory.test.ts src/components/common/Textarea.test.tsx src/components/common/Select.test.tsx
```

### Task 15: Correct duration rounding and committed whitespace

**Files:**
- Modify: `src/utils/attendanceDuration.ts`
- Create: `src/utils/attendanceDuration.test.ts`
- Modify: `docs/superpowers/plans/2026-08-23-ui-modernization-resume-status.md`

**Interfaces:**
- Produces duration output whose minute remainder is always 0..59.

- [ ] **Step 1: Write failing boundary tests**

Use the existing `formatMinutesAsHhMm(totalMinutes)` signature:

```ts
expect(formatMinutesAsHhMm(59 + 59 / 60)).toBe('1h 00m');
expect(formatMinutesAsHhMm(59)).toBe('0h 59m');
expect(formatMinutesAsHhMm(59.99)).not.toContain('60m');
```

- [ ] **Step 2: Run duration test RED**

```powershell
npm test -- --run src/utils/attendanceDuration.test.ts
```

- [ ] **Step 3: Round total minutes before splitting**

```ts
const roundedMinutes = Math.round(totalMinutes);
const hours = Math.floor(roundedMinutes / 60);
const minutes = roundedMinutes % 60;
```

Preserve existing invalid-input behavior.

- [ ] **Step 4: Remove trailing spaces and verify**

Remove line-end spaces from lines 3-5 of `2026-08-23-ui-modernization-resume-status.md` without changing text.

```powershell
npm test -- --run src/utils/attendanceDuration.test.ts
git diff --check main...HEAD
git diff --check
```

### Task 16: Regenerate artifacts and verify all repositories

**Files:**
- Verify every file changed by Tasks 1-15.

**Interfaces:**
- Validates migration -> entity -> Rust schema -> gateway -> generated client -> React.

- [ ] **Step 1: Check authored/generated boundaries and forbidden patterns**

```powershell
rg -n "query DashboardOnLeaveToday|query AdminAttendanceDailyReport" src --glob '*.ts' --glob '*.tsx'
rg -n "employeeId\.slice|HR_ADMIN.*expense|hasHrAdminLikeRole" src ../hrms-svc/crates
git diff --check
```

Expected: no operation definitions in React callers, no UUID label fallback, and no expense role-name fallback.

- [ ] **Step 2: Run database static checks from `hrms-database`**

```powershell
powershell -NoProfile -File scripts/test-attendance-management-migration.ps1
powershell -NoProfile -File scripts/test-approval-integrity-migration.ps1
powershell -NoProfile -File scripts/test-attendance-time-migration.ps1
powershell -NoProfile -File scripts/test-lifecycle-validation-migration.ps1
node --test tests/liquibase-sql-blocks.test.cjs
```

- [ ] **Step 3: Run Rust verification from `hrms-svc`**

```powershell
cargo fmt --check
cargo test -p kabipay-common
cargo test -p kabipay-auth
cargo test -p kabipay-expense
cargo test -p kabipay-attendance
cargo test -p kabipay-employee
cargo test -p kabipay-notification
cargo test -p kabipay-outbox-worker
cargo check --workspace
```

PostgreSQL integration suites require confirmation of the disposable database URL.

- [ ] **Step 4: Verify gateway and UI**

From `hrms-gateway`:

```powershell
npm test
npm run build
```

From `hrms-ui`:

```powershell
npm run codegen
npm test
npm run lint
npm run build
```

- [ ] **Step 5: Perform runtime acceptance after deployment approval**

Apply migrations to an approved non-production tenant, restart affected Rust subgraphs and gateway, refresh sessions, and verify admin permission loading, role-without-permission denial, scoped attendance labels, concurrency, tenant-local midnight, reports beyond 500 rows, due offboarding, unsafe action rejection, two-decimal enforcement, and exact-24-hour rejection.

- [ ] **Step 6: Recheck all worktrees without committing**

Run `git status --short`, `git diff`, `git diff --cached`, and `git diff --check` separately in `hrms-database`, `hrms-svc`, `hrms-gateway`, and `hrms-ui`. Report staged, unstaged, untracked, test, migration, and runtime evidence; do not commit.
