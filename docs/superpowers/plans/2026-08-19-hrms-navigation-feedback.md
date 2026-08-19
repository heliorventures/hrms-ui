# HRMS Navigation and User Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver one permission-aware navigation model, an accessible responsive app shell, consistent user feedback, and a fully migrated Attendance adjustment journey.

**Architecture:** Navigation definitions become data consumed by pure selectors, the sidebar, and the command palette while existing route guards remain authoritative. Feedback continues to translate failures at `graphQlUserMessage`, then renders through enhanced shared notices; Attendance becomes the first complete journey using those contracts.

**Tech Stack:** React 18, TypeScript, React Router 6, Tailwind CSS, Vitest, React Testing Library, user-event, jsdom.

## Global Constraints

- Work only in `D:\work\heliorventures\hrms-ui`.
- Preserve the existing unrelated changes in `.gitignore`, `src/api/graphql/fragment-masking.ts`, and `src/api/graphql/index.ts`.
- Do not change GraphQL schemas, generated GraphQL output, Rust services, database migrations, RBAC semantics, or route authorization behavior.
- Do not run Dart or Flutter commands.
- Do not commit or push. The user will review and commit manually.
- Keep user-facing copy free of API, GraphQL, backend, database, SQL, constraint, stack-trace, exception, resolver, and HTTP-status terminology.
- Keep touched components below the project's 400-line maintainability target by extracting focused helpers/components.
- Browser verification remains pending unless an in-app browser becomes attached.

---

## File Structure

**Create**

- `vitest.config.ts` — DOM-enabled component-test configuration.
- `src/navigation/navigationModel.ts` — typed sections and destinations; the single navigation source.
- `src/navigation/navigationSelectors.ts` — pure access, search, grouping, and active-section behavior.
- `src/navigation/navigationSelectors.test.ts` — selector regression coverage.
- `src/components/layout/navigationPreference.ts` — versioned desktop-collapse persistence.
- `src/components/layout/navigationPreference.test.ts` — storage fallback and persistence coverage.
- `src/components/layout/SidebarDestination.tsx` — expanded/compact destination rendering.
- `src/components/layout/SidebarSection.tsx` — accessible collapsible section rendering.
- `src/components/layout/Sidebar.test.tsx` — drawer, Escape, focus, compact mode, and section semantics.
- `src/components/common/PageNotice.test.tsx` — alert/status, action, dismiss, and focus behavior.
- `src/components/common/FlashToastBar.test.tsx` — live-region behavior.
- `src/utils/attendancePolicyMessage.ts` — shared Attendance policy wording.
- `src/utils/attendancePolicyMessage.test.ts` — employee and regularizer wording coverage.
- `src/utils/attendanceValidation.test.ts` — structured field/form validation coverage.
- `src/modules/attendance/components/ManualAttendanceModal.test.tsx` — failed-submit visibility, focus, and value preservation.

**Modify**

- `package.json` / `package-lock.json` — add component-test dependencies only.
- `src/navigation/navCatalog.ts` — become compatibility exports or be removed after all callers move.
- `src/navigation/sidebarNavigation.tsx` — remove after all callers move.
- `src/components/layout/AppLayout.tsx` — own separate mobile-open and desktop-collapse states.
- `src/components/layout/Header.tsx` — semantic tenant context and accessible mobile menu trigger.
- `src/components/layout/Sidebar.tsx` — responsive navigation composition, focus lifecycle, and shared selectors.
- `src/components/layout/CommandPalette.tsx` — shared model/selectors and improved search semantics.
- `src/components/common/PageNotice.tsx` — persistent feedback contract.
- `src/components/common/FlashToastBar.tsx` — severity-appropriate live semantics.
- `src/utils/graphqlUserMessage.ts` / `.test.ts` — actionable permission/network/timeout/fallback copy.
- `src/utils/attendanceValidation.ts` — return structured field/form failures.
- `src/modules/attendance/AttendancePage.tsx` — shared policy copy and persistent feedback.
- `src/modules/attendance/components/ManualAttendanceModal.tsx` — field errors and persistent request errors.
- `src/constants/uiText.ts` — loading ellipses and any shared navigation accessibility text.
- `src/index.css` — reduced-motion and focused navigation utility behavior if Tailwind classes alone are insufficient.

