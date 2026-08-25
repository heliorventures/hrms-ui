# HR Attendance Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver separate employee and HR attendance screens with explicit scoped authorization, target-aware adjustments, immutable audits, and concurrency-safe validation.

**Architecture:** Keep `/attendance` self-only through a target-free GraphQL query. Add `/hr/attendance` backed by scope-filtered cursor queries and dedicated management mutations; execute managed adjustments and audit insertion in one PostgreSQL transaction guarded by employee/date advisory locks.

**Tech Stack:** PostgreSQL, Liquibase XML, SeaORM, Rust/async-graphql, TypeScript schema-stitching gateway, React 18, graphql-request/codegen, Vitest/Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-24-hr-attendance-management-design.md`

## Global Constraints

- Do not create commits; the user reviews and commits manually.
- Do not run Dart or Flutter commands.
- Preserve unrelated staged, unstaged, and untracked work in every repository.
- Ask immediately before token-expensive broad builds, broad test suites, migration execution, or browser acceptance.
- `/attendance` must stay self-only even when the caller has `ALL` attendance scope.
- `/hr/attendance` requires exact permission `attendance:regularize`; role names and `employee:manage` are not substitutes.
- HR/Admin uses `ALL` attendance scope; a manager must be explicitly granted `attendance:regularize` and `TEAM` attendance scope.
- The management date range is at most 92 calendar days; page size defaults to 50 and is capped at 100.
- The management modal requires a 5-500 character reason.
- Never edit `hrms-ui/src/api/graphql/*` manually; edit source `.graphql`/schema extensions and run codegen.
- The management screen cannot delete attendance rows or reopen finalized payroll.

---

### Task 1: Add the attendance audit schema and durable role grants

**Files:**
- Create: `../hrms-database/changelog/migrations/0063_attendance_management/attendance_management.xml`
- Modify: `../hrms-database/changelog/tenant.changelog-master.xml`
- Modify: `../hrms-database/scripts/seed-demo-data.ps1`
- Create: `../hrms-database/scripts/test-attendance-management-migration.ps1`
- Modify: `../hrms-svc/scripts/generate_db_entities.py`
- Generate: `../hrms-svc/crates/kabipay-db-entities/src/tenant/d0063_attendance_management.rs`
- Generate: `../hrms-svc/crates/kabipay-db-entities/src/tenant/mod.rs`

**Interfaces:**
- Produces: tenant table `attendance_adjustment_audit` and generated SeaORM module `d0063_attendance_management::attendance_adjustment_audit`.
- Produces: explicit `attendance:regularize` permission plus `ALL` attendance scope for active `HR_ADMIN`, `TENANT_ADMIN`, and `ORG_ADMIN` roles.
- Preserves: manager access as an explicit assignment; production migration does not grant all line managers automatically.

- [ ] **Step 1: Write the failing migration contract test**

Create a PowerShell test that parses both changelogs and asserts the table, constraints, indexes, include order, and role grants:

```powershell
$ErrorActionPreference = 'Stop'
$migrationPath = Join-Path $PSScriptRoot '..\changelog\migrations\0063_attendance_management\attendance_management.xml'
$masterPath = Join-Path $PSScriptRoot '..\changelog\tenant.changelog-master.xml'

[xml]$migration = Get-Content -Raw -LiteralPath $migrationPath
[xml]$master = Get-Content -Raw -LiteralPath $masterPath
$migrationText = Get-Content -Raw -LiteralPath $migrationPath
$masterText = Get-Content -Raw -LiteralPath $masterPath

if ($migrationText -notmatch 'attendance_adjustment_audit') { throw 'audit table missing' }
if ($migrationText -notmatch 'chk_attendance_adjustment_audit_operation') { throw 'operation check missing' }
if ($migrationText -notmatch 'chk_attendance_adjustment_audit_reason') { throw 'reason check missing' }
if ($migrationText -notmatch "'attendance'") { throw 'attendance resource missing' }
if ($migrationText -notmatch "'regularize'") { throw 'regularize action missing' }
foreach ($roleName in @('HR_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN')) {
    if ($migrationText -notmatch $roleName) { throw "admin grant missing for $roleName" }
}
if ($masterText -notmatch '0063_attendance_management/attendance_management.xml') { throw '0063 include missing' }
Write-Host 'Attendance management migration contract passed.'
```

- [ ] **Step 2: Run the migration test and verify it fails**

Run from `hrms-database`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-attendance-management-migration.ps1
```

Expected: failure because migration `0063` does not exist.

- [ ] **Step 3: Create migration `0063`**

Create `attendance_adjustment_audit` with these non-null columns: `id UUID`, `tenant_id UUID`, `attendance_id UUID`, `target_employee_id UUID`, `actor_user_id UUID`, `operation VARCHAR(10)`, `reason VARCHAR(500)`, `after_values JSONB`, and `created_at TIMESTAMPTZ`; add nullable `before_values JSONB` and `request_id VARCHAR(128)`.

Add database checks and indexes equivalent to:

```sql
CHECK (operation IN ('CREATE', 'UPDATE'))
CHECK (char_length(trim(reason)) BETWEEN 5 AND 500)
CHECK ((operation = 'CREATE' AND before_values IS NULL) OR
       (operation = 'UPDATE' AND before_values IS NOT NULL))

CREATE INDEX idx_attendance_adjustment_audit_attendance
  ON "${schema}".attendance_adjustment_audit (attendance_id, created_at DESC);
CREATE INDEX idx_attendance_adjustment_audit_employee
  ON "${schema}".attendance_adjustment_audit (target_employee_id, created_at DESC);
CREATE INDEX idx_attendance_adjustment_audit_actor
  ON "${schema}".attendance_adjustment_audit (actor_user_id, created_at DESC);
```

Add tenant-local foreign keys to `attendance(id)`, `employee(id)`, and `user(id)` with `ON DELETE RESTRICT`. Rollback drops the audit table only; role grants use intentional no-op rollback so approved authorization is not silently revoked.

In additive SQL, create `attendance:regularize` for active Attendance subscriptions if absent, grant it to active HR/Admin role names, and upsert `permission_scope(resource='attendance', action='regularize', scope_type='ALL')` for those roles.

- [ ] **Step 4: Register the migration and align demo seed data**

Append the `0063` include after `0062`. In `seed-demo-data.ps1`, add a deterministic `TEAM` attendance scope ID and insert:

```sql
('$ScopeAttendanceRegularizeAllId', '$TenantId', '$RoleHrAdminId', 'attendance', 'regularize', 'ALL'),
('$ScopeAttendanceRegularizeTeamLmId', '$TenantId', '$RoleLineManagerId', 'attendance', 'regularize', 'TEAM')
```

Keep the existing explicit line-manager permission in demo data; this seed row represents the approved manager grant, not a production default.

- [ ] **Step 5: Add safe targeted entity generation**

Add an `--only` argument that accepts one migration directory name. In targeted mode, process only that directory, write only its generated module, and merge its `pub mod ...;` line into the existing `mod.rs` without rewriting `prelude.rs` or any other generated module:

```python
parser = argparse.ArgumentParser()
parser.add_argument("--only", help="Generate one migration directory without rewriting other modules")
args = parser.parse_args()

if args.only:
    selected = MIGRATIONS / args.only
    if not selected.is_dir() or not re.match(r"^\d{4}_", selected.name):
        raise SystemExit(f"Unknown tenant migration directory: {args.only}")
    generate_domain(selected)
    merge_module_export(domain_rust_mod(selected.name))
    return
```

Extract the existing per-directory write logic as `generate_domain(directory: Path) -> str`, returning the Rust module name. Implement `merge_module_export(module_name: str) -> None` by reading `mod.rs`, adding `pub mod {module_name};` only when absent, sorting only the contiguous `pub mod d...;` lines, and leaving the header/prelude exports unchanged.

Keep the existing full-generation behavior unchanged when `--only` is omitted. This prevents later `addColumn` migrations from being lost by an unrelated full rewrite.

- [ ] **Step 6: Generate the SeaORM entity from migration source**

Run from `D:\work\heliorventures`:

```powershell
python .\hrms-svc\scripts\generate_db_entities.py --only 0063_attendance_management
```

Expected: `d0063_attendance_management.rs` exposes the audit model with `Json` before/after fields, `tenant/mod.rs` exports `d0063_attendance_management`, and no existing entity module changes.

- [ ] **Step 7: Verify migration and generated source**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-attendance-management-migration.ps1
git diff --check
```

Run the first command in `hrms-database`, then `git diff --check` in both `hrms-database` and `hrms-svc`. Expected: contract PASS and no whitespace errors. Do not apply the migration to a live tenant in this task.

### Task 2: Enforce explicit regularization permission and request identity

**Files:**
- Modify: `../hrms-svc/crates/kabipay-common/src/context.rs`
- Modify: `../hrms-svc/crates/kabipay-common/src/subgraph.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/src/resolvers/attendance_management_auth.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/mod.rs`
- Create: `../hrms-gateway/src/forwardHeaders.ts`
- Modify: `../hrms-gateway/src/server.ts`
- Create: `../hrms-gateway/src/forwardHeaders.test.ts`
- Modify: `../hrms-gateway/package.json`

**Interfaces:**
- Produces: `ClientClaims::can_regularize_attendance_records()` with exact-permission semantics.
- Produces: `attendance_management_auth::{require_regularizer, scope_filter, assert_target_in_scope}`.
- Produces: `ClientRequestHints.request_id: Option<String>` populated from `x-request-id` and forwarded by the gateway.

- [ ] **Step 1: Add failing permission tests**

Extend `context.rs` tests:

```rust
#[test]
fn attendance_regularize_requires_explicit_permission() {
    assert!(client_claims(&[], &[PERM_ATTENDANCE_REGULARIZE])
        .can_regularize_attendance_records());
    assert!(!client_claims(&["HR_ADMIN"], &[])
        .can_regularize_attendance_records());
    assert!(!client_claims(&[], &[PERM_EMPLOYEE_MANAGE])
        .can_regularize_attendance_records());
}
```

Add gateway tests asserting tenant, authorization, forwarded IP, and `x-request-id` are forwarded while unrelated headers are not.
Add `"test": "tsx --test src/**/*.test.ts"` to the gateway scripts so the TypeScript test runs through Node's test runner without adding a dependency.

