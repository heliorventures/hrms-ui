# Helior HRMS All-Module UI/UX Modernization Design

## Status and Scope

This specification defines a foundation-first modernization of the complete Helior HRMS React UI. The live inventory contains 16 module directories, 50 `*Page.tsx` files plus the `Dashboard` and `ModuleHealth` route surfaces, 28 feature modal/dialog files plus the shared `Modal` primitive, 224 TSX files, tenant and operations route trees, and shared navigation, permission, feedback, and form infrastructure.

Planning is static and read-only with respect to application code. Browser behavior, visual appearance, responsive rendering, and end-to-end journeys remain unverified until each implementation wave is exercised in a browser. No GraphQL, Rust, database, authorization, or deployment behavior changes are authorized by this design.

## Problem

The application has useful foundations, including shared buttons, fields, cards, notices, modals, tables, navigation metadata, route guards, GraphQL error translation, and dark-mode styles. These foundations are not yet a complete design system and are applied inconsistently across modules.

Confirmed structural issues include:

- semantic colors are mixed with direct `gray`, `slate`, `indigo`, `red`, `amber`, and `emerald` utility choices, so equivalent states can look different;
- shared inputs use small mobile text and shared small buttons can produce undersized targets;
- the shared tab component exposes tab roles without a complete keyboard and panel relationship contract;
- the shared table handles basic rows and states but does not define captions, sorting, selection, pagination, responsive priority, or row-action behavior;
- overlays and dropdowns implement similar focus, dismissal, and positioning behavior independently;
- page filters, tabs, pagination, and selected records are usually component state rather than shareable URL state;
- route page components are imported eagerly, while the current production bundle reports a large main chunk;
- 13 TSX files exceed the project's 400-line maintainability target, including high-risk Admin, Attendance, Leave, Payroll, Timesheet, Organization, and employee-profile surfaces;
- loading, empty, partial, stale, success, warning, and error states are not represented consistently on every page;
- some pages still combine GraphQL operations, permissions, validation, modal state, and rendering in one component;
- browser page titles, skip navigation, responsive table behavior, and complete WCAG keyboard testing are not centralized.

The modernization must address these causes rather than restyling individual pages independently.

## Audit-Derived Critical Prerequisites

The all-module source audit identified correctness, privacy, authorization, and data-completeness risks that take priority over visual polish. They become explicit acceptance gates for the affected module:

