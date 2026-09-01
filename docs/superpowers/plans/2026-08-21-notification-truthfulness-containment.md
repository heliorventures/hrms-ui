# Notification Truthfulness and Audience Safety Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent announcement-audience expansion, unauthorized notification actions, and failed or capped HRMS resources from appearing valid, empty, or complete.

**Architecture:** Keep the work UI-only. Centralize announcement update intent in a pure helper, authorize notification destinations with the existing route-capability model, and use one retained-query state contract for initial load, refresh, stale data, and failure. Existing GraphQL documents and backend authorization remain authoritative and unchanged.

**Tech Stack:** React 18, TypeScript, React Router, graphql-request, Tailwind CSS, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-20-all-module-ui-ux-modernization-design.md`

## Global Constraints

- Preserve every existing Wave 0 worktree change and avoid unrelated formatting or refactoring.
- Do not change route paths, permission semantics, JWT claims, GraphQL source documents, generated GraphQL output, Rust, Liquibase, database, deployment, or authentication behavior.
- Do not implement recipient preview, staged uploads, server pagination, or a new notification-action schema in this plan.
- UI authorization is defense in depth; route guards and backend authorization remain authoritative.
- Failed lookup and request states must fail closed and must never be rendered as valid empty or unrestricted data.
- Capped results use truthful copy such as “Showing up to 20 recent items. More may be available.” They never claim unseen data exists.
- User-facing errors use `graphQlUserMessage` and contain no API, GraphQL, gateway, database, stack, endpoint, or transport terminology.
- TDD is mandatory: verify RED before production changes and GREEN afterward.
- Do not commit, push, deploy, run codegen, or run Dart/Flutter commands. The user will commit manually after review.

---

### Task 1: Preserve Announcement Role Audience and Require Explicit Clearing

**Files:**

- Create: `src/modules/admin/announcementUpdateInput.ts`
- Create: `src/modules/admin/announcementUpdateInput.test.ts`
- Create: `src/modules/admin/AdminNotificationsPage.test.tsx`
- Modify: `src/modules/admin/AdminNotificationsPage.tsx`
- Modify: `src/modules/admin/components/AnnouncementEditorForm.tsx`
- Consume without modifying: `src/components/common/ConfirmDialog.tsx`

**Interfaces:**

- Preserve the current GraphQL update variable names.
- Produce:

```ts
export interface AnnouncementAudienceUpdateValues {
  existingTargetAudience?: string | null;
  roleCode: string;
  clearRoleAudience: boolean;
  departmentId: string;
  locationId: string;
}

export interface AnnouncementAudienceUpdateInput {
  targetRoleCode: string | null;
  clearRoleAudience: boolean;
  targetDepartmentId: string | null;
  targetLocationId: string | null;
}

export function roleCodeFromTargetAudience(value: string | null | undefined): string;
export function buildAnnouncementAudienceUpdate(
  values: AnnouncementAudienceUpdateValues
): AnnouncementAudienceUpdateInput;
```

- Extend `AnnouncementEditorFormProps` with:

```ts
clearRoleAudience: boolean;
existingRoleCode: string;
onClearRoleAudienceChange: (value: boolean) => void;
```

- [ ] **Step 1: Write failing pure-contract tests**

Add these cases to `announcementUpdateInput.test.ts`:

```ts
it('extracts and normalizes a stored ROLE audience', () => {
  expect(roleCodeFromTargetAudience('ROLE:hr_admin')).toBe('HR_ADMIN');
});

it('preserves an existing role unless explicit clearing is selected', () => {
  expect(buildAnnouncementAudienceUpdate({
    existingTargetAudience: 'ROLE:HR_ADMIN',
    roleCode: 'HR_ADMIN',
    clearRoleAudience: false,
    departmentId: '',
    locationId: '',
  })).toEqual({
    targetRoleCode: 'HR_ADMIN',
    clearRoleAudience: false,
    targetDepartmentId: null,
    targetLocationId: null,
  });
});