- [ ] **Step 2: Run focused tests and verify failure**

```powershell
cargo test -p kabipay-common attendance_regularize_requires_explicit_permission
npm test
```

Expected: Rust fails because role/employee fallbacks still grant access; gateway test fails because helper/request ID forwarding is absent.

- [ ] **Step 3: Implement exact permission semantics**

Replace the broad regularization helper body with:

```rust
pub fn can_regularize_attendance_records(&self) -> bool {
    self.has_any_permission(&[PERM_ATTENDANCE_REGULARIZE])
}
```

Do not change unrelated permission helpers.

- [ ] **Step 4: Add scope-aware resolver authorization**

Implement these exact functions in `attendance_management_auth.rs`:

```rust
pub fn require_regularizer(ctx: &Context<'_>) -> Result<()>;
pub async fn scope_filter(
    ctx: &Context<'_>,
    db: &DatabaseConnection,
    tenant_id: Uuid,
) -> Result<EmployeeScopeFilter>;
pub async fn assert_target_in_scope(
    ctx: &Context<'_>,
    db: &DatabaseConnection,
    tenant_id: Uuid,
    target_employee_id: Uuid,
) -> Result<()>;
```

`require_regularizer` checks only `can_regularize_attendance_records`. `scope_filter` reuses `data_scope_from_context`, `resolve_viewer_employee`, and `resolve_employee_scope_filter` for `SCOPE_RES_ATTENDANCE`. `assert_target_in_scope` returns the same `Forbidden("attendance management access denied")` for empty, out-of-scope, and unknown targets.

