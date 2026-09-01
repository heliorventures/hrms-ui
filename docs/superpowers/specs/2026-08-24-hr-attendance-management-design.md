# HR Attendance Management Design

Date: 2026-08-24  
Status: Approved

## Context

The current `/attendance` page is described as the signed-in employee's attendance view, but it uses the generic scope-aware `attendance` query. A privileged caller can therefore receive multiple employees' punches on a screen that does not identify the employee clearly. The existing manual-attendance mutations also mix responsibilities: creating a segment is tied to the signed-in employee, while editing can cross employee ownership through a broad privilege path.

This design separates employee self-service from attendance administration at the route, GraphQL, service, authorization, and audit layers.

## Goals

- Keep `/attendance` exclusively for the signed-in employee's punches.
- Add `/hr/attendance` for HR/Admin attendance management.
- Show employee name and employee code with every managed punch segment.
- Give HR/Admin access to all tenant employees.
- Give managers access only when they have `attendance:regularize` and an explicit `TEAM` attendance data scope.
- Allow authorized users to add a missing segment or edit an existing segment for an employee in scope.
- Preserve the existing attendance validation rules.
- Make every management adjustment attributable and immutable in an audit trail.
- Prevent concurrent adjustments from creating overlapping or inconsistent segments.

## Non-goals

- Deleting attendance segments.
- Adding a new attendance approval workflow.
- Replacing the existing Reports and Analytics attendance report.
- Changing live punch, geofence, or IP-allowlist behavior.
- Changing timesheet submission or approval behavior.
- Automatically reopening finalized payroll periods.

## Chosen Architecture

### Employee self-service

`/attendance` remains in the primary employee navigation. It calls an explicitly self-scoped query that resolves the employee from the authenticated session and does not accept an `employeeId` argument. Possessing an HR role or an `ALL` data scope cannot broaden this query.

The page continues to show the employee's month view, statistics, punch segments, and self-service missed-punch controls. Existing self-service date-window rules remain in force.

### HR attendance management

`/hr/attendance` is a separate HR module. Route and navigation visibility require the explicit `attendance:regularize` permission.

The screen defaults to the current calendar month and shows punch segments for every employee in the caller's attendance data scope. Each row contains:

- employee full name;
- employee code;
- work date;
- punch-in and punch-out times;
- duration;
- source;
- attendance status;
- regularization status; and
- an Adjust action.

Filters include an employee name/code search and a date range. The result is cursor-paginated and never loads the complete employee directory or complete attendance history into the browser.

The existing `/admin/reports` attendance view stays read-only and continues to serve reporting and export needs.

## Authorization Model

Both UI gating and backend enforcement use explicit permission and data-scope contracts.

| Caller | Required permission | Attendance scope | Effective access |
| --- | --- | --- | --- |
| Employee | Authenticated linked employee | Any | Own attendance only through the self query; `attendance:punch_self` remains required for punch writes |
| HR/Admin | `attendance:regularize` | `ALL` | All active tenant employees |
| Manager | `attendance:regularize` | `TEAM` | Self and direct reports returned by the existing team-scope resolver |
| Other caller | Missing permission or scope | Any | No management route, query, or mutation access |

The seed and tenant migration must grant `attendance:regularize` plus `ALL` attendance scope to the intended `HR_ADMIN`, `TENANT_ADMIN`, and `ORG_ADMIN` roles. Managers receive no implicit access from their role name or employee-management permission; they require the explicit permission and `TEAM` scope assignment.

For every management query and mutation, the backend must:

1. require authenticated tenant and user claims;
2. require the explicit `attendance:regularize` permission;
3. resolve the current attendance data scope;
4. resolve the caller's employee relationship where the scope requires it; and
5. reject target employees that are outside the resulting scope.

An out-of-scope target uses the same generic denial response as a nonexistent target so the API does not reveal employee membership.

## GraphQL Contracts

### Self query

