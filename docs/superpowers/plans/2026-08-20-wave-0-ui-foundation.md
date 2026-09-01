# Helior HRMS Wave 0 UI Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the semantic visual system, accessible shared interaction contracts, responsive application shell, and lazy route architecture required by every later HRMS module wave.

**Architecture:** CSS custom properties provide one light/dark semantic token source consumed by Tailwind and shared components. Backward-compatible React primitives add accessible action, form, status, table, tab, and overlay contracts without forcing a one-shot module rewrite. Typed route descriptors preserve existing paths and permission gates while moving page imports behind authorized lazy boundaries.

**Tech Stack:** React 18, TypeScript 5, React Router 6.22, Vite 5, Tailwind CSS 3.4, Vitest 1.6, React Testing Library, user-event, jsdom.

**Spec:** `docs/superpowers/specs/2026-08-20-all-module-ui-ux-modernization-design.md`

## Global Constraints

- Work only in `D:\work\heliorventures\hrms-ui` or its user-approved isolated worktree.
- Do not change GraphQL schemas/documents, generated GraphQL output, Rust services, database migrations, JWT claims, RBAC semantics, deployment behavior, or tenant/session storage contracts.
- Preserve every current route path, `tenantPath`, payroll capability, tenant UUID match, forced-password redirect, and operator authorization boundary.
- Keep Helior HRMS indigo as the brand accent while replacing color-name semantics with light/dark semantic tokens.
- Keep user-facing copy free of API, GraphQL, backend, database, SQL, constraint, exception, resolver, stack-trace, and HTTP-status terminology.
- Preserve existing public props while shared callers migrate; new required props are allowed only on new components.
- Mobile text inputs use at least 16px text. Interactive targets are at least 44px on mobile and 24px or equivalently spaced on desktop.
- Use native semantic HTML before ARIA; support keyboard operation, visible `focus-visible`, reduced motion, 320px reflow, 200% zoom, and non-color status communication.
- Keep touched production components below 400 lines by extracting focused hooks, utilities, and presentation components.
- Follow strict TDD for production behavior: write the focused test, run it and observe the expected failure, implement, rerun to green, then refactor.
- Do not introduce a UI/component dependency in Wave 0. Use the installed React, Tailwind, Testing Library, Lucide, and browser platform capabilities.
- Do not run Dart or Flutter commands.
- Do not commit, push, publish, deploy, or remove unrelated work. The user will review and commit manually.

---

## Wave 0 Defect Inventory

| Severity | Reproduction or static evidence | Root cause | Acceptance gate |
|---|---|---|---|
| Critical | Open any tenant route in a fresh production build and inspect the entry bundle; all 44 tenant pages and 5 operations pages are imported by `appRouteConfig.tsx` and `opsRouteConfig.tsx`. | Route records store eager JSX elements. | Authorized page modules load through static `lazy(() => import(...))` boundaries; route metadata tests preserve all paths and gates. |
| High | Open `/ops/tenants` while tenant resolution is loading or fails. `AppRoutes` renders the tenant resolving/unavailable tree instead of operations routes. | Tenant resolution branches execute before operations-route selection. | `/ops/login` and `/ops/*` remain independent of tenant resolution and still use `OpsProtectedLayout`. |
| High | Inspect `Input`, `Select`, entity pickers, and `TabBar` with a keyboard or accessibility tree. | Labels, descriptions, error announcement, roving tab focus, panel relationships, and combobox semantics are not centralized. | Shared form and tab tests prove names, descriptions, errors, Arrow/Home/End behavior, and panel relationships. |
| High | Open any modal and navigate the accessibility tree or Tab order. | The custom focus trap does not portal content or make the application root inert; there is no shared drawer/confirmation contract. | A shared overlay stack owns portal rendering, inert state, Escape, Tab containment, nested dialogs, scroll lock, and focus restoration. |
| High | Inspect a shared table during loading/error/empty states. | No caption/name, `scope`, live state, controlled sort/selection/pagination, or responsive metadata. | `DataTable` exposes these contracts; `Table` preserves existing callers as an adapter. |
| High | Review Tailwind config and shared components. The source contains thousands of direct named-color utilities. | No semantic token contract exists. | Tokens cover canvas/surfaces/content/lines/action/focus/status in light and dark themes; shared foundations consume them first. |
| Medium | Load a saved dark theme after a cold start or store an invalid `theme` value. | Theme is unvalidated and applied after mount; document `color-scheme` is not managed. | Namespaced validated preference is applied before async config loading, migrates valid legacy values, and sets class/color scheme/theme color. |
| Medium | Use shared input/select on a phone and inspect button `sm`. | Inputs are 14px and small buttons are below the approved 44px mobile target. | Shared controls meet the approved mobile size contract without breaking compact desktop density. |
| Medium | Open Profile or Notifications menus, then press Escape or Tab away. | Each dropdown independently implements mouse click-away without full keyboard/focus semantics. | Shared popover/menu behavior provides trigger state, Escape, outside dismissal, focus movement/restoration, and collision-safe placement. |
| Medium | Navigate to an unknown or unauthorized route. | Wildcards and permission guards silently redirect to Dashboard or Payroll Pay. | Distinct safe access-denied and not-found surfaces preserve the requested context and provide an authorized return action. |
| Medium | Navigate between pages with keyboard only. | No skip link, stable main target, route title, or route-change focus behavior. | Shell and route tests prove skip navigation, page titles, and focused main content without obscuring focus. |
| Medium | Format `YYYY-MM-DD` values outside UTC or call `toDateInputValue` near local midnight. | Date-only values and instants share `Date`/UTC conversion behavior. | Calendar-date and timestamp formatters are separate and tested with fixed offsets and invalid input. |
| Low | Fail config loading with a message containing markup. | Startup fallback interpolates an error into `innerHTML`. | Startup error uses React or DOM text nodes; exception text cannot become markup. |