it('clears a stored role only after explicit confirmation', () => {
  expect(buildAnnouncementAudienceUpdate({
    existingTargetAudience: 'ROLE:HR_ADMIN',
    roleCode: '',
    clearRoleAudience: true,
    departmentId: '',
    locationId: '',
  })).toMatchObject({ targetRoleCode: null, clearRoleAudience: true });
});
```

- [ ] **Step 2: Write failing page interaction tests**

In `AdminNotificationsPage.test.tsx`, mock the GraphQL client and assert:

1. `targetAudience: 'ROLE:HR_ADMIN'` hydrates the role field as `HR_ADMIN`.
2. Editing only the title sends `targetRoleCode: 'HR_ADMIN'` and `clearRoleAudience: false`.
3. Selecting “Clear role targeting” displays a danger explanation and is the only path that sends `clearRoleAudience: true`.
4. Adding a department retains `targetRoleCode: 'HR_ADMIN'` and sends the selected department ID.
5. Cancel edit clears the explicit-clear state and restores create-mode defaults.
6. Clearing a stored role or adding a broader department/location does not send the mutation until the administrator confirms the before/after scope summary.

- [ ] **Step 3: Run RED verification**

Run:

```powershell
npx vitest run src/modules/admin/announcementUpdateInput.test.ts src/modules/admin/AdminNotificationsPage.test.tsx
```

Expected: FAIL because the helper, edit hydration, and explicit-clear control do not exist.

- [ ] **Step 4: Implement the pure audience update contract**

`roleCodeFromTargetAudience` returns a normalized code only for values beginning with `ROLE:`. `buildAnnouncementAudienceUpdate` must follow this precedence:

```ts
const storedRoleCode = roleCodeFromTargetAudience(values.existingTargetAudience);
const enteredRoleCode = values.roleCode.trim().toUpperCase();
const roleCode = values.clearRoleAudience ? '' : enteredRoleCode || storedRoleCode;

return {
  targetRoleCode: roleCode || null,
  clearRoleAudience: Boolean(storedRoleCode) && values.clearRoleAudience,
  targetDepartmentId: values.departmentId.trim() || null,
  targetLocationId: values.locationId.trim() || null,
};
```

- [ ] **Step 5: Integrate explicit edit intent**

`startEdit` hydrates `annRole` from `targetAudience` and sets `clearRoleAudience` to `false`. `AnnouncementEditorForm` shows the clear control only while editing a stored role. Selecting it disables the role field and displays: “Clearing role targeting can expand who receives this announcement. Review the remaining audience before updating.” Do not infer intent from an empty input.

When a stored role is cleared, or department/location targeting is added to a role-targeted announcement, intercept submit with the existing `ConfirmDialog`. Show the original scope and proposed scope in text; send the mutation only after confirmation. This is a scope summary, not a recipient preview or count.

- [ ] **Step 6: Run GREEN verification**

Run the Step 3 command. Expected: PASS.

- [ ] **Step 7: Record evidence without committing**

Run `git diff --check` and record changed files. Do not commit.

---

### Task 2: Fail Closed When Announcement Audience Options Are Unavailable

**Files:**

- Create: `src/modules/notifications/CreateAnnouncementModal.test.tsx`
- Modify: `src/modules/notifications/CreateAnnouncementModal.tsx`

**Interfaces:**

- Preserve `CreateAnnouncementModalProps { isOpen: boolean; onClose: () => void; onCreated?: () => void }`.
- Add local state:

```ts
type AudienceOptionsState =
  | { phase: 'loading'; departments: [] }
  | { phase: 'loaded'; departments: OrgDepartmentsQuery['departments'] }
  | { phase: 'failed'; departments: []; message: string };
```

- [ ] **Step 1: Write failing modal tests**

Cover these behaviors:

```ts
it('blocks HR publication when department options fail to load', async () => {
  // Reject OrgDepartmentsDocument.
  // Assert the failure notice and Retry button are visible.
  // Assert Publish is disabled and CreateAnnouncementDocument is never requested.
});

it('retains entered announcement values while audience options retry', async () => {
  // Type title/body, fail the lookup, then resolve Retry.
  // Assert title/body remain and targeting controls become available.
});