- [ ] **Step 5: Forward and capture request IDs**

Extract gateway header forwarding into `forwardHeaders.ts`, exporting:

```ts
export function forwardHeaders(request?: Request): Record<string, string>;
```

Forward only `authorization`, `x-tenant-id`, `x-forwarded-for`, `x-real-ip`, and `x-request-id`. Extend `ClientRequestHints` and tenant GraphQL request construction to copy a trimmed `x-request-id` capped at 128 characters.

- [ ] **Step 6: Run focused tests**

```powershell
cargo test -p kabipay-common attendance_regularize
npm test
```

Expected: all focused tests PASS.

### Task 3: Add self-only and managed attendance cursor queries

**Files:**
- Modify: `../hrms-svc/crates/kabipay-attendance/Cargo.toml`
- Create: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_management_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/mod.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/types.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/query.rs`

**Interfaces:**
- Produces: GraphQL `myAttendance(fromDate, toDate, first, after): AttendanceConnection!`.
- Produces: GraphQL `managedAttendance(fromDate!, toDate!, employeeSearch, employeeId, first, after): ManagedAttendanceConnection!`.
- Produces: stable cursor ordered by `(work_date DESC, created_at DESC, id DESC)`.

- [ ] **Step 1: Add failing pure pagination tests**

In `attendance_management_service.rs`, define tests before implementation:

```rust
#[test]
fn cursor_round_trips_complete_sort_key() {
    let key = AttendanceCursor::new(date(2026, 8, 24), timestamp(), uuid());
    assert_eq!(AttendanceCursor::decode(&key.encode()).unwrap(), key);
}

#[test]
fn rejects_ranges_over_ninety_two_days() {
    assert!(validate_date_range(date(2026, 5, 1), date(2026, 8, 2)).is_err());
}

#[test]
fn page_size_defaults_to_fifty_and_caps_at_one_hundred() {
    assert_eq!(page_size(None).unwrap(), 50);
    assert_eq!(page_size(Some(100)).unwrap(), 100);
    assert!(page_size(Some(101)).is_err());
}
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
cargo test -p kabipay-attendance attendance_management_service
```

Expected: compile failure because cursor/range/page helpers are undefined.

- [ ] **Step 3: Implement query service and cursor types**

Add `base64.workspace = true`. Define:

```rust
pub struct AttendancePage<T> {
    pub rows: Vec<T>,
    pub end_cursor: Option<String>,
    pub has_next_page: bool,
}

pub struct ManagedAttendanceRow {
    pub attendance: attendance::Model,
    pub employee_name: String,
    pub employee_code: String,
}

