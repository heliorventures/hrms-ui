# HRMS Navigation and User Feedback Design

## Problem

The HRMS application has useful navigation and error-handling foundations, but their responsibilities are fragmented.

Navigation metadata is duplicated between `src/navigation/sidebarNavigation.tsx` and `src/navigation/navCatalog.ts`. The sidebar and command palette can therefore drift in labels, grouping, icons, and search terms. The responsive shell also uses one `sidebarOpen` value for different desktop and mobile behaviors. It starts as `true`, which opens the drawer on a narrow first load, while the desktop `lg:translate-x-0` class prevents the same state from collapsing the sidebar.

User feedback is similarly inconsistent. `graphQlUserMessage` already translates many stable GraphQL codes and known validation failures, but pages and modals render the resulting text through many unrelated paragraphs and cards. Most of those surfaces do not provide a consistent severity, recovery action, focus target, or live-region behavior. Some policy and help text also exposes implementation terminology. Attendance currently tells employees that "the API rejects self-service updates," and the Adjust Attendance modal repeats API and permission language.

The result is technically oriented copy, inconsistent feedback placement, duplicated navigation configuration, incomplete keyboard behavior, and avoidable responsive-navigation defects.

## Goals

- Provide one typed navigation model for the tenant sidebar and command palette.
- Keep route authorization in the existing centralized permission service and route guards.
- Make mobile navigation closed by default and keyboard accessible.
- Let desktop users choose an expanded sidebar or compact icon rail and remember that preference.
- Establish one persistent feedback component for page-level and modal-level outcomes.
- Keep correctable field validation beside the affected control.
- Prevent raw infrastructure or implementation language from reaching users.
- Replace Attendance policy copy with clear employee and HR guidance.
- Migrate the complete Attendance page and Adjust Attendance modal to the shared feedback behavior in this delivery.
- Add durable regression coverage for navigation state, feedback translation, policy copy, and keyboard behavior.

## Non-Goals

- Redesign every HRMS module in one delivery.
- Change GraphQL schemas, Rust services, database migrations, JWT claims, RBAC rules, or route authorization semantics.
- Replace React Router, Tailwind CSS, or the existing permission service.
- Add analytics, telemetry, or an external notification service.
- Change business rules for the Attendance self-service window or regularization permissions.
- Commit or push changes. The user will review and commit manually.
- Run Dart or Flutter commands.

## Navigation Architecture

### Single navigation model

Replace the two user-navigation catalogs with one typed model under `src/navigation`. Each destination will define:

- `path`
- `label`
- `section`
- `keywords`
- optional `icon`
- display placement and ordering

The model describes only discoverable destinations. It will not contain route elements or duplicate permission rules. Sidebar and command-palette selectors will call `canAccessTenantPath` for every destination, preserving the existing `permissionService` contract.

Pure selectors will derive:

- visible primary destinations
- visible grouped destinations
- command-palette results
- sidebar-filter results
- the section containing the active path

This keeps navigation search, labels, grouping, and permission visibility consistent while leaving `appRouteConfig.tsx` and `RouteGuards.tsx` responsible for rendering and direct-URL protection.

### Responsive shell state

Mobile and desktop navigation state will be separate:

- `mobileMenuOpen` starts as `false` on every load.
- `desktopSidebarCollapsed` restores a versioned boolean preference from local storage.

The mobile menu button opens a drawer. While open, the drawer locks background scrolling, receives focus, supports Escape, and restores focus to the menu button when closed. The backdrop is presentation-only; the drawer remains the named navigation region. Selecting a destination closes the mobile drawer.

On desktop, the sidebar can switch between the full-width navigation and a compact icon rail. Compact destinations expose accessible names and visible tooltips. The compact preference persists across visits. The full-width sidebar retains filtering and section labels; compact mode relies on icons, tooltips, and the existing command palette.

### Section behavior