- Tenant and operator login use browser-generated CAPTCHA values that are inaccessible and are not server security controls. Replace them only through a separately approved authentication/rate-limit design; the UI must not present the current challenge as meaningful bot protection.
- The route registry eagerly imports the complete tenant application. Route-level lazy loading is required before adding richer module UI so the existing large main bundle does not continue to grow.
- Notification Preferences links to a profile view that is not represented by the active profile page, while a separate notification-preferences component is dormant. Choose one active profile architecture and remove or migrate dormant variants after caller review.
- Dashboard widgets swallow some load failures and render valid-looking empty states. Every dashboard resource must distinguish failed, unavailable, empty, and loaded data.
- Insights can render raw webhook response bodies and internal integration terminology. Operational diagnostics require a separate capability and redacted server contract; business Insights must not display raw payloads.
- Attendance regularization and self-correction capabilities are represented separately but the correction trigger is gated only by self-punch permission. The affected UI needs explicit self-service and regularizer modes, while backend authorization remains authoritative.
- Attendance policy load failure silently substitutes 14 days. Timesheet lock-policy failure similarly substitutes defaults. Failed policy state must remain indeterminate and must not be displayed or saved as confirmed configuration.
- Timesheet history, leave master/transaction data, and expense master/transaction data reuse fixed shared limits. Valid current-period records, leave types, balances, categories, or linked travel can disappear while the UI appears complete. Separate page-oriented queries and visible pagination/completeness are required.
- Timesheet project-assignment load failure clears the selected list and the UI interprets an empty list as unrestricted access. Loading failure must fail closed, and unrestricted access must be an explicit confirmed state.
- Personal-profile updates can partially commit contact data before a legal-name/date review request fails. The UI must model independent outcomes or use a separately approved atomic orchestration contract.
- Employment controls display termination dates/reasons and role effective dates that are not sent to the backend. Unsupported fields must be removed or disabled with honest copy until a separately approved contract persists them.
- Company, identity, education, experience, tax-proof, announcement, and expense uploads use multiple browser/base64 flows. A shared staged-upload lifecycle is required to prevent memory pressure, abandoned files, duplicated submissions, and inconsistent validation.
- Payroll can label an employee UUID as an employee code, display statutory identifiers without a consistent privacy policy, and commit compensation assignment before showing the breakup “preview.” Payroll identity must be authoritative, sensitive fields must follow one mask/reveal contract, and preview must precede commit.
- Statutory payroll descriptions are hardcoded as product truth. Compliance copy must be configuration-derived, version/effective-date aware, and must retain reconciliation/preparation disclaimers.
- Admin timesheet-settings failures can populate valid-looking defaults or empty task lists that can then overwrite server configuration. Every settings resource must use explicit loading/loaded/failed state and block writes until canonical values load.
- Editing a role-targeted announcement can clear the role audience because edit hydration omits it. Audience preservation and a recipient preview are release gates for Notification Admin.
- Module Health mixes tenant and operator clients and can display business-data samples. Split tenant health from operator diagnostics and use redacted health contracts.
- Tenant and operator role replacement has no self-lockout or last-administrator safeguard. Privilege-impact diff, backend protection, confirmation, and audit context are required before RBAC visual modernization is complete.
- Tenant termination, module deactivation, feature-flag changes, balance overrides, workflow mutations, invoice creation, and payment recording lack a consistent high-risk action framework. Risk level, target, scope, consequence, reason, idempotency, and audit requirements must be explicit.
- Billing tenant filters do not scope every payment query, and financial forms accept unconstrained strings without arithmetic/currency/outstanding-balance validation. Correct tenant scope and decimal-safe validation precede billing restyling.
- Admin reports are capped client-side snapshots and can still export incomplete data; attendance status aggregation can count punch segments rather than unique employee-days. Complete server reporting or explicitly partial exports are required before reports are treated as authoritative.

These are static findings with live file evidence. Each affected work package must reproduce the behavior with representative roles and data before implementation and must verify the result in a browser afterward.

## Goals

- Preserve HeliorHRMS identity while creating one semantic visual language for every module.
- Make frequent employee tasks fast, clear, responsive, and forgiving.
- Give managers, HR administrators, tenant administrators, and platform operators efficient dense-data workflows without sacrificing accessibility.
- Standardize page shells, forms, tables, tabs, cards, status indicators, overlays, notifications, and user-facing messages.
- Meet WCAG 2.2 AA interaction requirements across keyboard, focus, target size, contrast, reflow, zoom, and non-color status communication.
- Keep route permissions and backend authorization authoritative and unchanged.
- Keep business rules out of JSX and keep touched components below 400 lines through focused hooks, reducers, formatters, and presentation components.
- Improve React performance by eliminating avoidable waterfalls, reducing eager bundles, narrowing subscriptions, and keeping large lists and controlled forms responsive.
- Produce a page/modal defect inventory before implementing each module.
- Allow independent modules to be implemented by parallel agents after shared contracts are stable.

## Non-Goals

- Copy Workday, SAP, Oracle, or another product's branding or component appearance.
- Replace React, React Router, Tailwind CSS, GraphQL Request, or the existing permission service.
- Adopt Redux solely for this modernization.
- Change payroll, attendance, leave, expense, workflow, or tenant business rules.
- Change GraphQL schemas, generated GraphQL documents, Rust services, Liquibase migrations, JWT claims, or RBAC semantics.
- Introduce decorative animation that does not clarify cause and effect.
- Hide unavailable functionality by visual treatment when the permission or feature contract says it must be inaccessible.
- Commit, push, deploy, or run Dart/Flutter commands. The user reviews and commits manually.

## Backend Dependency Policy

This program is UI-led, but several root causes require server pagination, atomic orchestration, redacted diagnostics, staged uploads, security controls, or stronger authorization safeguards. The UI plan records those dependencies but does not authorize cross-repository implementation.

For each dependency:

1. document the current UI symptom and live request contract;
2. define the smallest backend capability needed to make the UI truthful and safe;
3. obtain separate approval before changing GraphQL, Rust, database, auth, or deployment code;
4. make the UI fail closed or present an honest unavailable/partial state until that capability exists;
5. verify the UI, GraphQL, backend authorization, data persistence, and browser journey together before closure.