pub async fn list_my_attendance(..., employee_id: Uuid, ...) -> KabiPayResult<AttendancePage<attendance::Model>>;
pub async fn list_managed_attendance(..., scope: &EmployeeScopeFilter, ...) -> KabiPayResult<AttendancePage<ManagedAttendanceRow>>;
```

Fetch `page_size + 1`, truncate the sentinel row, and derive `has_next_page`. Managed SQL must join active, nondeleted employee rows before applying normalized name/code search and scope IDs.

- [ ] **Step 4: Add GraphQL connection DTOs**

Define `AttendanceEdgeDto`, `ManagedAttendanceDto`, `ManagedAttendanceEdgeDto`, `AttendancePageInfoDto`, `AttendanceConnectionDto`, and `ManagedAttendanceConnectionDto`. `ManagedAttendanceDto` includes all current attendance fields plus `employee_name`, `employee_code`, `regularization_status`, `created_at`, and `updated_at`.

- [ ] **Step 5: Add resolvers**

`my_attendance` resolves `employee_id` from the JWT and never reads `resource_scopes`. `managed_attendance` calls `require_regularizer`, obtains the attendance scope filter, parses optional `employeeId`, rejects out-of-scope targets, and delegates all filtering/paging to the service.

- [ ] **Step 6: Run focused query tests and compile check**

```powershell
cargo test -p kabipay-attendance attendance_management_service
cargo check -p kabipay-attendance
```

Expected: pagination tests PASS and attendance package compiles.

### Task 4: Make manual adjustments transactional and auditable

**Files:**
- Create: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_regularization_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/mod.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/services/attendance_service.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/types.rs`
- Modify: `../hrms-svc/crates/kabipay-attendance/src/resolvers/mutation.rs`
- Create: `../hrms-svc/crates/kabipay-attendance/tests/attendance_management_postgres.rs`

**Interfaces:**
- Produces: GraphQL `addManagedAttendanceSegment(input)` and `updateManagedAttendanceSegment(input)`.
- Produces: shared transaction-locked validation for self and managed manual adjustments.
- Consumes: audit entity from Task 1, request ID and authorization helpers from Task 2, managed DTO from Task 3.

- [ ] **Step 1: Write failing unit tests for input and lock behavior**

Add tests for reason trimming/length, deterministic lock order when moving dates, and snapshot serialization:

```rust
#[test]
fn managed_reason_must_be_five_to_five_hundred_characters() {
    assert!(validate_reason("abcd").is_err());
    assert_eq!(validate_reason("  payroll correction  ").unwrap(), "payroll correction");
}

#[test]
fn moved_segment_locks_dates_in_stable_order() {
    assert_eq!(lock_dates(date(2026, 8, 24), date(2026, 8, 20)),
               vec![date(2026, 8, 20), date(2026, 8, 24)]);
}
```

- [ ] **Step 2: Write the PostgreSQL concurrency test**

The test harness must create a unique temporary schema from `KABIPAY_ATTENDANCE_TEST_DATABASE_URL`, create the minimal user/employee/attendance/audit tables, and run two overlapping managed creates concurrently. Assert exactly one succeeds, one returns overlap validation, and exactly one audit row exists. Add a second test that forces audit insertion failure and asserts the attendance write rolls back.

- [ ] **Step 3: Run focused tests and verify failure**

```powershell
cargo test -p kabipay-attendance managed_reason_must_be_five
```

Expected: compile failure because the regularization service is absent. Do not run the PostgreSQL test until explicit approval and a disposable test database URL are available.

- [ ] **Step 4: Implement transaction-scoped locking**

Define:

```rust
pub async fn lock_employee_dates(
    txn: &DatabaseTransaction,
    tenant_id: Uuid,
    employee_id: Uuid,
    dates: &[NaiveDate],
) -> KabiPayResult<()>;
```

Sort/deduplicate dates and execute `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))` for the key `attendance:{tenant}:{employee}:{date}`. Move overlap/daily-cap validation behind a `ConnectionTrait`-based helper that runs after the lock and re-reads current rows.

- [ ] **Step 5: Implement managed create/update plus audit**

Define input DTOs exactly:

```rust
pub struct AddManagedAttendanceSegmentInput {
    pub employee_id: ID,
    pub work_date: NaiveDate,
    pub check_in_time: NaiveTime,
    pub check_out_time: NaiveTime,
    pub reason: String,
}

pub struct UpdateManagedAttendanceSegmentInput {
    pub id: ID,
    pub work_date: NaiveDate,
    pub check_in_time: NaiveTime,
    pub check_out_time: NaiveTime,
    pub reason: String,
    pub expected_updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct AttendanceAuditSnapshot {
    pub work_date: NaiveDate,
    pub check_in_time: NaiveTime,
    pub check_out_time: NaiveTime,
    pub status: String,
    pub source: String,
    pub regularization_status: Option<String>,
    pub updated_at: DateTime<Utc>,
}
```