The section containing the current route opens when navigation enters that section. After it opens, the user may collapse it. Navigating to another grouped destination opens the newly active section. Search temporarily expands sections that contain matches without permanently overwriting the user's section state.

Section buttons expose `aria-expanded` and reference the controlled region. Navigation links retain native React Router link behavior, including keyboard activation and browser open-in-new-tab support.

### Header semantics

The top bar presents the tenant name as workspace context, not as a page-level heading. Individual pages continue to own their `<h1>` through `PageHeader`. The mobile menu trigger exposes its current expanded state and the desktop sidebar control has a specific accessible label for expanding or collapsing navigation.

Animation is limited to transform and opacity. Reduced-motion preferences disable non-essential transitions.

## Feedback Architecture

### Persistent feedback component

Evolve `PageNotice` into the shared persistent feedback surface. It accepts:

- severity: error, warning, success, or information
- message content
- optional concise title
- optional recovery action
- optional dismiss behavior
- a focusable target for submission failures

Error notices use assertive alert semantics. Success and informational updates use polite status semantics. The component supplies consistent spacing, contrast, dark-mode styling, and long-text wrapping.

Field-level validation remains in `Input`, `Select`, and equivalent form controls because those errors are directly correctable. A failed form submission displays the persistent notice above the form content and moves focus to it. A successful create, update, approve, reject, or refresh action may use the existing toast when no further user decision is required.

Toasts must not be the only place for an error that requires correction. Success and information toasts use polite announcements; errors that remain transient are limited to non-blocking failures where the underlying page remains usable.

### Error translation

`graphQlUserMessage` remains the central translation boundary. It applies this order:

1. Map a stable backend error code to approved user copy.
2. For validation responses, map known domain phrases to specific recovery guidance.
3. Map authentication, authorization, missing-record, conflict, and temporary-service categories.
4. Replace every unknown technical message with a safe fallback.

Rendered messages must not expose API, GraphQL, backend, database, SQL, constraint, stack trace, exception, resolver, HTTP status, or internal request terminology.

Copy follows these rules:

- State what happened in plain language.
- Give the next action when the user can recover.
- Identify HR, a manager, or an administrator only when that role can resolve the issue.
- Use second person and active voice.
- Do not disclose record existence or authorization details that the user is not permitted to know.
- Use an ellipsis character for active loading states.

Representative categories are:

- Invalid input: `Check the highlighted details and try again.`
- Permission: `You do not have access to make this change. Contact your HR administrator if you need help.`
- Session expiry: `Your session has expired. Sign in again.`
- Temporary load failure: `We could not load attendance right now. Try again.`
- Stale conflict: `This information changed since you opened it. Refresh and review the latest details.`

## Attendance Journey

### Policy explanation

The Attendance page and Adjust Attendance modal use one formatter for policy guidance.

Standard employee copy:

> You can add missed punches from the last **{days} calendar days**. For an earlier date, ask HR or your manager to adjust your attendance.

Additional copy for a user with attendance-regularization access:

> You can also adjust earlier dates because your role includes attendance regularization.

The formatter receives the configured self-service day count and the existing `canRegularize` capability. It does not calculate or change eligibility.

### Page feedback

Initial load failures render a persistent error notice with Retry. Existing loaded attendance remains visible if a later refresh fails. Successful refreshes use a concise success toast or status notice.

The row-limit warning remains persistent because it affects the reliability of the displayed period. Its copy will explain that the view contains only part of the attendance history and ask the user to narrow the selected period, without mentioning server-side paging.

### Adjust Attendance modal

Local date, time-order, overlap, and daily-total validation remains inline. A request failure displays a focused persistent notice at the top of the modal and leaves every entered value intact. The modal closes only after a confirmed save. Busy buttons use `Saving…`, remain disabled only while the request is active, and retain specific action labels when idle.

## Accessibility and Interaction Requirements