## Program Sequencing Gates

Modernization proceeds in this order so visual improvements cannot conceal an unsafe or incomplete workflow:

1. reproduce and document the affected role-based journey;
2. resolve or safely contain correctness, authorization, privacy, data-completeness, and destructive-action risks;
3. stabilize shared interaction, accessibility, feedback, and responsive contracts;
4. modernize the module information architecture and visual presentation;
5. verify focused behavior, browser journeys, accessibility, responsive states, performance, and cross-role integration.

An affected module is not complete while a critical backend dependency remains unresolved. A safe unavailable, read-only, or explicitly partial UI may be released only when it prevents unsafe action, does not imply complete or authoritative data, and has approved acceptance criteria.

## Standards and Design Principles

The implementation baseline is WCAG 2.2 AA, the current Vercel Web Interface Guidelines, React 18 performance guidance, and established enterprise list-report, object-page, form, and workflow patterns.

Every changed surface follows these rules:

1. **Clarity before decoration.** Hierarchy, labels, grouping, and recovery actions take priority over effects.
2. **One primary action.** A page, card, or modal has one visually dominant next action; secondary and destructive actions are clearly separated.
3. **Progressive disclosure.** Frequent fields and actions stay visible; advanced configuration is grouped without hiding required context.
4. **Designed states.** Loading, empty, sparse, dense, partial, stale, success, warning, error, read-only, and permission-limited states are intentional.
5. **Positive recovery copy.** Messages state what happened, preserve safe user input, and give the next action without exposing API, GraphQL, database, stack, or transport terminology.
6. **Keyboard parity.** Every pointer action has a keyboard path; drag behavior has a non-drag alternative.
7. **Responsive by information priority.** Mobile views preserve the most important decision data and move secondary detail into expandable regions rather than forcing desktop tables into tiny cells.
8. **Performance is UX.** Independent requests run in parallel, expensive modules load only when needed, and typing or filtering does not trigger avoidable whole-page rerenders.
9. **Role-aware, not role-fragmented.** Employee, manager, HR, tenant-admin, and platform-operator views reuse the same components while exposing authorized actions and density appropriate to the role.
10. **Locale-aware HR data.** Dates, times, currencies, numbers, names, and durations use explicit locale-aware formatting while API date-only values preserve their calendar meaning.

## Visual Foundation

### Brand and semantic colors

Keep the current HeliorHRMS indigo identity as the primary accent, but stop using color names as product semantics. Tailwind theme extensions or CSS custom properties will expose semantic tokens for:

- canvas, surface, raised surface, overlay, and selected surface;
- primary, secondary, muted, disabled, and inverse text;
- subtle, standard, strong, and focus borders;
- brand action and brand interaction states;
- information, success, warning, danger, and neutral statuses;
- chart series with color-blind-safe differentiation.

Status components include icon or text labels and never rely on color alone. Hover, active, and focus states increase contrast. Dark mode receives equivalent semantic tokens rather than ad hoc inversions.

### Typography and numeric data

- One page heading per route, with a predictable heading hierarchy below it.
- Body copy uses a comfortable reading line length; dense table copy may be smaller only where controls remain at least 16 px on mobile.
- Payroll, expenses, balances, hours, and comparative metrics use tabular numbers.
- Labels use sentence case and consistent HR terminology.
- Technical identifiers use a monospace treatment only where users need to compare or copy them.

### Spacing, shape, and elevation

- A shared spacing scale defines page gutters, section gaps, form rhythm, and dense table rhythm.
- Page content uses responsive max-width templates rather than one width for all workflows.
- Borders provide crisp separation; shadows are reserved for raised chrome, overlays, and selected elevation.
- Nested radii remain concentric and child radii never exceed their container.
- Animation is limited to opacity and transform where possible, is interruptible, and honors reduced motion.

## Information Architecture and Page Templates

The existing route and permission model remains authoritative. Navigation labels and grouping may be clarified, but route paths and access semantics do not change without separate approval.

All routes use one of five templates:

1. **Dashboard:** prioritized tasks, summary metrics, exceptions, and clear next actions.
2. **List report:** page header, URL-backed search/filter/sort/pagination, bulk actions, table or responsive list, and designed states.
3. **Object page:** identity header, status and primary actions, anchored/tabbed sections, audit/history context, and safe sensitive-data handling.
4. **Settings workspace:** section navigation, explanatory context, grouped forms, unsaved-change protection, and explicit save outcomes.
5. **Workflow inbox:** filterable queue, decision context, batch/individual actions, confirmation, and durable outcome feedback.

The application shell will provide:

- a skip-to-content link and stable main-content focus target;
- responsive `100dvh` behavior and safe-area-aware mobile padding;
- tenant context without competing with the route `<h1>`;
- permission-aware sidebar and command palette from the existing shared navigation model;
- mobile drawer focus containment and restoration;
- consistent profile and notification menus with menu/list semantics;
- route-aware browser titles;
- module-level lazy loading with a stable route loading boundary;
- distinct unauthorized, not-found, tenant-unavailable, and unexpected-error destinations instead of silently redirecting every unresolved route to the dashboard;
- scroll restoration and deep-linkable page state.

## Shared Component Architecture

Shared primitives remain centrally owned. Module agents consume them and may propose additions, but may not fork local variants that duplicate an existing contract.

### Actions

- `Button`: primary, secondary, outline, quiet, and danger variants; standard busy state that retains the action label; minimum target size; icon placement; no double submission.
- `IconButton`: required accessible label, tooltip where helpful, and minimum hit target.
- `ActionMenu`: keyboard navigation, Escape, click-away dismissal, focus restoration, collision-aware positioning, and destructive grouping.

### Forms

- `FormField`: label, required/optional hint, description, error, and stable IDs.
- `Input`, `Select`, `Textarea`, checkbox, radio, switch, date, time, currency, and file controls share height, focus, disabled, read-only, and error treatment.
- Searchable employee/entity pickers use combobox/listbox semantics and announce loading/result counts.
- Errors appear beside fields; submission focuses the first invalid field or form-level alert.
- Submit remains available until submission begins, preserves values after failure, and warns before abandoning unsaved work.
- Autocomplete, input mode, spellcheck, names, and date/time semantics are explicit.

### Data display

- `DataTable`: caption or accessible name, column headers, optional sorting, selection, row actions, pagination, loading skeleton, empty/error/partial states, and responsive priority metadata.
- Mobile behavior chooses a responsive table, card list, or detail drawer based on information hierarchy; horizontal scrolling is deliberate and labeled only where comparison requires it.
- `StatusBadge`: semantic status, icon/text redundancy, predictable vocabulary, and accessible contrast.
- `MetricCard`: label, value, comparison/context, loading and unavailable states, and tabular numbers.
- `Timeline` and audit history use semantic lists and preserve chronology at all widths.

### Navigation and overlays

- `Tabs`: Arrow/Home/End keyboard behavior, roving tab index, `aria-controls`, panel IDs, and optional URL synchronization.
- `Modal`: labelled/described dialog, focus containment, nested-dialog stack, background inertness, safe dismissal policy, mobile full-height behavior, and sticky action footer.
- `Drawer`: responsive detail or filter surface with the same focus contract.
- `ConfirmDialog`: explicit object/action wording, danger separation, and idempotent submission.
- Tooltip content never carries essential instructions that should be inline.

### Feedback and asynchronous states

- `PageNotice`: persistent actionable page/form errors and warnings.
- `FlashToastBar`: non-blocking success/information only unless an error is safely recoverable without action.
- `EmptyState`: explains why the area is empty and supplies the next authorized action.
- `Skeleton`: mirrors final geometry, appears only after a short delay, and avoids flicker.
- `Progress` and busy buttons expose current activity to assistive technology.
- Partial and stale data remain visible with a clear refresh/recovery path.

## Data, State, and React Performance