---

### Task 1: Add DOM Component-Test Infrastructure

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`

**Interfaces:**

- Produces: Vitest component tests running under jsdom with the existing `@` alias.
- Does not alter: production Vite configuration or build output.

- [ ] **Step 1: Install only the approved test dependencies**

Run:

```powershell
npm install --save-dev @testing-library/react @testing-library/user-event jsdom
```

Expected: `package.json` and `package-lock.json` add the three development dependencies without changing production dependencies.

- [ ] **Step 2: Create the Vitest configuration**

Create `vitest.config.ts`:

```ts
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    restoreMocks: true,
  },
});
```

- [ ] **Step 3: Prove existing pure tests still run**

Run:

```powershell
npm test -- src/utils/graphqlUserMessage.test.ts
```

Expected: existing tests pass under the new configuration.

- [ ] **Step 4: Review dependency scope without committing**

Run:

```powershell
git diff -- package.json package-lock.json vitest.config.ts
git diff --check -- package.json package-lock.json vitest.config.ts
```

Expected: only test tooling changed; whitespace check exits 0.

---

### Task 2: Consolidate Navigation Data and Pure Selectors

**Files:**

- Create: `src/navigation/navigationModel.ts`
- Create: `src/navigation/navigationSelectors.ts`
- Create: `src/navigation/navigationSelectors.test.ts`
- Modify/remove after migration: `src/navigation/navCatalog.ts`
- Modify/remove after migration: `src/navigation/sidebarNavigation.tsx`

**Interfaces:**

- Produces:

```ts
export type NavigationSectionKey = 'organization' | 'workplace' | 'payroll' | 'hr' | 'admin';

export interface NavigationDestination {
  path: string;
  label: string;
  keywords: readonly string[];
  icon?: LucideIcon;
  section?: NavigationSectionKey;
  order: number;
}

export interface NavigationSection {
  key: NavigationSectionKey;
  label: string;
  basePath: string;
  icon: LucideIcon;
  order: number;
}

export function accessibleDestinations(
  destinations: readonly NavigationDestination[],
  canAccessPath: (path: string) => boolean
): NavigationDestination[];

export function filterNavigationDestinations(
  destinations: readonly NavigationDestination[],
  query: string
): NavigationDestination[];

export function activeNavigationSection(
  pathname: string,
  sections?: readonly NavigationSection[]
): NavigationSectionKey | null;
```

- Consumes: existing `NAV_LABELS`, Lucide icons, and caller-supplied `canAccessTenantPath` behavior.

- [ ] **Step 1: Write failing selector tests**

Create tests with literal fixtures and expected values:

```ts
import { describe, expect, it } from 'vitest';
import {
  accessibleDestinations,
  activeNavigationSection,
  filterNavigationDestinations,
} from './navigationSelectors';

const destinations = [
  { path: '/dashboard', label: 'Dashboard', keywords: ['home'], order: 1 },
  { path: '/hr/leaves', label: 'Leave Approvals', keywords: ['pending', 'time off'], section: 'hr' as const, order: 2 },
  { path: '/admin/access', label: 'Roles & Permissions', keywords: ['rbac', 'security'], section: 'admin' as const, order: 3 },
];