Serialize `AttendanceAuditSnapshot` for the immutable `before_state` and `after_state` JSON values; do not serialize the whole SeaORM model because that would make the audit contract drift with unrelated entity changes. For create, `before_state` is SQL `NULL` and `after_state` is the snapshot above. The update resolver derives employee identity from the stored attendance row, checks `expected_updated_at`, locks old/new dates, writes `regularization_status='REGULARIZED'`, inserts both snapshots into `attendance_adjustment_audit`, and commits once. Missing/out-of-scope IDs return `attendance management access denied`; stale timestamps use the existing `KabiPayError::Conflict`, which produces GraphQL code `CONFLICT`.

- [ ] **Step 6: Route self-service manual writes through the same lock**

Keep existing self ownership and age-window semantics, but begin a transaction, lock the employee/date key, validate, write, and commit. Self-service writes continue to use `SELF_REPORTED` and do not create management audit rows.

- [ ] **Step 7: Run unit tests and approved integration test**

```powershell
cargo test -p kabipay-attendance attendance_regularization_service
cargo test -p kabipay-attendance --test attendance_management_postgres -- --nocapture
```

Expected: unit tests PASS; when explicitly approved with a disposable database, concurrency and rollback tests PASS.

### Task 5: Add authored GraphQL operations and regenerate UI artifacts

**Files:**
- Modify: `src/api/schema-extensions/hrms-timesheet-attendance.graphql`
- Modify: `src/api/documents/clientOperations.graphql`
- Generate: `src/api/graphql/gql.ts`
- Generate: `src/api/graphql/graphql.ts`
- Generate: `src/api/graphql/index.ts`

**Interfaces:**
- Consumes: exact GraphQL fields from Tasks 3-4.
- Produces: `MyAttendanceBoardDocument`, `ManagedAttendancePageDocument`, `AddManagedAttendanceSegmentDocument`, and `UpdateManagedAttendanceSegmentDocument`.

- [ ] **Step 1: Author operations before extending local schema**

Add operations whose node selections include employee identity, work date/times, status/source, regularization status, created/updated timestamps, and page info. `MyAttendanceBoard` combines `shifts` with `myAttendance`; managed writes request the same row shape as the managed page.

```graphql
query MyAttendanceBoard($fromDate: NaiveDate, $toDate: NaiveDate, $first: Int = 50, $after: String) {
  shifts(limit: 100) { id name startTime endTime workHours isNightShift }
  myAttendance(fromDate: $fromDate, toDate: $toDate, first: $first, after: $after) {
    edges {
      cursor
      node {
        id employeeId workDate checkInTime checkOutTime
        checkInLat checkInLng checkOutLat checkOutLng
        status source lateMinutes
      }
    }
    pageInfo { endCursor hasNextPage }
  }
}

query ManagedAttendancePage(
  $fromDate: NaiveDate!
  $toDate: NaiveDate!
  $employeeSearch: String
  $employeeId: ID
  $first: Int = 50
  $after: String
) {
  managedAttendance(
    fromDate: $fromDate
    toDate: $toDate
    employeeSearch: $employeeSearch
    employeeId: $employeeId
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        id employeeId employeeName employeeCode workDate
        checkInTime checkOutTime status source regularizationStatus
        createdAt updatedAt
      }
    }
    pageInfo { endCursor hasNextPage }
  }
}

mutation AddManagedAttendanceSegment($input: AddManagedAttendanceSegmentInput!) {
  addManagedAttendanceSegment(input: $input) {
    id employeeId employeeName employeeCode workDate checkInTime checkOutTime
    status source regularizationStatus createdAt updatedAt
  }
}

mutation UpdateManagedAttendanceSegment($input: UpdateManagedAttendanceSegmentInput!) {
  updateManagedAttendanceSegment(input: $input) {
    id employeeId employeeName employeeCode workDate checkInTime checkOutTime
    status source regularizationStatus createdAt updatedAt
  }
}
```

- [ ] **Step 2: Run codegen and verify schema failure**

```powershell
npm run codegen
```

Expected: failure until the restarted gateway exposes the new schema or the local schema extension declares it.

- [ ] **Step 3: Add exact additive schema extension**

Mirror the async-graphql names for connection/page-info/node/input types and extend `Query`/`Mutation` with the four fields. Do not redefine existing `Attendance` fields already present in gateway introspection.