- Keep GraphQL request and business-rule orchestration in typed hooks/services rather than JSX.
- Use a reducer for pages with multiple dependent filters, selections, modals, and mutations; do not introduce a global state library for local workflow state.
- Start independent queries together and await them in parallel.
- Avoid fetching inactive tab data until the user activates or intentionally preloads the tab.
- Synchronize shareable tabs, filters, searches, sorts, dates, and pages with URL search parameters.
- Use functional state updates and primitive effect dependencies; split hooks with unrelated dependencies.
- Lazy-load route modules and heavy PDF/chart/editor dependencies. Preload likely next routes on deliberate hover/focus where measurement supports it.
- Use direct imports rather than broad barrels for heavy modules.
- Defer expensive filtering with `useDeferredValue` or transitions when measurement shows typing latency.
- Paginate server-side where APIs support it. For long client-side lists, use `content-visibility` or virtualization only after measuring.
- Preserve the existing centralized tenant/session/permission contracts. Visibility checks never replace direct-route and backend authorization.

## Error Handling and User-Facing Copy

`graphQlUserMessage` remains the central technical-to-domain translation boundary. Module-specific translators may add safe context but may not display raw request messages.

Messages follow this structure:

- concise outcome title;
- plain-language explanation;
- recovery action when the user can resolve it;
- role-specific escalation only when that role can actually help.

Examples:

- `Attendance was not saved. Review the highlighted details and try again.`
- `We could not load leave balances right now. Try again.`
- `This record changed after you opened it. Refresh and review the latest information.`
- `You do not have access to make this change. Contact your HR administrator if you need help.`

Sensitive pages must avoid revealing record existence, pay data, identity data, bank data, or authorization internals to unauthorized users.

## Accessibility Acceptance Criteria

- WCAG 2.2 AA is the minimum implementation target.
- Desktop pointer targets are at least 24 by 24 CSS pixels or have equivalent spacing; mobile targets are at least 44 by 44.
- Mobile text inputs use at least 16 px text and browser zoom is never disabled.
- Every interactive element has a visible, unobscured `focus-visible` indicator.
- Sticky headers, footers, and overlays do not obscure focused content.
- Every route supports keyboard-only completion for its primary journey.
- Every overlay moves, contains, and restores focus correctly.
- Headings, landmarks, labels, tables, lists, status updates, and buttons use native semantics before ARIA.
- Async updates use appropriate status or alert announcements without duplicate speech.
- Status, charts, and validation never depend on color alone.
- Layout reflows at 320 CSS pixels without losing information or actions, except deliberate two-dimensional comparison tables.
- Reduced-motion preferences remove non-essential movement.
- User-generated names, filenames, announcements, and long values wrap or truncate with an accessible full-value path.

## Complete Module and Page Plan

Each page begins with a page/modal defect inventory containing severity, reproduction path, file reference, confirmed static evidence, and browser checks. The inventory is approved before that module's implementation starts.

### Wave 0 — Shared foundation and shell

Scope:

- `src/index.css`, `tailwind.config.js`, brand constants, UI text, and formatters;
- all shared common components;
- app layout, header, sidebar, command palette, notification menu, and profile menu;
- tenant and operations route configuration, route guards, loading/not-found states, and permission integration;
- error translation, flash messages, page titles, skip link, focus, responsive shell, and route lazy loading.

Wave 0 is serial and centrally owned. No module agent starts implementation until its public component contracts and migration examples are approved and verified.

### Wave 1 — Public, authentication, and operations authentication

Pages:

- `MarketingPage`;
- `LoginPage`;
- `ForgotPasswordPage`;
- tenant resolving, tenant unavailable, tenant not found, forced-password-change, and protected-route states in route guards;
- `OpsLoginPage` and `OpsLayout`.

Features:

- tenant-aware branding and domain context;
- password-manager-safe login and recovery;
- accessible authentication errors and service-unavailable recovery;
- responsive marketing/auth layouts;
- security copy that does not disclose account existence;
- deterministic focus after validation, failure, redirect, and session expiry.

### Wave 2 — Employee home, profile, notifications, and insights

Pages:

- `Dashboard`;
- `ProfileSettingsPage` with Profile, About, Job Details, Notifications, and Security tabs;
- `NotificationsPage`;
- `AnalyticsPage`.

Features:

- prioritized employee tasks and exception-first dashboard cards;
- punch, leave balance, holiday, team absence, and notification summaries;
- URL-backed profile tabs and unsaved-change protection;
- one active profile/settings architecture, including a valid Notification Preferences destination and removal or migration of dormant variants after caller review;
- privacy-safe identity and security controls;
- announcement/private-notification distinction, attachment actions, read state, and deep links;
- analytics availability, chart accessibility, filters, partial-data messaging, and actionable empty states.