describe('navigation selectors', () => {
  it('excludes destinations the session cannot access', () => {
    expect(accessibleDestinations(destinations, (path) => path !== '/admin/access').map((item) => item.path))
      .toEqual(['/dashboard', '/hr/leaves']);
  });

  it('matches labels and HR terminology without exposing unrelated destinations', () => {
    expect(filterNavigationDestinations(destinations, 'time off').map((item) => item.path))
      .toEqual(['/hr/leaves']);
  });

  it('selects the section for a nested active path', () => {
    expect(activeNavigationSection('/hr/leaves/request/123')).toBe('hr');
  });
});
```

- [ ] **Step 2: Run the selector tests and verify RED**

Run:

```powershell
npm test -- src/navigation/navigationSelectors.test.ts
```

Expected: FAIL because `navigationSelectors` does not exist.

- [ ] **Step 3: Implement the typed model and selectors**

Move every current destination exactly once into `NAVIGATION_DESTINATIONS`, preserving current paths, labels, keywords, icons, and relative ordering. Move the five current groups into `NAVIGATION_SECTIONS`.

Implement query matching as all query words appearing in the destination label, path, keywords, or section label. Sort returned destinations by `order`; do not sort alphabetically and change established placement.

For active sections, match a section when the path equals its `basePath` or begins with `${basePath}/`; choose the longest matching base path.

- [ ] **Step 4: Run selector tests and verify GREEN**

Run:

```powershell
npm test -- src/navigation/navigationSelectors.test.ts
```

Expected: PASS.

- [ ] **Step 5: Mutation-check the selectors**

Temporarily invert the access predicate or remove keyword matching and confirm the matching test fails. Restore the implementation and rerun the test to PASS.

- [ ] **Step 6: Review without committing**

Run:

```powershell
git diff -- src/navigation
git diff --check -- src/navigation
```

---

### Task 3: Establish Shared Feedback Semantics and Safe Messages

**Files:**

- Modify: `src/components/common/PageNotice.tsx`
- Create: `src/components/common/PageNotice.test.tsx`
- Modify: `src/components/common/FlashToastBar.tsx`
- Create: `src/components/common/FlashToastBar.test.tsx`
- Modify: `src/utils/graphqlUserMessage.ts`
- Modify: `src/utils/graphqlUserMessage.test.ts`
- Modify: `src/constants/uiText.ts`

**Interfaces:**

```ts
export interface PageNoticeProps {
  variant?: 'error' | 'info' | 'success' | 'warning';
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  focusOnMount?: boolean;
  className?: string;
}
```

`PageNotice` forwards a ref or manages an internal ref so `focusOnMount` can focus the notice after it appears. Error uses `role="alert"`; other variants use `role="status"` and `aria-live="polite"`.

- [ ] **Step 1: Write failing `PageNotice` behavior tests**

Cover observable behavior:

```tsx
it('announces an actionable error and moves focus to it', async () => {
  render(<PageNotice variant="error" title="Attendance was not saved" focusOnMount>Try again.</PageNotice>);
  const notice = screen.getByRole('alert');
  await waitFor(() => expect(document.activeElement).toBe(notice));
  expect(notice.textContent).toContain('Try again.');
});

it('renders a supplied recovery action', async () => {
  const user = userEvent.setup();
  let retried = false;
  render(<PageNotice action={<button onClick={() => { retried = true; }}>Retry</button>}>Unavailable</PageNotice>);
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(retried).toBe(true);
});
```

- [ ] **Step 2: Write failing toast semantic tests**

Verify success/info render as polite status and error renders as alert. Assert roles and live attributes on real rendered components.

- [ ] **Step 3: Add failing user-message tests**

Add literal expectations for:

```ts
expect(graphQlUserMessage(Object.assign(new Error('forbidden'), { code: 'FORBIDDEN' })))
  .toBe('You do not have access to make this change. Contact your HR administrator if you need help.');

expect(graphQlUserMessage(new Error('TypeError: Failed to fetch')))
  .toBe('We could not connect right now. Check your connection and try again.');

expect(graphQlUserMessage(new Error('request timed out after 30000ms')))
  .toBe('This is taking longer than expected. Try again.');

expect(graphQlUserMessage(new Error('duplicate key value violates unique constraint employee_email_key')))
  .toBe('This information conflicts with an existing record. Review the details and try again.');