- Every icon-only control has an accessible name.
- Section controls expose `aria-expanded` and `aria-controls`.
- Sidebar, command palette, dropdowns, and notices provide visible `focus-visible` states.
- Mobile drawer and command palette support Escape and focus restoration.
- Opening an overlay does not leave focus behind it.
- Async validation and feedback changes use appropriate live-region semantics.
- Decorative icons are hidden from assistive technology.
- Mobile interactive targets remain comfortably tappable.
- Reduced-motion preferences disable non-essential drawer and chevron animation.
- No clickable `div` or `span` substitutes for links or buttons.

## Component and File Boundaries

The implementation plan may adjust exact filenames after verifying imports, but the intended responsibilities are:

- `src/navigation/navigationModel.tsx`: navigation definitions and types.
- `src/navigation/navigationSelectors.ts`: pure permission, grouping, filter, and active-section selectors.
- `src/components/layout/Sidebar.tsx`: shell composition and responsive state integration.
- focused sidebar child components: desktop rail, mobile drawer, sections, destinations, and filter.
- `src/components/layout/AppLayout.tsx`: mobile-open and desktop-collapse ownership.
- `src/components/layout/Header.tsx`: semantic tenant context and navigation triggers.
- `src/components/layout/CommandPalette.tsx`: results derived from shared selectors.
- `src/components/common/PageNotice.tsx`: persistent feedback presentation and semantics.
- `src/components/common/FlashToastBar.tsx`: polite success/information announcements; actionable errors remain in `PageNotice` instead of auto-dismissing.
- `src/utils/graphqlUserMessage.ts`: safe domain error translation.
- Attendance policy formatter colocated with Attendance domain utilities.
- `AttendancePage.tsx` and `ManualAttendanceModal.tsx`: first complete journey adoption.

No component touched by this work should grow beyond the project's 400-line maintainability target. Existing oversized files are not broadly refactored unless the changed responsibility requires a focused extraction.

## Regression Coverage

Pure Vitest coverage will verify:

- sidebar and command palette derive destinations from the same model
- permission filtering excludes inaccessible destinations
- grouped filtering returns only matching destinations
- active-section selection handles nested paths
- Attendance policy copy changes with day count and regularization capability
- stable GraphQL codes map to approved copy
- unknown technical errors return safe fallback copy
- technical terms are not leaked by representative database, network, and constraint failures

Component interaction coverage will verify:

- mobile navigation is closed on first render
- opening the drawer updates expanded state and moves focus appropriately
- Escape closes the drawer and restores focus
- selecting a mobile destination closes the drawer
- desktop compact state can be toggled and restored
- section controls expose correct accessibility state
- modal submission errors remain visible, receive focus, and preserve entered values
- success and error feedback use the intended live-region semantics

If component test dependencies are absent, add only the React Testing Library, user-event, and DOM environment packages needed for these behaviors. No browser-testing framework is introduced in this slice.

## Verification

Use test-driven development for behavior changes: write each regression test, confirm the expected failure, implement the behavior, and confirm the test passes.

After focused tests, run:

- full `npm test`
- `npm run build`
- focused ESLint for changed source and test files
- `git diff --check`

Do not run Dart or Flutter commands. Do not commit or push. The current in-app browser is unavailable, so browser validation must be reported as pending unless a browser becomes attached before completion.

## Alternatives Considered

### Visual-only refresh

Changing colors, spacing, and visible strings without consolidating navigation or feedback would be faster, but duplicated definitions and inconsistent feedback behavior would remain. Rejected because it does not address the causes of drift.

### Whole-application migration

Migrating every page and modal at once would create immediate consistency, but it would greatly increase regression risk and make review difficult in the current dirty worktree. Rejected for this delivery.

### Foundation plus complete journey slice

Create the shared navigation and feedback foundations, then migrate the complete Attendance journey before expanding module by module. Selected because it establishes durable contracts while keeping this delivery reviewable and testable.