Modal:

- `CreateAnnouncementModal` where it is invoked from the notification experience.

### Wave 3 — Attendance, timesheets, leave, and calendars

Pages:

- `AttendancePage`;
- `TimesheetPage`;
- `LeavePage`;
- `LeaveHolidaysPage`;
- `LeaveTeamCalendarPage`.

Features:

- attendance calendar, punch segments, manual adjustment, self-service policy, and row-limit/partial-data guidance;
- weekly timesheet controls, project/task entry, status, submission, recall or adjustment behavior exposed by current APIs;
- leave balances, leave types, request history, approval status, holidays, and team availability;
- locale-safe date/time handling and calendar keyboard behavior;
- URL-backed date windows, filters, and selected views;
- compact mobile summaries with detail expansion instead of squeezed tables.

Modals:

- `ManualAttendanceModal`;
- `ApplyLeaveModal`;
- `AllHolidaysModal`;
- `LeaveRejectModal`;
- `LeaveWorkflowTrailModal`.

### Wave 4 — Expenses, travel, payroll, compensation, and tax

Pages:

- `ExpensesPage`;
- `PayrollPage`;
- `PayrollPayPage`;
- `PayrollCompensationPage`;
- `PayrollTaxPage`.

Features:

- expense/travel submission, receipt evidence, category/policy guidance, approval, rejection, and payment reference;
- employee payslip, salary, tax declaration, proof, and regime workflows;
- payroll cycles, exports, arrears, compliance, salary components/structures, assignment, and preview;
- privacy masking with an explicit authorized reveal interaction;
- locale-aware currency, Indian-number formatting where intended, tabular figures, and totals alignment;
- dense administrative tables with responsive priority and safe export feedback;
- lazy loading for PDF/export code and inactive payroll tabs.

Modals:

- `SubmitExpenseModal`;
- `SubmitTravelModal`;
- `ApproveExpenseModal`;
- `RejectReasonModal`;
- `PaymentReferenceModal`;
- `PayslipDetailModal`.

### Wave 5 — Organization, employee directory, employee profile, and documents

Pages:

- `OrganizationEmployeesPage`;
- `EmployeeDetailPage` and `EmployeeProfileShell`;
- `OrgChartPage`;
- `OrganizationDocumentsPage`;
- `ProfileReviewPage`.

Employee profile sections:

- Overview, Personal Information, Identity, Banking, Work Experience, Education, Documents, Employment Management, and Growth Timeline;
- employee header, sidebar identity, lifecycle timeline, salary timeline, and section states.

Features:

- URL-backed directory search/filter/page and deep-linkable profile section;
- object-page hierarchy and responsive profile navigation;
- field-level masking and authorization for identity, banking, salary, and document data;
- upload progress, type/size guidance, staged-upload recovery, preview/download, and deletion confirmation;
- one shared privacy policy for masked values, authorized reveal, clipboard behavior, and re-masking across identity, banking, salary, and document surfaces;
- org-chart keyboard/navigation alternatives and non-drag controls;
- profile-review comparison, changed-field emphasis, approval/rejection reasoning, and audit context.

Modals:

- `ConfirmationModal`;
- `ConfirmProfileActionModal`;
- employee-profile `UploadModal`;
- employment action modals composed by `EmploymentActionModals`.

### Wave 6 — Workplace, talent, onboarding, separation, assets, and grievance

Pages:

- `BenefitsPage`;
- `RecruitmentPage`;
- `OnboardingPage`;
- `AdminWorkflowsPage` when routed as Workplace Workflows;
- `PerformancePage`;
- `SuccessionPage`;
- `CompensationPage`;
- `LearningPage`;
- `AssetsPage`;
- `GrievancePage`.

Features:

- clear readiness states for modules whose APIs expose partial functionality;
- benefits plan comparison and enrollment/read-only states exposed by current services;
- recruitment vacancy/candidate/application information architecture exposed by current services;
- onboarding checklist, exit request, separation queue, clearance, and settlement context;
- workflow designer steps and approval routing without changing workflow rules;
- performance goals/reviews, succession pipelines, compensation planning, and learning catalogs exposed by current APIs;
- grievance privacy, safe escalation language, chronology, and support next steps;
- asset categories, inventory, assignment, return, history, retirement, employee/location pickers, status, pagination, and filters.