```

- [ ] **Step 4: Run tests and verify RED**

Run:

```powershell
npm test -- src/components/common/PageNotice.test.tsx src/components/common/FlashToastBar.test.tsx src/utils/graphqlUserMessage.test.ts
```

Expected: failures identify missing notice props/semantics and old copy.

- [ ] **Step 5: Implement feedback components and mappings**

Use a close button only when `onDismiss` exists, with `UI_A11Y_TEXT.dismiss`. Put the optional action after the message. Apply `tabIndex={focusOnMount ? -1 : undefined}` and focus in an effect only when explicitly requested.

Update `FlashToastBar` so success/info use `role="status" aria-live="polite"`, while error uses `role="alert"`. Replace ASCII loading dots in shared status constants with `…`.

Update raw-text mappings before the generic permission/database fallback so network, timeout, and duplicate/conflict copy receives the specific approved wording.

- [ ] **Step 6: Run tests and verify GREEN**

Run the same focused command and expect all tests to pass.

- [ ] **Step 7: Mutation-check focus and mapping branches**

Temporarily remove the focus effect and confirm the focus test fails. Temporarily move the timeout branch after the generic fallback and confirm the timeout test fails. Restore and rerun to PASS.

---

### Task 4: Implement Responsive Sidebar and Shared Command Navigation

**Files:**

- Create: `src/components/layout/navigationPreference.ts`
- Create: `src/components/layout/navigationPreference.test.ts`
- Create: `src/components/layout/SidebarDestination.tsx`
- Create: `src/components/layout/SidebarSection.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Sidebar.test.tsx`
- Modify: `src/components/layout/AppLayout.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/CommandPalette.tsx`
- Modify/remove: `src/navigation/navCatalog.ts`
- Remove: `src/navigation/sidebarNavigation.tsx`
- Modify: `src/index.css`

**Interfaces:**

```ts
export const NAVIGATION_COLLAPSED_KEY = 'heliorhrms.navigation.collapsed.v1';
export function readDesktopNavigationCollapsed(storage?: Pick<Storage, 'getItem'>): boolean;
export function writeDesktopNavigationCollapsed(collapsed: boolean, storage?: Pick<Storage, 'setItem'>): void;