```graphql
type AttendancePageInfo { endCursor: String, hasNextPage: Boolean! }
type AttendanceEdge { cursor: String!, node: Attendance! }
type AttendanceConnection { edges: [AttendanceEdge!]!, pageInfo: AttendancePageInfo! }
type ManagedAttendance {
  id: ID!
  employeeId: ID!
  employeeName: String!
  employeeCode: String!
  workDate: NaiveDate!
  checkInTime: NaiveTime
  checkOutTime: NaiveTime
  status: String
  source: String
  regularizationStatus: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
type ManagedAttendanceEdge { cursor: String!, node: ManagedAttendance! }
type ManagedAttendanceConnection {
  edges: [ManagedAttendanceEdge!]!
  pageInfo: AttendancePageInfo!
}
input AddManagedAttendanceSegmentInput {
  employeeId: ID!
  workDate: NaiveDate!
  checkInTime: NaiveTime!
  checkOutTime: NaiveTime!
  reason: String!
}
input UpdateManagedAttendanceSegmentInput {
  id: ID!
  workDate: NaiveDate!
  checkInTime: NaiveTime!
  checkOutTime: NaiveTime!
  reason: String!
  expectedUpdatedAt: DateTime!
}
extend type Query {
  myAttendance(fromDate: NaiveDate, toDate: NaiveDate, first: Int, after: String): AttendanceConnection!
  managedAttendance(fromDate: NaiveDate!, toDate: NaiveDate!, employeeSearch: String, employeeId: ID, first: Int, after: String): ManagedAttendanceConnection!
}
extend type Mutation {
  addManagedAttendanceSegment(input: AddManagedAttendanceSegmentInput!): ManagedAttendance!
  updateManagedAttendanceSegment(input: UpdateManagedAttendanceSegmentInput!): ManagedAttendance!
}
```

Use the existing gateway scalar `NaiveTime`; do not introduce a second time scalar.

- [ ] **Step 4: Regenerate and verify authored/generated boundaries**

```powershell
npm run codegen
rg -n 'MyAttendanceBoardDocument|ManagedAttendancePageDocument|AddManagedAttendanceSegmentDocument|UpdateManagedAttendanceSegmentDocument' src\api\graphql\graphql.ts
git diff --check
```

Expected: codegen PASS, all four exports present, and no handwritten operation strings added to React callers.

### Task 6: Move the employee Attendance screen to the self-only query

**Files:**
- Create: `src/modules/attendance/AttendancePage.test.tsx`
- Modify: `src/modules/attendance/AttendancePage.tsx`
- Modify: `src/modules/attendance/types.ts`
- Create: `src/modules/attendance/components/AttendanceCursorPager.tsx`
- Create: `src/modules/attendance/components/AttendanceCursorPager.test.tsx`

**Interfaces:**
- Consumes: `MyAttendanceBoardDocument` from Task 5.
- Produces: self-only monthly paging with no `employeeId` variable.

- [ ] **Step 1: Write failing page tests**

Mock `useGraphClient` and assert:

```tsx
expect(request).toHaveBeenCalledWith(
  MyAttendanceBoardDocument,
  expect.not.objectContaining({ employeeId: expect.anything() })
);
expect(screen.queryByText('Other Employee')).toBeNull();
```

Add pager tests for disabled Previous on the first cursor, Next using `endCursor`, and returning to the prior cursor from a local cursor stack.

- [ ] **Step 2: Run focused tests and verify failure**

```powershell
npm test -- --run src/modules/attendance/AttendancePage.test.tsx src/modules/attendance/components/AttendanceCursorPager.test.tsx
```

Expected: failure because the page still uses a local generic `attendance` operation and pager is absent.

- [ ] **Step 3: Replace the generic caller**

Delete `AttendanceBoardRangeDocument`. Request `MyAttendanceBoardDocument`, flatten `myAttendance.edges.map(edge => edge.node)`, and use a cursor stack per selected month. Reset cursors whenever month/year changes.

Do not let `canRegularize` broaden self query results. It may continue to bypass only the self-service age window for the signed-in employee when the explicit permission is present.

- [ ] **Step 4: Run focused tests**

```powershell
npm test -- --run src/modules/attendance/AttendancePage.test.tsx src/modules/attendance/components/AttendanceCursorPager.test.tsx src/modules/attendance/components/ManualAttendanceModal.test.tsx
```

Expected: all employee attendance tests PASS.

### Task 7: Register and gate the HR Attendance Management route

**Files:**
- Create: `src/auth/permissionService.test.ts`
- Modify: `src/auth/permissionService.ts`
- Modify: `src/constants/uiText.ts`
- Modify: `src/navigation/navigationModel.ts`
- Modify: `src/routes/appRouteConfig.tsx`
- Modify: `src/routes/routeRegistry.test.ts`

**Interfaces:**
- Produces: capability `route.hr.attendance` and route `/hr/attendance`.
- Consumes: existing `PERMISSIONS.attendanceRegularize` exact permission code.

- [ ] **Step 1: Write failing permission and route tests**

Construct parsed sessions and assert:

```ts
import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

function serviceWith(permissions: string[], jwtRoles: string[] = []) {
  const session: ParsedClientSession = {
    jwtRoles,
    permissions: new Set(permissions),
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
  return createPermissionService(session);
}

expect(serviceWith(['attendance:regularize']).canRoute('/hr/attendance')).toBe(true);
expect(serviceWith([], ['HR_ADMIN']).canRoute('/hr/attendance')).toBe(false);
expect(serviceWith(['employee:manage']).canRoute('/hr/attendance')).toBe(false);
```

Add `{ kind: 'page', path: 'hr/attendance', title: 'Attendance management', tenantPath: '/hr/attendance' }` to the expected route inventory.

- [ ] **Step 2: Run tests and verify failure**

```powershell
npm test -- --run src/auth/permissionService.test.ts src/routes/routeRegistry.test.ts
```

Expected: missing capability/route failures.

- [ ] **Step 3: Implement route, capability, labels, and navigation**

Map `route.hr.attendance` directly to `PERMISSIONS.attendanceRegularize`, register a lazy import of `../modules/hr/HrAttendanceManagementPage`, add `Attendance Management` UI text, and add the HR navigation destination after Leave Approvals.

```ts
// permissionService.ts
| 'route.hr.attendance'

const DIRECT_CAPABILITY_PERMISSIONS = {
  // existing mappings
  'route.hr.attendance': PERMISSIONS.attendanceRegularize,
};

const ROUTE_CAPABILITIES = {
  // existing mappings
  '/hr/attendance': 'route.hr.attendance',
};

// appRouteConfig.tsx
{
  kind: 'page',
  path: 'hr/attendance',
  title: 'Attendance management',
  tenantPath: '/hr/attendance',
  load: () => import('../modules/hr/HrAttendanceManagementPage'),
}
```

- [ ] **Step 4: Run route/navigation tests**

```powershell
npm test -- --run src/auth/permissionService.test.ts src/routes/routeRegistry.test.ts src/navigation/navigationSelectors.test.ts
```

Expected: exact-permission and route inventory tests PASS.

### Task 8: Build the paged HR attendance list

**Files:**
- Create: `src/modules/hr/HrAttendanceManagementPage.tsx`
- Create: `src/modules/hr/HrAttendanceManagementPage.test.tsx`
- Create: `src/modules/hr/attendance/managedAttendanceTypes.ts`
- Create: `src/modules/hr/attendance/ManagedAttendanceFilters.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendanceFilters.test.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendanceTable.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendanceTable.test.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendancePager.tsx`
- Create: `src/modules/hr/attendance/ManagedAttendancePager.test.tsx`

**Interfaces:**
- Consumes: `ManagedAttendancePageDocument` and generated row/page types.
- Produces: `onAdd(employee)` and `onAdjust(row)` callbacks for Task 9.

- [ ] **Step 1: Write failing filter/table tests**

Verify employee label and adjustment target:

```tsx
expect(screen.getByText('Asha Rao')).toBeTruthy();
expect(screen.getByText('EMP-0042')).toBeTruthy();
fireEvent.click(screen.getByRole('button', { name: 'Adjust Asha Rao on 2026-08-24' }));
expect(onAdjust).toHaveBeenCalledWith(row);
```

Verify the filter rejects date ranges over 92 days before requesting, and pager uses opaque cursor values without interpreting them.

- [ ] **Step 2: Write failing page-state tests**

Mock first and second pages. Assert current-month defaults, name/code search variables, cursor reset on filter change, loading/empty/error notices, and refresh after a successful callback.

- [ ] **Step 3: Run focused tests and verify failure**

```powershell
npm test -- --run src/modules/hr/HrAttendanceManagementPage.test.tsx src/modules/hr/attendance
```

Expected: missing component failures.

- [ ] **Step 4: Implement focused read components**

Use generated types for rows. The table columns are Employee, Date, Punch In, Punch Out, Duration, Source, Attendance Status, Regularization Status, and Actions. Employee renders full name with code on the second line. Search is debounced by 300 ms; date filtering applies immediately after valid start/end input.

The page stores a cursor stack, fetches 50 rows, and never requests an employee directory query.

- [ ] **Step 5: Run focused read tests**

```powershell
npm test -- --run src/modules/hr/HrAttendanceManagementPage.test.tsx src/modules/hr/attendance/ManagedAttendanceFilters.test.tsx src/modules/hr/attendance/ManagedAttendanceTable.test.tsx src/modules/hr/attendance/ManagedAttendancePager.test.tsx
```

Expected: list, filters, identity rendering, and paging tests PASS.

### Task 9: Add target-aware managed adjustment modal

**Files:**
- Create: `src/modules/hr/attendance/AttendanceRegularizationModal.tsx`
- Create: `src/modules/hr/attendance/AttendanceRegularizationModal.test.tsx`
- Modify: `src/modules/hr/HrAttendanceManagementPage.tsx`
- Modify: `src/modules/hr/HrAttendanceManagementPage.test.tsx`
- Modify: `src/utils/graphqlUserMessage.ts`
- Modify: `src/utils/graphqlUserMessage.test.ts`