Asset modals/dialogs:

- `AssetCategoryModal`;
- `AssetModal`;
- `AssetAssignmentModal`;
- `AssetReturnModal`;
- `AssetRetireDialog`.

### Wave 7 — HR operations and tenant administration

HR pages:

- `HrHomePage`;
- `AdminEmployeesPage` when routed as HR People;
- `HrLeavesPage`;
- `HrTimesheetsPage`;
- `HrTimesheetProjectAssignmentsPage`;
- `HrAccessManagementPage` when routed as Roles and Permissions.

Admin pages:

- `AdminEmployeesPage`;
- `AdminAttendancePolicyPage`;
- `AdminHrTimesheetSettingsPage`;
- `AdminLeaveSettingsPage`;
- `AdminExpenseCategoriesPage`;
- `AdminNotificationsPage`;
- `AdminReportsPage`;
- `HrAccessManagementPage` at the Admin route;
- `AdminSettingsPage`;
- `ModuleHealth`;
- `AdminWorkflowsPage` where exposed to administrators.

Features:

- HR work queue and summary hierarchy;
- employee create/edit, account provisioning/reset, status, bulk/import actions exposed by current APIs, and permission feedback;
- leave and timesheet review with filterable queues, batch preview, explicit selection counts, and durable outcomes;
- role, permission, scope, and user-role management with security-impact explanations;
- attendance/timesheet/leave/expense policy settings with grouped forms, effective context, unsaved-change protection, and audit-friendly success messages;
- announcements, direct notifications, targeting, attachments, scheduling, and delivery feedback;
- report catalog, parameters, generation, details, export, partial results, and no-data states;
- module health status, refresh, dependency context, and incident-safe language;
- tenant settings and workflow configuration without exposing raw infrastructure details.

Modals:

- `AddEditEmployeeModal`;
- `CreateEmployeeModal`;
- `EditEmployeeModal`;
- `ExpenseCategoryModal`;
- `ExpensePolicyModal`;
- `TimesheetBatchPreviewModal`.

### Wave 8 — Platform operations

Pages:

- `OpsTenantsPage`;
- `OpsModulesPage`;
- `OpsBillingPage`;
- `OpsOperatorsPage`;
- `OpsFeatureFlagsPage`.

Features:

- tenant lifecycle, provisioning options, migration intent, status, and confirmation;
- module catalog and per-tenant subscriptions;
- invoices, payments, balances, and billing tables;
- platform operator creation/status/security actions;
- tenant-scoped feature flags and URL-backed tenant context;
- high-risk action confirmation, explicit scope, idempotent submission, and audit-oriented feedback;
- shared preflight and consequence summaries for tenant termination, module lifecycle, feature flags, invoices, payments, migrations, and operator privilege changes;
- responsive dense tables and copyable technical identifiers without leaking secrets.

Modals:

- `CreateInvoiceModal`;
- `RecordPaymentModal`.

### Wave 9 — Cross-role integration and release readiness

Exercise complete journeys for:

- employee self-service;
- manager approvals and team context;
- HR operations;
- tenant administration;
- payroll and tax administration;
- platform operations;
- permission-limited and session-expired users;
- mobile, keyboard-only, reduced-motion, dark-mode, zoom, sparse-data, dense-data, and service-failure scenarios.

## Multi-Agent Delivery Model

### Ownership rules

- One central foundation agent owns `src/components/common`, `src/components/layout`, `src/navigation`, `src/routes`, global CSS/theme, common formatters, error translation, and shared test utilities.
- Module agents receive disjoint directories and may not modify shared foundations directly.
- A module agent that needs a shared change submits the required contract and evidence to the central owner; the central owner implements and verifies it before module adoption.
- Route, permission, auth/session, generated GraphQL, and deployment changes are never inferred from a visual redesign.
- No agent commits or pushes.

### Parallelism

- Wave 0 runs serially.
- Waves 1 and 2 may run in parallel only after shell contracts are stable because their module write sets are disjoint.
- Within later waves, independent agents may own Time and Leave, Expenses and Payroll, Organization and Workplace, HR and Admin, or individual high-complexity pages when write sets do not overlap.
- Pages that share a large hook or component are assigned to one agent or sequenced; two agents never edit the same file concurrently.
- A reviewer agent performs static UX/accessibility review after each module, while verification remains centrally coordinated.