export interface SidebarProps {
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  mobileTriggerRef: RefObject<HTMLButtonElement>;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

export interface HeaderProps {
  mobileMenuOpen: boolean;
  mobileMenuButtonRef: RefObject<HTMLButtonElement>;
  onToggleMobileMenu: () => void;
}
```

- [ ] **Step 1: Write failing preference tests**

Verify missing, malformed, and unavailable storage all default to expanded; writing and reading `true` restores compact mode.

- [ ] **Step 2: Write failing sidebar interaction tests**

Render the real Sidebar inside `MemoryRouter`, mocking only `useAuth` to provide a complete session/access boundary. Test:

- `mobileOpen={false}` leaves the drawer translated off-screen and no backdrop rendered.
- an open drawer has a named navigation region and initial focus inside it.
- Escape invokes `onCloseMobile` and returns focus to `mobileTriggerRef.current`.
- section buttons expose `aria-expanded` and update after user activation.
- compact mode gives destination links accessible names and hides visible labels without removing them from assistive technology.

- [ ] **Step 3: Run focused tests and verify RED**

Run:

```powershell
npm test -- src/components/layout/navigationPreference.test.ts src/components/layout/Sidebar.test.tsx
```

Expected: failures identify missing preference and new Sidebar contracts.

- [ ] **Step 4: Implement preference persistence**

Catch storage access exceptions. Persist only `'true'` or `'false'`; treat every other value as expanded.

- [ ] **Step 5: Split sidebar rendering by responsibility**

`SidebarDestination` renders native `NavLink` destinations in expanded or compact form. `SidebarSection` owns `aria-expanded`, `aria-controls`, chevron state, and child destinations. `Sidebar` owns permission filtering, search, section expansion, Escape handling, scroll lock, and focus restoration.

Use `NAVIGATION_DESTINATIONS`, `NAVIGATION_SECTIONS`, and the pure selectors. Do not repeat path/label arrays in layout components.

- [ ] **Step 6: Update the app shell and header**

In `AppLayout`, initialize `mobileMenuOpen` to `false` and desktop collapse from `readDesktopNavigationCollapsed`. Persist changes through `writeDesktopNavigationCollapsed`. Keep a ref for the mobile trigger and pass explicit props to Header and Sidebar.

In `Header`, render the tenant name in a `<p>` or `<span>`, not `<h1>`. Add `aria-expanded`, `aria-controls`, and specific open/close labels to the mobile menu button.

- [ ] **Step 7: Migrate the command palette**

Derive its accessible destinations and search results from the shared model/selectors. Add a label or `aria-label` to the search input, retain keyboard selection, and use `…` in placeholder copy where applicable.

- [ ] **Step 8: Add reduced-motion behavior**

Use Tailwind `motion-reduce:transition-none` on drawer and chevron transitions. Add CSS only if an equivalent utility cannot express the required behavior.

- [ ] **Step 9: Remove obsolete navigation sources**

Run:

```powershell
rg -n 'NAV_CATALOG|SIDEBAR_GROUPS|SIDEBAR_PRIMARY_LINKS|sidebarNavigation|navCatalog' src
```

Expected before removal: only compatibility definitions/callers being migrated. Remove files or exports only after the scan shows no live callers.

- [ ] **Step 10: Run tests and verify GREEN**

Run the Task 4 focused command. Then run selector tests. Expect all to pass.

- [ ] **Step 11: Mutation-check responsive state**

Temporarily initialize mobile state to `true` and confirm the first-render test fails. Restore `false` and rerun to PASS.

---

### Task 5: Migrate the Complete Attendance Feedback Journey

**Files:**

- Create: `src/utils/attendancePolicyMessage.ts`
- Create: `src/utils/attendancePolicyMessage.test.ts`
- Modify: `src/utils/attendanceValidation.ts`
- Create: `src/utils/attendanceValidation.test.ts`
- Modify: `src/modules/attendance/AttendancePage.tsx`
- Modify: `src/modules/attendance/components/ManualAttendanceModal.tsx`
- Create: `src/modules/attendance/components/ManualAttendanceModal.test.tsx`

**Interfaces:**

```ts
export interface AttendancePolicyMessage {
  employee: string;
  regularizer?: string;
}

export function attendancePolicyMessage(
  selfServiceDays: number,
  canRegularize: boolean
): AttendancePolicyMessage;

export type ManualAttendanceField = 'workDate' | 'checkIn' | 'checkOut' | 'form';

export interface ManualAttendanceValidationError {
  field: ManualAttendanceField;
  message: string;
}

export function validateManualAttendanceSegment(
  input: ManualAttendanceValidationInput
): ManualAttendanceValidationError | null;
```

`ManualAttendanceModalProps` adds:

```ts
selfServiceDays: number;
canRegularize: boolean;
```

- [ ] **Step 1: Write failing policy-copy tests**

Use literal expectations:

```ts
expect(attendancePolicyMessage(14, false)).toEqual({
  employee: 'You can add missed punches from the last 14 calendar days. For an earlier date, ask HR or your manager to adjust your attendance.',
});

expect(attendancePolicyMessage(7, true)).toEqual({
  employee: 'You can add missed punches from the last 7 calendar days. For an earlier date, ask HR or your manager to adjust your attendance.',
  regularizer: 'You can also adjust earlier dates because your role includes attendance regularization.',
});
```

- [ ] **Step 2: Write failing structured-validation tests**

Cover:

- missing date → `workDate`
- future date → `workDate`
- missing punch in → `checkIn`
- missing punch out or punch out before punch in → `checkOut`
- overlap → `form`
- total over 24 hours → `form`
- valid interval → `null`

Use hand-checked dates and intervals; do not compute expected messages through production helpers.

- [ ] **Step 3: Write failing modal interaction tests**

Render the real modal with a mocked GraphQL request boundary. Verify:

- local invalid punch order associates the message with Punch Out and focuses that input.
- a rejected save renders a focused alert at the top of the modal.
- the entered date and times remain unchanged after the rejected save.
- the modal calls `onSaved` and `onClose` only after a resolved save.

- [ ] **Step 4: Run focused tests and verify RED**

Run:

```powershell
npm test -- src/utils/attendancePolicyMessage.test.ts src/utils/attendanceValidation.test.ts src/modules/attendance/components/ManualAttendanceModal.test.tsx
```

Expected: missing formatter, old validation return type, and old modal behavior fail.

- [ ] **Step 5: Implement policy formatter and structured validation**

Normalize invalid or negative day counts to the existing safe default of 14. Return only the two approved strings from the policy formatter.

Return a field-specific validation error before form-level overlap/total errors. Preserve all current validation rules and messages except the capitalization correction `Punch In must be before Punch Out for the same calendar day.`

- [ ] **Step 6: Update the modal**

Maintain field errors separately from request/form errors. Pass `error` to `Input` for field failures and focus the first invalid input. Render backend or form-wide failure through `PageNotice`; use `focusOnMount` only for a newly displayed form-wide failure. Preserve form state until confirmed save. Use shared policy copy and `Saving…`.

- [ ] **Step 7: Update the Attendance page**

Compute policy copy once from `adjustPolicyDays` and `canRegularize`. Replace the API-oriented policy Card body with the approved strings.

Replace ad hoc error/success paragraphs with `PageNotice`. Error includes a Retry action that invokes the existing board refresh and clears stale error state before retrying. Preserve existing board data if refresh fails. Rewrite the row-limit warning to:

`Only part of this period's attendance history is shown. Choose a shorter period and refresh before using these totals for payroll review.`

Pass `selfServiceDays` and `canRegularize` to `ManualAttendanceModal`.

- [ ] **Step 8: Run focused tests and verify GREEN**

Run the Task 5 focused command and expect all tests to pass.

- [ ] **Step 9: Scan the implemented scope for technical user copy**

Run:

```powershell
rg -n -i '\b(API|GraphQL|backend|database|SQL|constraint|exception|resolver|HTTP)\b|request rejected' src/components/layout src/components/common src/modules/attendance
```

Expected: no user-rendered matches. Imports, comments, and developer-only code may match only when they cannot render.

---

### Task 6: Verify the Complete Delivery

**Files:** All files changed by Tasks 1–5.

**Interfaces:** No new behavior; verification only.

- [ ] **Step 1: Run every focused test together**

```powershell
npm test -- src/navigation/navigationSelectors.test.ts src/components/layout/navigationPreference.test.ts src/components/layout/Sidebar.test.tsx src/components/common/PageNotice.test.tsx src/components/common/FlashToastBar.test.tsx src/utils/graphqlUserMessage.test.ts src/utils/attendancePolicyMessage.test.ts src/utils/attendanceValidation.test.ts src/modules/attendance/components/ManualAttendanceModal.test.tsx
```

Expected: all focused tests pass with 0 failures.

- [ ] **Step 2: Run the complete Vitest suite**

```powershell
npm test
```

Expected: all test files pass with 0 failures.

- [ ] **Step 3: Run TypeScript and Vite production build**

```powershell
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Run focused ESLint**

```powershell
npx eslint src/navigation/navigationModel.ts src/navigation/navigationSelectors.ts src/navigation/navigationSelectors.test.ts src/components/layout/AppLayout.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/components/layout/SidebarDestination.tsx src/components/layout/SidebarSection.tsx src/components/layout/Sidebar.test.tsx src/components/common/PageNotice.tsx src/components/common/PageNotice.test.tsx src/components/common/FlashToastBar.tsx src/components/common/FlashToastBar.test.tsx src/utils/graphqlUserMessage.ts src/utils/graphqlUserMessage.test.ts src/utils/attendancePolicyMessage.ts src/utils/attendancePolicyMessage.test.ts src/utils/attendanceValidation.ts src/utils/attendanceValidation.test.ts src/modules/attendance/AttendancePage.tsx src/modules/attendance/components/ManualAttendanceModal.tsx src/modules/attendance/components/ManualAttendanceModal.test.tsx --max-warnings 0
```

Expected: exit 0 with no warnings.

- [ ] **Step 5: Check whitespace and inspect the final worktree**

```powershell
git diff --check
git status --short
git diff --stat
```

Expected: whitespace check exits 0; unrelated pre-existing modifications remain present and unaltered; no commit exists.

- [ ] **Step 6: Reconcile requirements**

Verify each design requirement against the diff and test evidence. Report browser navigation, responsive layout, and visual appearance as unverified unless an in-app browser becomes available and those flows are exercised.

---

## Execution Decision

The user explicitly requested implementation after approving the specification, so execute this plan inline using `superpowers:executing-plans`. Do not create commits at task boundaries. Pause only if worktree isolation requires user consent, dependency installation is denied, the baseline is failing, or implementation would overwrite unrelated user changes.