it('does not block employee team posts on HR-only audience lookup state', async () => {
  // Render without notification-management permission.
  // Assert buildCreateAnnouncementInput still forces employeePost and strips HR targeting.
});
```

- [ ] **Step 2: Run RED verification**

Run:

```powershell
npx vitest run src/modules/notifications/CreateAnnouncementModal.test.tsx src/modules/notifications/createAnnouncementInput.test.ts
```

Expected: FAIL on missing failed/retry state and fail-closed submission.

- [ ] **Step 3: Implement the audience-options state machine**

On modal open, HR composers enter `loading`; successful lookup enters `loaded`; failures enter `failed` with `graphQlUserMessage`. A Retry action calls the same loader. Disable HR targeting controls and Publish unless phase is `loaded`. Keep title, body, dates, role, files, and audience input untouched during retry.

Use this recovery copy:

```text
Audience options could not be loaded. Your announcement has not been published.
```

- [ ] **Step 4: Preserve non-HR team-post behavior**

The employee/team-post path must not depend on HR-only department lookup and must preserve the existing `buildCreateAnnouncementInput` stripping tests.

- [ ] **Step 5: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 6: Record evidence without committing**

Run `git diff --check`. Do not commit.

---

### Task 3: Suppress Unknown or Unauthorized Notification Destinations

**Files:**

- Create: `src/modules/notifications/components/PrivateNotificationList.test.tsx`
- Modify/Test: `src/utils/actionUrl.ts`, `src/utils/actionUrl.test.ts`
- Modify: `src/modules/notifications/components/PrivateNotificationList.tsx`
- Modify/Test: `src/components/layout/NotificationDropdown.tsx`, `src/components/layout/NotificationDropdown.test.tsx`

**Interfaces:**

- Preserve `normalizeInternalActionUrl`, `notificationActionDestination`, and `directNotificationActionUrl` signatures.
- Add:

```ts
import type { NavAccessOptions } from '../auth/navAccess';

export function authorizedNotificationActionUrl(
  url: string | null | undefined,
  access: NavAccessOptions
): string | null;
```

- The helper normalizes the URL, removes query/hash for permission lookup, and returns the original normalized destination only when `canAccessTenantPath(pathname, access)` is true.

- [ ] **Step 1: Write failing authorization tests**

Add cases for malformed, external, unknown, dynamic, unauthorized, and authorized static routes:

```ts
expect(authorizedNotificationActionUrl('/admin/notifications', employeeAccess)).toBeNull();
expect(authorizedNotificationActionUrl('/notifications?filter=unread', employeeAccess))
  .toBe('/notifications?filter=unread');
expect(authorizedNotificationActionUrl('https://outside.example/path', employeeAccess)).toBeNull();
expect(authorizedNotificationActionUrl('/organization/employees/123', employeeAccess)).toBeNull();
```

- [ ] **Step 2: Write failing component tests**

1. `PrivateNotificationList` must not render destination text or a View link for an unauthorized route.
2. An authorized route renders one styled `Link`; it must not nest a `<button>` inside an `<a>`.
3. `NotificationDropdown` marks the item read and navigates to `/notifications` when its action is absent or unauthorized.
4. Tenant/session changes re-evaluate action visibility using current access.

- [ ] **Step 3: Run RED verification**

Run:

```powershell
npx vitest run src/utils/actionUrl.test.ts src/modules/notifications/components/PrivateNotificationList.test.tsx src/components/layout/NotificationDropdown.test.tsx
```

Expected: FAIL because destination authorization is not checked.

- [ ] **Step 4: Implement permission-aware destination resolution**

Use `canAccessTenantPath` for the normalized pathname. Do not guess dynamic-route access. Route guards and backend authorization remain authoritative. In `PrivateNotificationList`, use one `Link` with button classes. In the dropdown, fall back to `/notifications` after read-state handling.

- [ ] **Step 5: Run GREEN verification**

Run the Step 3 command. Expected: PASS.

- [ ] **Step 6: Record the backend dependency**

Record that authoritative delivery-time compatibility requires a server-owned action type/target/capability contract. Do not add that contract here.

---

### Task 4: Add a Retained Query State Contract

**Files:**

- Create: `src/hooks/useRetainedQuery.ts`
- Create: `src/hooks/useRetainedQuery.test.tsx`

**Interfaces:**

```ts
export type RetainedQueryPhase =
  | 'initial-loading'
  | 'initial-error'
  | 'ready'
  | 'refreshing'
  | 'stale-error';

export interface RetainedQueryResult<T> {
  data: T | null;
  error: string | null;
  phase: RetainedQueryPhase;
  refresh: () => Promise<void>;
}