## File Structure

### Create

- `src/styles/semantic-tokens.css` — light/dark semantic color variables and document theme metadata values.
- `src/contexts/themePreference.ts` / `.test.ts` — validated, namespaced preference resolution and document application.
- `src/contexts/ThemeContext.test.tsx` — provider toggle/persistence behavior.
- `src/startup/ConfigurationError.tsx` / `.test.tsx` — escaped, accessible startup failure surface.
- `src/components/common/IconButton.tsx` / `.test.tsx` — labelled icon-only action.
- `src/components/common/FormField.tsx` / `.test.tsx` — field IDs, label, description, optional/required, and error wiring.
- `src/components/common/Textarea.tsx`, `Checkbox.tsx`, `RadioGroup.tsx`, `Switch.tsx`, `FileInput.tsx` and colocated tests — consistent native form-control semantics and sizing.
- `src/components/common/SearchableSelect.tsx` / `.test.tsx` — generic accessible entity picker.
- `src/components/common/AsyncState.tsx` / `.test.tsx` — shared loading, empty, unavailable, and error state container.
- `src/components/common/EmptyState.tsx`, `Skeleton.tsx`, `Progress.tsx`, `MetricCard.tsx`, `StatusBadge.tsx`, `SensitiveValue.tsx` and colocated tests — semantic feedback, data, and privacy primitives.
- `src/components/common/overlayStack.ts` — nested overlay registration, root inerting, body-scroll ownership, and focus restoration.
- `src/components/common/useDialogSurface.ts` — Escape, Tab containment, and initial focus behavior.
- `src/components/common/Drawer.tsx`, `ConfirmDialog.tsx`, `HighRiskActionDialog.tsx` and colocated tests — reusable overlay and destructive-action surfaces.
- `src/components/common/Tabs.tsx` / `.test.tsx` — complete WAI-ARIA tab keyboard and panel contract.
- `src/components/common/DataTable.tsx` / `.test.tsx` — named table with controlled sort, selection, pagination, and states.
- `src/components/common/usePopover.ts`, `ActionMenu.tsx` and colocated tests — trigger/panel focus, keyboard action navigation, and dismissal contract.
- `src/components/layout/AppLayout.test.tsx`, `CommandPalette.test.tsx`, `ProfileDropdown.test.tsx`, `NotificationDropdown.test.tsx` — shell interaction coverage.
- `src/routes/routeTypes.ts` — discriminated lazy page and redirect descriptors.
- `src/routes/RouteContent.tsx` / `.test.tsx` — page title and accessible Suspense boundary.
- `src/routes/RouteErrorBoundary.tsx` / `.test.tsx` — non-technical recovery when a lazy route or page render fails.
- `src/routes/RouteStatePage.tsx` / `.test.tsx` — loading, unavailable, denied, and not-found states.
- `src/routes/routeRegistry.test.ts`, `AppRoutes.test.tsx`, `RouteGuards.test.tsx` — route, authorization, and tenant/ops-plane regression coverage.
- `src/utils/dateDisplay.test.ts`, `dateInput.test.ts` — calendar-date and instant regression coverage.