`myAttendance(fromDate, toDate, first, after)` returns only attendance rows belonging to the authenticated employee. It accepts no target employee identifier. It uses the same stable cursor order as the management query; `first` defaults to 50 and is capped at 100.

### Management query

`managedAttendance(fromDate!, toDate!, employeeSearch, employeeId, first, after)` returns a connection whose nodes include both punch data and employee identity.

Rules:

- `fromDate` must not be after `toDate`.
- The requested range is limited to 92 calendar days.
- `first` defaults to 50 and is capped at 100.
- Results sort by work date descending, creation timestamp descending, then attendance ID descending.
- The cursor is opaque and encodes the complete stable sort key.
- Employee search matches normalized full name or employee code after authorization scope has been applied.
- An optional `employeeId` filter is accepted only when that employee is in scope.

### Management mutations

`addManagedAttendanceSegment(input)` accepts target employee ID, work date, in/out times, and a required reason.

`updateManagedAttendanceSegment(input)` accepts attendance segment ID, new work date/in/out times, required reason, and `expectedUpdatedAt` for optimistic conflict detection. The server derives the target employee from the stored segment rather than trusting a caller-provided employee ID.

Both mutations return the updated managed-attendance node, including employee identity and `updatedAt`.

The existing self-service add/update mutations remain self-scoped and must not be used by the management screen.

## UI Components and Data Flow

The HR module contains focused components rather than adding role branches to the employee page:

- `HrAttendanceManagementPage` owns filters, paging, loading, refresh, and notices.
- `ManagedAttendanceFilters` provides date-range and employee name/code filtering.
- `ManagedAttendanceTable` always renders employee name and code and opens the selected row.
- `AttendanceRegularizationModal` handles add/edit management operations and always displays the target employee as read-only context.

To add a missing segment, the user must first select an employee from a scope-filtered search result. To edit a segment, the target is inherited from the selected row. The modal requires a nonblank reason of 5 to 500 characters.

After a successful mutation, the current page is refreshed and a success notice identifies the employee and date. The modal remains open on validation errors and focuses the affected field.

## Transaction and Concurrency Safety

Management adjustments execute atomically in one database transaction.

1. Recheck permission and data scope inside the request.
2. Resolve the target employee and current segment, where applicable.
3. Acquire a transaction-scoped lock for the tenant, employee, and work date.
4. For an edit that changes the date, lock both old and new date keys in deterministic order.
5. Compare `expectedUpdatedAt` for edits.
6. Re-read that employee's segments for the affected date or dates.
7. Validate the requested segment.
8. Insert or update the attendance row.
9. Insert the immutable audit record.
10. Commit both writes together.

The lock must cover the empty-day case, so locking only existing attendance rows is insufficient. On PostgreSQL, a transaction-scoped advisory lock derived from tenant ID, employee ID, and work date is suitable. The same locked validation helper should be used by self-service manual adjustments so both paths share the concurrency guarantee.

Existing validation remains authoritative:

- no future work date;
- punch-in precedes punch-out for a same-day segment;
- no overlap with another segment for the employee/date;
- no manual adjustment while an open segment exists for the day; and
- total completed attendance remains below 24 hours for the day.

The HR management path bypasses only the employee self-service age window. It does not bypass time-ordering, overlap, open-punch, or daily-cap validation.

## Audit Trail

Create a dedicated immutable attendance-adjustment audit table rather than relying only on `attendance.regularization_status`.

Each audit row stores:

- tenant ID;
- attendance segment ID;
- target employee ID;
- acting user ID;
- operation (`CREATE` or `UPDATE`);
- required reason;
- previous attendance values as structured JSON, null for create;
- resulting attendance values as structured JSON;
- nullable request/correlation ID copied from the request context; and
- creation timestamp.

There is no update or delete mutation for this audit table. Indexes support lookup by attendance segment, target employee plus creation time, and actor plus creation time. If the audit insert fails, the attendance write rolls back.