export function useRetainedQuery<T>(
  load: () => Promise<T>,
  toMessage?: (error: unknown) => string
): RetainedQueryResult<T>;
```

- [ ] **Step 1: Write failing hook tests**

Test initial success, initial failure, refresh, retained data after refresh failure, recovery after stale error, loader identity change, unmount, and out-of-order completion. The decisive assertion is:

```ts
expect(result.current.data).toEqual(lastSuccessfulData);
expect(result.current.phase).toBe('stale-error');
```

- [ ] **Step 2: Run RED verification**

Run `npx vitest run src/hooks/useRetainedQuery.test.tsx`.

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement retained state and stale-request protection**

Use a monotonically increasing request ID in a ref. Automatic load and manual refresh share one request function. Only the latest request may update state. Initial failure has no data; refresh failure retains the last success. Default message translation is `graphQlUserMessage`.

- [ ] **Step 4: Run GREEN verification**

Run the Step 2 command. Expected: PASS with no unhandled rejection or state-after-unmount warning.

---

### Task 5: Apply Truthful States to the Notification Page and Header Preview

**Files:**

- Create: `src/modules/notifications/useNotificationBoard.test.tsx`
- Create: `src/modules/notifications/NotificationsPage.test.tsx`
- Modify: `src/modules/notifications/useNotificationBoard.ts`
- Modify: `src/modules/notifications/NotificationsPage.tsx`
- Modify/Test: `src/components/layout/useNotificationDropdownData.ts`, `src/components/layout/NotificationDropdown.tsx`, `src/components/layout/NotificationDropdown.test.tsx`

**Interfaces:**

- Preserve all existing `useNotificationBoard()` return fields.
- Add:

```ts
phase: RetainedQueryPhase;
hasLoadedData: boolean;
announcementsMayBeCapped: boolean;
notificationsMayBeCapped: boolean;
```

- Keep `NOTIFICATION_BOARD_LIMIT = 20`, preview limit `15`, and department lookup limit `100` unchanged.

- [ ] **Step 1: Write failing board and page tests**

Assert:

1. Initial board failure renders only an actionable failure state and Retry—not empty lists.
2. Successful empty data renders the empty states.
3. Refresh failure retains both lists and displays “Showing the last loaded data.” with Retry.
4. A list with exactly 20 items displays “Showing up to 20 recent items. More may be available.”
5. Mark-read refresh failure retains the successfully updated/previous board and reports recovery.

- [ ] **Step 2: Run RED verification**

Run:

```powershell
npx vitest run src/hooks/useRetainedQuery.test.tsx src/modules/notifications/useNotificationBoard.test.tsx src/modules/notifications/NotificationsPage.test.tsx src/components/layout/NotificationDropdown.test.tsx
```

Expected: FAIL on conflated empty/error state and missing stale/cap metadata.

- [ ] **Step 3: Adopt the retained-query contract**

Use `AsyncState` for initial load/error, `PageNotice` for retained-data warnings, and existing lists only when a successful payload exists. Department-name lookup failure may degrade labels to IDs/neutral audience copy, but must not convert board failure into empty data.

- [ ] **Step 4: Add honest cap messaging**

Show cap guidance when a returned collection length equals its request limit. Phrase it as a possibility, not proof of additional records.

- [ ] **Step 5: Preserve header-preview behavior**

The bell keeps independent unread-count and preview states, preserves last successful preview after refresh failure, and uses the authorized destination helper from Task 3.

- [ ] **Step 6: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

---

### Task 6: Apply Truthful States to Dashboard Resources

**Files:**

- Create: `src/modules/dashboard/components/NotificationsPreview.test.tsx`
- Create: `src/modules/dashboard/components/LeaveBalanceCard.test.tsx`
- Create: `src/modules/dashboard/components/OnLeaveToday.test.tsx`
- Create: `src/modules/dashboard/components/UpcomingHolidays.test.tsx`
- Create: `src/modules/dashboard/components/PunchInOut.test.tsx`
- Modify: corresponding five production components.

**Current caps:**

- Notifications Preview: 20 each in full-height mode; 3 each in compact mode.
- Leave Balance: 20 balances and 50 leave types.
- On Leave Today: 50 leave requests, 500 org-chart rows, and 50 leave types.
- Upcoming Holidays: 12 holidays.
- Punch In/Out: no source-visible cap; do not invent one.

- [ ] **Step 1: Write failing state tests for each card**

Every data-loading card covers:

```text
initial failure -> actionable error, never empty copy
successful empty -> intentional empty copy
refresh failure after success -> retained data plus stale warning
retry after failure -> loading then ready
exact configured cap -> “up to N; more may be available”
```

`PunchInOut` covers summary load failure/retry and preserves its separate mutation busy/error behavior without cap copy.

- [ ] **Step 2: Run RED verification**

Run:

```powershell
npx vitest run src/modules/dashboard/components/NotificationsPreview.test.tsx src/modules/dashboard/components/LeaveBalanceCard.test.tsx src/modules/dashboard/components/OnLeaveToday.test.tsx src/modules/dashboard/components/UpcomingHolidays.test.tsx src/modules/dashboard/components/PunchInOut.test.tsx
```

Expected: FAIL where requests currently collapse to null/empty or lack retry/cap treatment.

- [ ] **Step 3: Convert each aggregate loader**

Wrap each independent aggregate request in `useRetainedQuery`. Preserve existing data transformation and permission behavior. Where requests are independent, start them together with `Promise.all` rather than serial awaits. Use shared `AsyncState` and `PageNotice`; do not fork local loading/error components.

- [ ] **Step 4: Preserve successful data and safe actions**

Create/team-post success may trigger refresh, but refresh rejection must enter `stale-error` without an unhandled promise. Retry controls call `refresh` once and busy controls prevent double submission.

- [ ] **Step 5: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

---

### Task 7: Integrated Containment Verification

**Files:** All files changed by Tasks 1–6.

- [ ] **Step 1: Run all focused containment tests**

Run:

```powershell
npx vitest run src/modules/admin/announcementUpdateInput.test.ts src/modules/admin/AdminNotificationsPage.test.tsx src/modules/notifications/CreateAnnouncementModal.test.tsx src/utils/actionUrl.test.ts src/modules/notifications/components/PrivateNotificationList.test.tsx src/components/layout/NotificationDropdown.test.tsx src/hooks/useRetainedQuery.test.tsx src/modules/notifications/useNotificationBoard.test.tsx src/modules/notifications/NotificationsPage.test.tsx src/modules/dashboard/components/NotificationsPreview.test.tsx src/modules/dashboard/components/LeaveBalanceCard.test.tsx src/modules/dashboard/components/OnLeaveToday.test.tsx src/modules/dashboard/components/UpcomingHolidays.test.tsx src/modules/dashboard/components/PunchInOut.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run scoped lint and production compilation**