### Modify

- `tailwind.config.js`, `src/index.css`, `index.html`, `src/main.tsx`, `src/components/brand/AppLogo.tsx` — semantic theme and safe startup.
- `src/contexts/ThemeContext.tsx` — validated preference and synchronous document application.
- `src/components/common/Button.tsx`, `Input.tsx`, `Select.tsx`, `EmployeeSearchSelect.tsx`, `UuidEntitySearchSelect.tsx` — action/form contracts.
- `src/components/common/PageNotice.tsx`, `FlashToastBar.tsx`, `LoadingSpinner.tsx`, `Badge.tsx`, `Card.tsx`, `PageHeader.tsx`, `MaskedAmount.tsx` — semantic tokens, state behavior, page hierarchy, and sensitive-value compatibility.
- `src/components/common/Modal.tsx`, `TabBar.tsx`, `Table.tsx` — compatibility adapters over the new overlay/tab/table contracts.
- `src/contexts/DialogContext.tsx` — preserve promise API while rendering `ConfirmDialog`.
- `src/hooks/useFlashToast.ts`, `src/constants/uiText.ts` — feedback policy and sentence-case shared copy.
- `src/components/layout/AppLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `CommandPalette.tsx`, `ProfileDropdown.tsx`, `NotificationDropdown.tsx` — shell, menus, focus, safe areas, and semantic tokens.
- `src/routes/appRouteConfig.tsx`, `opsRouteConfig.tsx`, `AppRoutes.tsx`, `RouteGuards.tsx` — typed lazy routes and distinct route states.
- `src/utils/dateDisplay.ts`, `dateInput.ts`, `modules/expenses/utils/formatters.ts`, `modules/payroll/payrollFormatters.ts`, `modules/organization/employee-profile/lib/masking.ts` — authoritative formatting boundaries.
- `src/modules/workplace/OnboardingPage.tsx`, `src/modules/insights/AnalyticsPage.tsx`, `src/modules/workplace/assets/AssetStatusBadge.tsx` — representative adoption only.

---

### Task 1: Establish Semantic Theme and Safe Formatting Boundaries

**Files:**

- Create: `src/styles/semantic-tokens.css`
- Create: `src/contexts/themePreference.ts`
- Test: `src/contexts/themePreference.test.ts`
- Test: `src/contexts/ThemeContext.test.tsx`
- Test: `src/utils/dateDisplay.test.ts`
- Test: `src/utils/dateInput.test.ts`
- Create/Test: `src/startup/ConfigurationError.tsx`
- Modify: `tailwind.config.js`, `src/index.css`, `index.html`, `src/main.tsx`
- Modify: `src/contexts/ThemeContext.tsx`, `src/components/brand/AppLogo.tsx`
- Modify: `src/utils/dateDisplay.ts`, `src/utils/dateInput.ts`

**Interfaces:**

```ts
export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'heliorhrms.theme.v1';
export function readThemePreference(storage?: Pick<Storage, 'getItem' | 'removeItem'>): Theme | null;
export function resolveInitialTheme(preference: Theme | null, prefersDark: boolean): Theme;
export function persistThemePreference(theme: Theme, storage?: Pick<Storage, 'setItem'>): void;
export function applyDocumentTheme(theme: Theme, documentRoot?: HTMLElement): void;