### Module work package

Every module package contains:

1. approved page/modal defect inventory;
2. before-state browser captures for supported roles and breakpoints;
3. exact files and shared contracts in scope;
4. user journeys and acceptance criteria;
5. TDD tasks and focused test commands;
6. accessibility and responsive checks;
7. performance risks and measurement plan;
8. integration and rollback notes;
9. explicit exclusions;
10. final evidence and remaining runtime gaps.

## Testing and Verification Strategy

### Test-driven implementation

Behavior changes follow red-green-refactor. Existing behavior tests are preserved unless the approved UX contract intentionally changes the behavior. Tests assert user-visible outcomes rather than component internals.

### Per-component coverage

- shared primitives: variants, disabled/busy/read-only/error states, focus, keyboard, accessible names, and dark-mode class contracts;
- forms: label association, first-error focus, value preservation, submit behavior, and unsaved changes;
- tabs/menus/overlays: keyboard model, focus containment/restoration, Escape, click-away policy, and panel relationships;
- tables: accessible headers/names, sort state, selection, pagination, responsive alternatives, and designed states;
- feedback: alert/status semantics, recovery action, technical-message suppression, and long content.

### Per-module coverage

- focused unit tests for formatters, validators, selectors, and reducers;
- component interaction tests for primary create/edit/approve/reject/upload/download flows;
- route-guard tests for direct URLs and permission-limited visibility;
- browser journeys for employee, manager, HR, admin, payroll, and platform roles;
- responsive checks at mobile, tablet, laptop, desktop, and zoomed/ultra-wide conditions;
- keyboard-only and reduced-motion checks;
- visual regression for the shared shell and representative templates after the visual baseline is approved.

### Verification gate for every module

Run the least expensive focused checks first, then the complete gate before handoff:

- focused Vitest tests;
- focused ESLint with zero warnings;
- TypeScript/Vite production build;
- complete Vitest suite at wave integration;
- browser journey and accessibility inspection for the module;
- responsive and dark-mode visual review;
- `git diff --check`, status, and diff-scope inspection;
- no Dart or Flutter commands;
- no commit, push, deployment, schema generation, or backend migration unless separately approved.

## Definition of Done

A page or modal is complete only when:

- its approved defect inventory has been reconciled item by item;
- it uses shared tokens and components without a local competing pattern;
- primary and recovery journeys work for the authorized roles;
- loading, empty, sparse, dense, partial, stale, success, warning, and error states are addressed where applicable;
- keyboard, focus, screen-reader semantics, target size, contrast, zoom, reduced motion, and responsive behavior have evidence;
- technical errors cannot reach the user;
- shareable state survives refresh and browser navigation where applicable;
- touched components stay below 400 lines or have an approved extraction plan completed in the same module;
- focused tests, lint, production build, and relevant browser checks pass;
- no unrelated files were changed and no automatic commit was created.

The modernization program is complete only after every wave meets this definition and Wave 9 cross-role integration passes.

## Risks and Controls

- **Visual drift between agents:** central ownership of tokens and primitives; module agents cannot create competing variants.
- **Large merge conflicts:** disjoint write sets, serialized shared work, and small module batches.
- **Business-rule regressions:** preserve service contracts, add journey tests, and review UI permission gates with backend authorization boundaries.
- **Performance regression from richer UI:** route lazy loading, direct imports, measured rerenders, and bundle comparison at every wave.
- **Accessibility regression:** shared interaction contracts plus keyboard/browser evidence, not static ARIA inspection alone.
- **Big-bang release risk:** foundation-first waves with review and release gates after each coherent module group.
- **Incomplete placeholder modules:** label availability honestly and design useful next steps without inventing unsupported backend behavior.
- **Sensitive-data exposure:** fail closed, preserve masking, verify role boundaries, and avoid record-existence disclosure.

## Design Decision

Use the foundation-first, module-wave approach. Reject independent page-by-page restyling because it would reproduce inconsistent components, and reject a big-bang redesign because it would make review, regression isolation, and release safety impractical.