Run targeted ESLint on changed files, then `npm run build`. Record repository-baseline lint failures separately; no new scoped error is accepted.

- [ ] **Step 3: Run static safety scans**

```powershell
rg -n "clearRoleAudience|ROLE:|targetRoleCode" src/modules/admin
rg -n "No Notifications|No One Is On Leave|No holidays|No balances" src/modules/dashboard src/modules/notifications
rg -n "normalizeInternalActionUrl|authorizedNotificationActionUrl" src
git diff --check
git status --short
```

Manually explain every match and confirm no initial-error branch reaches valid empty copy.

- [ ] **Step 4: Browser verification**

Exercise role-audience edit preservation/clear, HR lookup failure/retry, employee team post, unauthorized notification destination, initial and refresh failures, exact-cap datasets, keyboard focus, 320px reflow, dark mode, and 200% zoom. Capture unresolved backend limits.

- [ ] **Step 5: Final review without commit**

Run an independent static review over the exact changed-file manifest. Resolve all Critical and Important findings. Do not commit, push, or deploy.

## Execution and Parallelization Boundaries

| Producer | Consumer/shared file | Required ordering |
|---|---|---|
| Task 1 audience helper | `AdminNotificationsPage.tsx` and `AnnouncementEditorForm.tsx` | One agent owns Task 1 end to end because both files are already dirty. |
| Task 2 audience-options state | `CreateAnnouncementModal.tsx` | Independent of Task 1, but one agent owns the existing dirty modal and its new test. |
| Task 3 authorized destination helper | `NotificationDropdown.tsx` and its existing untracked test | Task 3 completes before Task 5 modifies the same dropdown files. |
| Task 4 `useRetainedQuery` | Tasks 5 and 6 | Task 4 and its tests pass before either consumer starts. |
| Task 5 notification state | Notification page/header files | May run in parallel with Task 6 only after Tasks 3 and 4 are complete. |
| Task 6 dashboard state | Dashboard card files | May run in parallel with Task 5; it does not edit notification page/header files. |
| Tasks 1–6 | Task 7 integration | All task reviews are clean before integrated verification. |

No agent may modify Wave 0 `AsyncState`, overlay, route, permission, generated GraphQL, or shared form contracts during this plan. A required shared-contract change stops that task and returns to the central owner for a scope ruling.

## Backend Dependencies Recorded but Excluded

- Recipient preview and audience count.
- Delivery-time recipient/action compatibility.
- Cursor pagination or completeness metadata.
- Staged upload, server file-signature validation, malware scanning, and authorized retrieval.
- Structured role-audience fields beyond the current `ROLE:<code>` string.

These dependencies do not authorize backend changes. The containment UI remains honest and fail-closed until separately approved contracts exist.