**Interfaces:**
- Consumes: managed add/update documents from Task 5.
- Produces: add/edit flow that always displays immutable employee identity and submits a required reason.

- [ ] **Step 1: Write failing modal tests**

Cover add and edit separately:

```tsx
expect(screen.getByText('Asha Rao (EMP-0042)')).toBeTruthy();
fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Correct biometric outage' } });
expect(request).toHaveBeenCalledWith(AddManagedAttendanceSegmentDocument, {
  input: expect.objectContaining({ employeeId: 'employee-42', reason: 'Correct biometric outage' }),
});
```

For edit, assert the request contains `id` and `expectedUpdatedAt` but no caller-supplied employee ID. Assert 4-character and 501-character reasons are rejected, save errors retain entered fields, and target employee text cannot be edited.

- [ ] **Step 2: Add failing error-message tests**

Assert conflict maps to `This attendance record changed. Refresh it before trying again.` and management denial maps to the generic access message.

- [ ] **Step 3: Run tests and verify failure**

```powershell
npm test -- --run src/modules/hr/attendance/AttendanceRegularizationModal.test.tsx src/utils/graphqlUserMessage.test.ts
```

Expected: missing modal and conflict-message failures.

- [ ] **Step 4: Implement modal and page integration**

Use `validateManualAttendanceSegment` for time/date/overlap client checks, add dedicated reason validation, and call only managed mutations. The selected employee is read-only. On success, invoke `onSaved(employeeName, workDate)`, close, reset the active cursor to the first page, refetch, and show `Attendance updated for {name} on {date}.`

- [ ] **Step 5: Run managed UI tests**

```powershell
npm test -- --run src/modules/hr/HrAttendanceManagementPage.test.tsx src/modules/hr/attendance src/utils/graphqlUserMessage.test.ts
```

Expected: add/edit, validation, conflict, refresh, and identity tests PASS.

### Task 10: Verify schema stitching and four-role behavior

**Files:**
- Verify only: `../hrms-gateway/src/server.ts`
- Verify only: `src/api/client.ts`
- Verify: all files changed in Tasks 1-9

**Interfaces:**
- Validates the complete employee, HR/Admin, allowed manager, and denied manager journeys.

- [ ] **Step 1: Run static integrity checks**

```powershell
git diff --check
rg -n 'AttendanceBoardRangeDocument' src
rg -n 'mutation AddManagedAttendanceSegment|mutation UpdateManagedAttendanceSegment' src --glob '*.tsx' --glob '*.ts'
```

Expected: no whitespace errors, old local self-query constant absent, and managed mutation definitions exist only in authored `.graphql`/generated output, not React callers.

- [ ] **Step 2: Request approval for token-expensive verification**

Ask before running the following focused/broad commands. Do not substitute static checks for these results.

- [ ] **Step 3: Run approved service/UI verification**

```powershell
cargo test -p kabipay-common attendance_regularize
cargo test -p kabipay-attendance attendance_management
cargo check -p kabipay-attendance
npm test
npm run build
npm run codegen
npm test -- --run src/modules/attendance src/modules/hr src/auth/permissionService.test.ts src/routes/routeRegistry.test.ts src/utils/graphqlUserMessage.test.ts
npm run build
```

Run Cargo commands in `hrms-svc`; run the first npm test/build pair in `hrms-gateway`; run the remaining npm commands in `hrms-ui`. Expected: all commands PASS.

- [ ] **Step 4: Restart attendance service and gateway, then verify schema**

After explicit approval, restart the attendance subgraph first and the gateway second. Introspect the stitched gateway and verify `myAttendance`, `managedAttendance`, `addManagedAttendanceSegment`, and `updateManagedAttendanceSegment` are present. Verify `authorization`, `x-tenant-id`, and `x-request-id` reach the attendance service.

- [ ] **Step 5: Execute browser acceptance matrix**

Use the deployed migration and fresh JWTs:

1. Employee: `/attendance` shows only own segments; `/hr/attendance` is denied.
2. HR/Admin with `ALL`: HR screen shows multiple employees with names/codes and can add/edit any employee segment with audit row.
3. Explicit manager with `TEAM`: screen shows self/direct reports and can adjust them.
4. Denied manager or out-of-team target: route/direct GraphQL mutation is rejected without revealing target existence.
5. Two concurrent overlapping adjustments: one succeeds, one conflicts/validates, and only one audit row is committed.

- [ ] **Step 6: Recheck worktrees and hand off without committing**

Run `git status --short` and `git diff --check` separately in `hrms-database`, `hrms-svc`, `hrms-gateway`, and `hrms-ui`. Report changed files, completed checks, deferred checks, migration application status, and browser evidence. Do not commit.