export function formatCalendarDate(value: string | null | undefined, locale?: string): string;
export function formatInstant(value: string | Date | null | undefined, locale?: string): string;
export function toDateInputValue(value: Date): string;
export interface ConfigurationErrorProps { error: unknown }
```

- [ ] **Step 1: Write preference and formatter tests with hand-derived values**

```ts
expect(readThemePreference(storageWith({ theme: 'dark' }))).toBe('dark');
expect(readThemePreference(storageWith({ 'heliorhrms.theme.v1': 'invalid' }))).toBeNull();
expect(resolveInitialTheme(null, true)).toBe('dark');
expect(formatCalendarDate('2026-08-20', 'en-IN')).toBe('20 Aug 2026');
expect(toDateInputValue(new Date(2026, 7, 20, 0, 15))).toBe('2026-08-20');
render(<ConfigurationError error={'<img src=x onerror=alert(1)>'} />);
expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
expect(document.querySelector('img')).toBeNull();
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/contexts/themePreference.test.ts src/contexts/ThemeContext.test.tsx src/startup/ConfigurationError.test.tsx src/utils/dateDisplay.test.ts src/utils/dateInput.test.ts`

Expected: FAIL because the preference module and calendar/instant distinction do not exist.

- [ ] **Step 3: Implement preference and formatting boundaries**

Use only `light`/`dark`; migrate one valid legacy `theme` value; catch blocked storage; apply the root class, `style.colorScheme`, and the document theme-color meta value before `loadAppConfig()` begins. Parse `YYYY-MM-DD` by numeric calendar parts rather than `new Date('YYYY-MM-DD')`. Build date input values from local year/month/day, never `toISOString()`.

- [ ] **Step 4: Define semantic tokens and Tailwind aliases**

Define opacity-compatible RGB variables for `canvas`, `surface`, `surface-raised`, `surface-selected`, `content-primary`, `content-secondary`, `content-muted`, `content-inverse`, `line-subtle`, `line`, `line-strong`, `accent`, `accent-hover`, `accent-active`, `focus`, and `status-{neutral,info,success,warning,danger}`. Preserve `primary` and `brand` aliases temporarily for unchanged module callers. Import tokens before Tailwind layers and preserve payslip print overrides.

- [ ] **Step 5: Remove the startup HTML sink**

Render `ConfigurationError` through `createRoot` and JSX text interpolation, preserving the three current messages and avoiding raw `innerHTML`. The component uses a `<main>`, one `<h1>`, and a safely wrapped technical configuration detail intended for deployers rather than authenticated end users.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the Step 2 command; expected: all focused tests pass.

### Task 2: Build Backward-Compatible Action and Form Primitives

**Files:**

- Create/Test: `IconButton.tsx`, `FormField.tsx`, `Textarea.tsx`, `Checkbox.tsx`, `RadioGroup.tsx`, `Switch.tsx`, `FileInput.tsx`, `SearchableSelect.tsx`
- Modify/Test: `Button.tsx`, `Input.tsx`, `Select.tsx`
- Modify: `EmployeeSearchSelect.tsx`, `UuidEntitySearchSelect.tsx`

**Interfaces:**

```ts
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  busy?: boolean;
  busyLabel?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: 'quiet' | 'outline' | 'danger';
  size?: 'sm' | 'md';
}

export interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  children: (field: { inputId: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

export interface SearchableSelectProps<T> {
  label: string;
  options: readonly T[];
  value: string | null;
  onChange: (option: T | null) => void;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionDescription?: (option: T) => string | undefined;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface ChoiceOption { value: string; label: string; description?: string; disabled?: boolean }
export interface RadioGroupProps { label: string; name: string; value: string; options: readonly ChoiceOption[]; onChange: (value: string) => void; error?: string }
export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }
```

- [ ] **Step 1: Write failing interaction tests**

Test that busy buttons retain their visible label, expose `aria-busy`, and prevent a second click; icon buttons require an accessible label; input/select/textarea/file descriptions and errors merge with caller `aria-describedby`; checkbox/radio labels share one hit target; switch exposes its checked state; mobile classes provide 16px text and 44px targets; pickers expose one labelled search/listbox relationship and announce result count.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/common/Button.test.tsx src/components/common/IconButton.test.tsx src/components/common/FormField.test.tsx src/components/common/Input.test.tsx src/components/common/Select.test.tsx src/components/common/Textarea.test.tsx src/components/common/Checkbox.test.tsx src/components/common/RadioGroup.test.tsx src/components/common/Switch.test.tsx src/components/common/FileInput.test.tsx src/components/common/SearchableSelect.test.tsx`

Expected: FAIL on missing components and contracts.

- [ ] **Step 3: Implement actions and fields**

Preserve all current Button/Input/Select props and native ref/attributes. Use semantic classes, `focus-visible`, `disabled || busy`, decorative-icon hiding, stable IDs, clickable labels, inline errors with `role="alert"`, and caller-provided autocomplete/name/type/inputMode. Textarea and FileInput compose `FormField`; Checkbox and RadioGroup use native inputs; Switch uses a native button with `role="switch"` and `aria-checked`. Date, time, number, currency, email, and telephone fields continue through typed `Input` props so one field contract owns their treatment. Keep compact desktop density through responsive classes, not undersized mobile controls.

- [ ] **Step 4: Convert entity pickers to typed adapters**

`EmployeeSearchSelect` and `UuidEntitySearchSelect` retain current value/callback props but map options into `SearchableSelect<T>`. Filtering uses `useDeferredValue`; selected IDs remain authoritative; empty and failed options are distinct.

- [ ] **Step 5: Verify GREEN and scan callers**

Run the Step 2 command, then `rg -n "<Button|<Input|<Select|EmployeeSearchSelect|UuidEntitySearchSelect" src` and confirm existing call signatures remain accepted by `npm run build` later.

### Task 3: Standardize Feedback, Status, and Summary States

**Files:**

- Create/Test: `AsyncState.tsx`, `EmptyState.tsx`, `Skeleton.tsx`, `Progress.tsx`, `MetricCard.tsx`, `StatusBadge.tsx`, `SensitiveValue.tsx`
- Modify/Test: `LoadingSpinner.tsx`, `PageNotice.tsx`, `FlashToastBar.tsx`, `useFlashToast.ts`
- Modify: `Badge.tsx`, `Card.tsx`, `PageHeader.tsx`, `MaskedAmount.tsx`, `uiText.ts`
- Modify/Test: `modules/workplace/assets/AssetStatusBadge.tsx`

**Interfaces:**

```ts
export type AsyncStateKind = 'loading' | 'empty' | 'unavailable' | 'error';
export interface AsyncStateProps { kind: AsyncStateKind; title: string; description?: string; action?: ReactNode }
export interface StatusBadgeProps { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; icon?: ReactNode }
export interface MetricCardProps { label: string; value?: ReactNode; context?: string; state?: 'ready' | 'loading' | 'unavailable' | 'error'; action?: ReactNode }
export interface SensitiveValueProps { label: string; value: string; maskedValue: string; mayReveal: boolean; copyable?: boolean; remaskAfterMs?: number }
```

- [ ] **Step 1: Write failing state tests**

Assert labelled loading status, reduced-motion-safe spinner, empty/error recovery actions, determinate progress `aria-valuenow`, indeterminate accessible label, status text independent of color, tabular metric values, notice/toast announcement roles, and sensitive values that start masked, deny reveal without capability, re-mask on timeout/unmount, and copy only while explicitly revealed.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/common/AsyncState.test.tsx src/components/common/EmptyState.test.tsx src/components/common/Skeleton.test.tsx src/components/common/Progress.test.tsx src/components/common/MetricCard.test.tsx src/components/common/StatusBadge.test.tsx src/components/common/SensitiveValue.test.tsx src/components/common/LoadingSpinner.test.tsx src/components/common/PageNotice.test.tsx src/components/common/FlashToastBar.test.tsx src/hooks/useFlashToast.test.tsx`

Expected: FAIL because the shared state contracts are absent.

- [ ] **Step 3: Implement semantic state components**

Use status icons plus visible labels, semantic tokens, `aria-live="polite"` for non-blocking updates, alerts only for failures requiring immediate attention, and persistent `PageNotice` for actionable errors. Keep `useFlashToast()` return shape `{ flash, show, clear }`; prevent transient error auto-dismiss while allowing success/info expiry. `SensitiveValue` re-masks after `30_000` ms by default and on unmount; `MaskedAmount` delegates reveal/copy behavior to it while preserving its existing public props.

- [ ] **Step 4: Preserve compatibility and adopt one representative status**

Keep `Badge` public variants as a compatibility adapter. Convert `AssetStatusBadge` to explicit label/tone mapping over shared `StatusBadge`; do not infer arbitrary API status colors inside the primitive.

- [ ] **Step 5: Verify GREEN**

Run the Step 2 command; expected: all focused tests pass.

### Task 4: Establish Overlay and Tab Interaction Contracts

**Files:**

- Create/Test: `overlayStack.ts`, `useDialogSurface.ts`, `Drawer.tsx`, `ConfirmDialog.tsx`, `HighRiskActionDialog.tsx`, `Tabs.tsx`
- Modify/Test: `Modal.tsx`, `TabBar.tsx`, `DialogContext.tsx`
- Modify/Test: `modules/workplace/OnboardingPage.tsx`, `modules/insights/AnalyticsPage.tsx`

**Interfaces:**

```ts
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDismissible?: boolean;
  mobilePresentation?: 'dialog' | 'full-height';
}

export interface TabsProps {
  tabs: readonly { id: string; label: string; panelId: string; icon?: ReactNode }[];
  value: string;
  onValueChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export interface DrawerProps extends Omit<ModalProps, 'size' | 'mobilePresentation'> {
  side?: 'left' | 'right';
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  tone?: 'default' | 'danger';
  busy?: boolean;
  busyLabel?: string;
}

export interface HighRiskActionDialogProps {
  open: boolean;
  action: string;
  target: string;
  scope: string;
  consequence: string;
  confirmLabel: string;
  confirmationText?: string;
  requireReason?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
}
```

- [ ] **Step 1: Write failing overlay and tab tests**

Test portal rendering, root inerting, nested modal stack, Escape only on topmost dismissible overlay, forward/backward Tab containment, initial focus, opener restoration, description IDs, sticky footer, Drawer side, ConfirmDialog busy protection, HighRiskActionDialog target/scope/consequence summary and required reason/confirmation phrase, promise-compatible DialogContext, and Arrow/Home/End tab movement with roving `tabIndex` and `aria-controls`.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/common/Modal.test.tsx src/components/common/Drawer.test.tsx src/components/common/ConfirmDialog.test.tsx src/components/common/HighRiskActionDialog.test.tsx src/components/common/Tabs.test.tsx src/contexts/DialogContext.test.tsx`

Expected: FAIL on missing portal/inert/drawer/confirmation/tab behavior.

- [ ] **Step 3: Implement one overlay foundation**

Render overlays through `createPortal(document.body)`. The stack stores opener and focus callbacks, locks body scroll only for the first overlay, marks `#root` inert while any modal surface is active, and restores the previous topmost overlay or original opener on close. Use `100dvh`, safe-area padding, and `overscroll-contain`. `HighRiskActionDialog` composes `Modal`, displays action/target/scope/consequence, disables confirmation until a trimmed required reason is non-empty and the optional confirmation phrase matches exactly with case preserved, and submits once while busy.

- [ ] **Step 4: Implement tabs and representative migrations**

`Tabs` owns keyboard focus and tab button IDs. Onboarding and Analytics own their corresponding panels with `role="tabpanel"`, stable IDs, and `aria-labelledby`. Keep `TabBar` as a compatibility wrapper for any not-yet-migrated caller.

- [ ] **Step 5: Verify GREEN**

Run the Step 2 command plus focused Onboarding/Analytics tests; expected: all pass.

### Task 5: Introduce the Accessible DataTable Contract

**Files:**

- Create/Test: `DataTable.tsx`
- Modify/Test: `Table.tsx`

**Interfaces:**

```ts
export type DataTableState = 'ready' | 'loading' | 'empty' | 'error' | 'partial';
export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  mobilePriority?: 'primary' | 'secondary' | 'hidden';
  numeric?: boolean;
}
export interface DataTableProps<T> {
  ariaLabel: string;
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowId: (row: T) => string;
  state?: DataTableState;
  stateMessage?: string;
  recoveryAction?: ReactNode;
  sort?: { columnId: string; direction: 'ascending' | 'descending'; onChange: (columnId: string) => void };
  pagination?: { page: number; pageCount: number; onPageChange: (page: number) => void };
  selectedRowIds?: ReadonlySet<string>;
  onSelectionChange?: (ids: ReadonlySet<string>) => void;
  renderMobileRow?: (row: T) => ReactNode;
}
```

- [ ] **Step 1: Write failing table tests**

Assert caption/accessibility name, scoped headers, `aria-sort`, selected-row checkbox labels, controlled page actions, state precedence, partial-data warning, recovery action, numeric tabular classes, and mobile-row fallback.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/common/DataTable.test.tsx src/components/common/Table.test.tsx`

Expected: FAIL because advanced contracts are absent.

- [ ] **Step 3: Implement DataTable and compatibility adapter**

Keep sorting/pagination/selection controlled; never silently slice data. `Table` adds an optional `ariaLabel` prop, maps its current `data`, `columns`, `keyExtractor`, loading/error/empty props into DataTable, and defaults the compatibility label to `Records`. Each module supplies a specific label during its wave.

- [ ] **Step 4: Verify GREEN and caller compatibility**

Run the Step 2 command, then TypeScript build later to prove all 31 existing Table imports compile unchanged.

### Task 6: Modernize Shell Navigation and Popovers

**Files:**

- Create/Test: `src/components/common/usePopover.ts`, `src/components/common/ActionMenu.tsx`
- Test: `AppLayout.test.tsx`, `CommandPalette.test.tsx`, `ProfileDropdown.test.tsx`, `NotificationDropdown.test.tsx`
- Modify: `AppLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `CommandPalette.tsx`, `ProfileDropdown.tsx`, `NotificationDropdown.tsx`

**Interfaces:**

```ts
export function usePopover(options: { open: boolean; onClose: () => void }): {
  triggerRef: RefObject<HTMLButtonElement>;
  panelRef: RefObject<HTMLDivElement>;
  triggerProps: { 'aria-expanded': boolean; 'aria-controls': string; onKeyDown: KeyboardEventHandler };
  panelProps: { id: string; onKeyDown: KeyboardEventHandler };
};

export type ActionMenuItem =
  | { id: string; label: string; href: string; icon?: ReactNode; disabled?: boolean }
  | { id: string; label: string; onSelect: () => void; icon?: ReactNode; disabled?: boolean; tone?: 'default' | 'danger' };
export interface ActionMenuProps { label: string; items: readonly ActionMenuItem[]; align?: 'start' | 'end' }
```

- [ ] **Step 1: Write failing shell tests**

Test skip link target, route-change main focus, scroll restoration, `100dvh`, safe-area classes, mobile navigation Tab containment/restoration, Command Palette opener restoration, ActionMenu Arrow/Home/End/Escape behavior, menu trigger `aria-expanded`, outside dismissal, first-item focus, and notification long-content wrapping.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/common/usePopover.test.tsx src/components/common/ActionMenu.test.tsx src/components/layout/AppLayout.test.tsx src/components/layout/Sidebar.test.tsx src/components/layout/CommandPalette.test.tsx src/components/layout/ProfileDropdown.test.tsx src/components/layout/NotificationDropdown.test.tsx`

Expected: FAIL on missing skip/focus/popover behavior.

- [ ] **Step 3: Implement shell and shared popover behavior**

Add a visible-on-focus skip link to `#main-content`. Focus the main landmark after the initial protected route resolves and after each pathname change; query-string-only form/filter changes do not move focus. Restore the scroll container to the top for a new pathname while preserving browser history restoration. Use `min-h-[100dvh]`, safe-area padding, semantic tokens, and explicit transitions. Profile uses `ActionMenu`; Notifications uses the same popover focus/dismissal foundation while retaining inbox/list semantics.

- [ ] **Step 4: Decouple notification count from closed preview fetching**

Keep unread count refresh behavior but fetch the 15-item preview only when the panel opens. Preserve last successfully loaded preview if refresh fails and show an actionable inline retry state instead of replacing it with an empty list.

- [ ] **Step 5: Verify GREEN**

Run the Step 2 command; expected: all focused tests pass.

### Task 7: Replace Eager JSX Routes with Authorized Lazy Descriptors

**Files:**

- Create/Test: `routeTypes.ts`, `RouteContent.tsx`, `RouteErrorBoundary.tsx`, `RouteStatePage.tsx`
- Test: `routeRegistry.test.ts`, `AppRoutes.test.tsx`, `RouteGuards.test.tsx`
- Modify: `appRouteConfig.tsx`, `opsRouteConfig.tsx`, `AppRoutes.tsx`, `RouteGuards.tsx`

**Interfaces:**

```ts
export interface RoutePage {
  kind: 'page'; path: string; title: string;
  load: () => Promise<{ default: ComponentType }>;
  tenantPath?: string; payrollCapability?: Capability;
}
export interface RouteRedirect {
  kind: 'redirect'; path?: string; index?: boolean; to: string;
  tenantPath?: string; payrollCapability?: Capability;
}
export type AppChildRoute = RoutePage | RouteRedirect;
```

- [ ] **Step 1: Record the current production bundle baseline**

Run `npm run build` before changing route imports. Record the generated entry chunk filename and uncompressed/gzip sizes in the task report. Do not treat the baseline build as proof of the new behavior.

- [ ] **Step 2: Freeze the live route registry in failing tests**

Use literal expected arrays for all paths, redirects, titles, `tenantPath` values, and payroll capabilities. Test that denied routes render access denied without invoking the lazy importer, unknown routes render not found, and operations routes still resolve when tenant resolution is loading/error.

- [ ] **Step 3: Verify RED**

Run: `npm test -- src/routes/routeRegistry.test.ts src/routes/RouteContent.test.tsx src/routes/RouteErrorBoundary.test.tsx src/routes/RouteStatePage.test.tsx src/routes/AppRoutes.test.tsx src/routes/RouteGuards.test.tsx src/auth/tenantSession.test.ts src/auth/sessionExpiry.test.ts`

Expected: FAIL because descriptors, route states, and independent operations routing are absent.

- [ ] **Step 4: Convert route registries**

Replace static page imports with statically analyzable loader functions such as `load: () => import('../modules/dashboard/Dashboard')`. Redirects become descriptors. Preserve all current paths and gates verbatim. Apply permission guards before rendering `RouteContent`; only `RouteContent` wraps an authorized route loader with `lazy(load)`, so denied page chunks are not requested.

- [ ] **Step 5: Add route content and safe states**

`RouteContent` sets `${title} | Helior HRMS`, supplies a labelled Suspense status, and wraps the page in `RouteErrorBoundary`. `RouteStatePage` supports `loading`, `unavailable`, `access-denied`, `not-found`, and `unexpected`; copy is non-sensitive and gives a safe authorized return or retry action. Tenant/session mismatch and unauthenticated redirects remain unchanged.

- [ ] **Step 6: Separate operations from tenant resolution**

Select `/ops/login` and `/ops/*` before tenant-resolution rendering, but keep `OpsProtectedLayout` as the sole operations authorization boundary. Preserve tenant-prefixed canonicalization after tenant resolution.

- [ ] **Step 7: Verify GREEN and bundle behavior**

Run the Step 3 command, then `npm run build`. Expected: tests and build pass; Vite output contains separate page chunks and a materially smaller entry chunk than the recorded baseline.

### Task 8: Normalize Shared Copy and Complete Foundation Verification

**Files:** All Wave 0 files.

- [ ] **Step 1: Normalize central copy**

Update shared labels, placeholders, empty states, and busy text to sentence case and standard ellipses. Preserve route terminology and technical identifiers. Add literal behavior tests only where copy drives accessibility or recovery; do not add source-text tests.

Keep `graphQlUserMessage` as the single technical-to-domain translation boundary. Preserve its existing forbidden, connectivity, timeout, conflict, session, and domain-code regression tests; shared components render only its safe output.

- [ ] **Step 2: Run all focused Wave 0 tests**

Run: `npm test -- src/contexts src/components/common src/components/layout src/routes src/navigation src/utils/dateDisplay.test.ts src/utils/dateInput.test.ts src/utils/graphqlUserMessage.test.ts src/auth/tenantSession.test.ts src/auth/sessionExpiry.test.ts`

Expected: all focused tests pass with no warnings or unhandled rejections.

- [ ] **Step 3: Run the complete automated gate**

Run in order:

```powershell
npm test
npm run lint
npm run build
git diff --check
git status --short
git diff --stat
```

Expected: tests, lint, build, and whitespace checks exit 0; status contains only approved Wave 0 and planning files; no commit exists.

- [ ] **Step 4: Run static standards scans**

```powershell
rg -n "outline-none(?!.*focus-visible)|transition-all|user-scalable=no|maximum-scale=1|request rejected|API rejected" src --pcre2
rg -n "<div[^>]+onClick|<span[^>]+onClick" src/components/common src/components/layout
rg -n "from '../modules|from \"../modules" src/routes
```

Expected: no unexplained match in the implemented foundation; route page imports are dynamic only.

- [ ] **Step 5: Verify in the in-app browser**

Exercise light/dark theme, 320px mobile, tablet, desktop, 200% zoom, reduced motion, keyboard-only navigation, skip link, sidebar drawer, command palette, profile menu, notifications menu, nested modal, form error focus, table state, tenant-prefixed deep link, denied direct route, unknown route, forced-password route, and operations route during tenant failure. Record screenshots and unresolved runtime limits in the task report.

---

## Execution Decision

The user approved implementation and requested multi-agent delivery. Execute with `superpowers:subagent-driven-development`: one implementation agent per task, followed by an independent task reviewer and fix loop. Because the user prohibited automatic commits, use pre-task diff snapshots and explicit changed-file manifests instead of commit ranges; never commit merely to satisfy the generic skill workflow.