Managed creates and edits set `regularization_status` to `REGULARIZED` while preserving the immutable audit details separately.

## Error Handling

- Missing permission, out-of-scope target, or nonexistent target: generic access-denied response.
- Invalid date range or reason: field-level validation error.
- Future date, invalid time order, overlap, open punch, or daily cap: existing actionable attendance validation message.
- `expectedUpdatedAt` mismatch: conflict response instructing the user to refresh before retrying.
- Stale segment after list load: refresh the current page without exposing another employee's data.
- Audit or attendance persistence failure: roll back and return a generic save-failed message with correlation ID logging.

The UI does not optimistically alter attendance rows before the mutation succeeds.

## Testing Strategy

### Rust service and resolver tests

- The self query cannot return another employee's attendance, including for an HR/Admin caller.
- A caller without `attendance:regularize` cannot call management queries or mutations.
- An HR/Admin caller with `ALL` scope can list and adjust any tenant employee.
- A manager with explicit permission and `TEAM` scope can adjust self/direct reports and is denied for employees outside the team.
- Role names and `employee:manage` alone do not authorize management operations.
- Employee search and explicit employee filtering cannot escape scope.
- Add and edit preserve all attendance validations.
- Concurrent overlapping requests serialize and one is rejected.
- Moving a segment between dates locks and validates both dates.
- An optimistic-lock mismatch returns conflict without writing attendance or audit data.
- Audit rows capture actor, target, reason, operation, and exact before/after values.
- Audit failure rolls back the attendance change.
- Cursor pagination has stable ordering without duplicates or omissions.

### React and route tests

- `/attendance` renders only self data and never submits a target employee ID.
- `/hr/attendance` route and navigation visibility require `attendance:regularize`.
- The management table renders employee name and code on every row.
- Filters, paging, empty state, partial-error state, and refresh operate correctly.
- Add requires a selected employee; edit preserves the row's employee identity.
- The management modal displays immutable employee context and requires a valid reason.
- Mutations use the dedicated managed operations.
- Validation, authorization, conflict, and persistence errors produce the intended notices.
- Successful save refreshes the active page and closes the modal.

### Schema and integration verification

- Edit source `.graphql` documents and codegen configuration, never generated output directly.
- Regenerate GraphQL types/documents after the stitched schema includes the new contracts.
- Verify the gateway exposes the self and management operations with tenant/auth headers preserved.
- Run focused Rust tests, focused React tests, GraphQL codegen, TypeScript checks, service compile checks, and browser journeys for employee, HR/Admin, allowed manager, and denied manager roles.

Token-expensive builds or broad test suites require explicit approval immediately before execution. No Dart or Flutter command is part of this work.

## Migration and Deployment Order

1. Add the immutable audit table and supporting indexes.
2. Add or align role permissions and attendance data scopes.
3. Deploy the attendance service with additive GraphQL contracts.
4. Refresh the stitched gateway schema and regenerate UI GraphQL artifacts.
5. Deploy the UI route and components.
6. Sign out and sign in for users whose JWT permissions or scopes changed.
7. Run the four-role browser acceptance matrix: employee, HR/Admin, explicitly granted team manager, and denied manager.

The schema changes are additive until the UI has moved to the explicit self query. Any cleanup of the old generic attendance caller is a later compatibility decision after usage is re-audited.

## Acceptance Criteria

- Employees see only their own attendance on `/attendance`.
- HR/Admin users see all tenant employee punches on `/hr/attendance`, with employee name and code visible.
- Managers see and adjust only their explicitly scoped team.
- Unauthorized users cannot discover or mutate managed attendance through routes or direct GraphQL calls.
- Authorized users can add and edit managed segments with a required reason.
- Concurrent writes cannot create overlapping attendance segments.
- Every successful management adjustment has a durable, immutable actor and before/after audit record.
- Existing self-service attendance, live punch, reports, timesheet, and payroll-finalization behavior remain unchanged outside the stated integration points.
