# KabiPay UI — Feature documentation (implementation-validated)

This document reflects **what is actually implemented** in `kabipay-ui` as of the last review: routes in `src/routes/AppRoutes.tsx`, data loading via **`graphql-request`** + **`useGraphClient`** (`src/hooks/useGraphClient.ts`, `src/api/client.ts`), and runtime config from **`public/config.json`**. Behavior depends on **kabipay-gateway** + **kabipay-svc** subgraphs being up and on tenant/seed data.

---

## How to read the status column

| Status | Meaning |
|--------|---------|
| **Implemented** | Wired in UI, used in navigation (or intentional direct URL), calls API or shows real data path. |
| **Partial** | Screen exists and is functional for a subset of the old spec, or shows IDs instead of labels, or stats are client-side only. |
| **Present, not linked** | Route exists but no sidebar entry (direct URL only). |
| **Not in UI** | File may exist on disk but is **not imported** / not reachable. |
| **Stub / demo** | UI copy or export described as stub; still calls backend where noted. |

---

## Validation summary

| Area | Route(s) | Primary file(s) | Status | Notes |
|------|----------|-----------------|--------|-------|
| Login | `/login` | `modules/auth/LoginPage.tsx` | Implemented | REST `authUrl`; JWT stored for GraphQL. |
| Dashboard | `/dashboard` | `modules/dashboard/Dashboard.tsx` | Implemented | Composes punch, leave card, on-leave, holidays, notifications preview. |
| Punch in/out | (widget on dashboard) | `PunchInOut.tsx` | Implemented | `punchToday`, `punchDaySummary`; optional **browser geolocation** (not “mock”). No selfie capture. |
| Leave balance (dashboard) | (widget) | `LeaveBalanceCard.tsx` | Implemented | `leaveTypes`, `leaveBalances` for current year. |
| On leave today | (widget) | `OnLeaveToday.tsx` | Partial | Filters approved leave; list shows **employeeId** (UUID), not names/depts. |
| Upcoming holidays | (widget) | `UpcomingHolidays.tsx` | Implemented | `upcomingHolidays` (date, name, type, calendar). |
| Notifications preview | (widget) | `NotificationsPreview.tsx` | Implemented | Last 3 or 20; link to `/notifications`. |
| Attendance | `/attendance` | `AttendancePage.tsx` | Implemented | `shifts`, `attendance`, `timesheetEntries`; add entry via `TimesheetEntryForm`. |
| Attendance correction | — | `CorrectionRequestModal.tsx` | **Not in UI** | Component exists **but is not imported** on `AttendancePage`. |
| Leave | `/leave` | `LeavePage.tsx`, `ApplyLeaveModal.tsx` | Implemented | Board + `submitLeaveRequest`. **No** cancel-leave action in UI. |
| Payroll (overview + CSV) | `/payroll/payslips` | `PayrollPage.tsx` | Implemented | Salary components, cycles, India TDS + PF/ESI CSV exports. |
| Payroll (pay + tax UI) | `/payroll/pay`, `/payroll/tax` | `PayrollPayPage.tsx`, `PayrollTaxPage.tsx` | Implemented | Payslips with lines, tax configs/slabs/computations (see pages for scope). |
| Expenses & travel | `/expenses` | `ExpensesPage.tsx`, `SubmitTravelModal.tsx` | Implemented | Full board; submit expense via **GraphQL** (inline modal). `SubmitExpenseModal.tsx` is legacy/alert-based **not used** by this route. |
| Notifications | `/notifications` | `NotificationsPage.tsx` | Implemented | `announcements` + `notifications`; mark read / mark all; filter all vs unread; `actionUrl` supported. |
| Profile | `/profile/settings` | `ProfileSettingsPage.tsx`, tabs | Partial | Built from **auth user** + **`getDefaultUserProfile`** (local shaping); **no GraphQL** in `profile/` components. Documents tab uses **static/mock** document UI, not live file API. |
| Organization | `/organization/*` | `OrganizationEmployeesPage.tsx`, `OrgChartPage.tsx`, etc. | Implemented | Directory, org chart, documents, employee detail — GraphQL per page. |
| Workplace | `/workplace/*` | `workplace/*.tsx` | Implemented | Benefits, recruitment, onboarding, performance, learning, assets, grievance — list/query + actions per subgraph. |
| Admin employees | `/admin/employees` | `AdminEmployeesPage.tsx`, modals | Implemented | List + create/update employee mutations. |
| Admin attendance policy | `/admin/attendance-policy` | `AdminAttendancePolicyPage.tsx` | Implemented | Load/upsert policy via GraphQL. |
| Admin reports | `/admin/reports` | `AdminReportsPage.tsx` | Partial | One query loads employees, attendance, leaves, cycles, salary components; **client-side** filters (dates, employee). Summary cards; **no** department dimension. |
| Admin settings | `/admin/settings` | `AdminSettingsPage.tsx` | Partial | “Directory snapshot” table; not a full settings product. |
| Module health | `/admin/module-health` | `ModuleHealth.tsx` | Present, not linked | GraphQL probe per subgraph; **no** nav item in `Sidebar.tsx` — open URL manually. |
| Bulk CSV import (employees) | — | — | **Not implemented** | Old doc claim; no import flow found. |

---

## 1. Dashboard (`/dashboard`)

**Purpose:** Entry home: quick status, punch, leave snapshot, colleagues on leave, holidays, notification feed.

**Implementation detail**

- **PunchInOut** (`components/PunchInOut.tsx`): Live clock; loads **`punchDaySummary`** (work date, total minutes, segments, open segment). **`punchToday`** mutation with optional `{ latitude, longitude }` when “Record GPS location” is checked — uses **`navigator.geolocation`** (real device/browser location, not mock). Displays segment in/out times and stored coordinates when returned. **No** selfie or camera flow.
- **LeaveBalanceCard**: **`leaveTypes`** + **`leaveBalances`** (entitled/used/pending/balance per type, current year).
- **OnLeaveToday**: **`leaveRequests`**; keeps approved requests overlapping “today”. Renders **employee id** strings; does not resolve to employee names (backend could add, UI does not).
- **UpcomingHolidays**: **`upcomingHolidays`** with `holidayDate`, `name`, `holidayType`, `calendarName` (up to 12).
- **NotificationsPreview**: **`notifications`** limit 3 (compact) or 20 (tall sidebar); read/unread styling; “View all” → `/notifications`.

**Backend (typical):** attendance, leave, notification subgraphs via gateway.

---

## 2. Attendance & timesheet (`/attendance`)

**Implementation detail**

- **Shift templates:** `shifts(limit)` — name, times, night flag, work hours.
- **Recent attendance:** `attendance(limit)` — work date, check in/out, status, source, late minutes.
- **Timesheet:** `timesheetEntries(limit)` — date, hours, `projectCode`, description, status. **Add entry** opens modal with **`TimesheetEntryForm`** (GraphQL create — see component).
- **Correction requests:** `CorrectionRequestModal.tsx` is **not** mounted on `AttendancePage.tsx`. Treat as **unused** until wired.

**Gaps vs old spec:** No date-range picker on the main attendance table (fixed limit query). No in-page correction workflow.

---

## 3. Leave (`/leave`)

**Implementation detail**

- **Board:** `leaveTypes` + `leaveRequests` with flags (paid, carry forward, document).
- **Apply:** `ApplyLeaveModal` submits **`submitLeaveRequest`** with selected type, dates, reason.
- **Table:** Lists requests with status badges; **no** “cancel pending request” button in the table.

**Gaps:** Cancellation of pending leave not exposed. Employee column shows raw **employeeId**.

---

## 4. Payroll

### 4a. `/payroll/payslips` — `PayrollPage.tsx`

- **Salary components** and **payroll cycles** from GraphQL.
- **India statutory CSV (stub):** `indiaTdsMonthlySummaryCsv`, `indiaPfEsiMonthlySummaryCsv` — month/year controls; downloads blob; UI text states permission and “stub” nature.

### 4b. `/payroll/pay` — `PayrollPayPage.tsx`

- Tabs: Salary / Payslip / Income tax.
- **`payslips`** with **lines** (per component amounts), gross/net/deductions, `taxConfigurations`, `taxSlabs` for context.

### 4c. `/payroll/tax` — `PayrollTaxPage.tsx`

- Tax configuration, slabs, **`taxComputations`** list — full detail in component.

**Gaps vs old marketing copy:** “Regime comparison” and “tax-saving suggestions” are **not** implemented as dedicated flows; tax regime appears via data (e.g. configuration / chosen regime fields) as exposed by subgraphs.

---

## 5. Expenses & travel (`/expenses`)

**Implementation detail**

- Single page: **`expenseCategories`**, **`expenses`**, **`travelRequests`**.
- **Submit expense:** Inline modal + **`submitExpense`** (category id, amount, currency, date, title) — **not** the old `SubmitExpenseModal` alert demo.
- **Travel:** `SubmitTravelModal` uses GraphQL **`submitTravelRequest`**.
- **Approver:** If JWT has expense-approve capability, **`approveExpense` / `rejectExpense`**, **`approveTravelRequest` / `rejectTravelRequest`** (reason via `window.prompt` for reject).

**Gaps:** No receipt **file upload** in the live submit path (category/title/amount/date only). Old `SubmitExpenseModal.tsx` with fake submit is **orphaned** for this route.

---

## 6. Notifications (`/notifications`)

**Implementation detail**

- Query: **`announcements`** + **`notifications`** (kind, title, message, `actionUrl`, read state, `createdAt`).
- Mutations: **`markNotificationRead`**, **`markAllNotificationsRead`**.
- Filter: **All** vs **Unread** (client-side on loaded list).
- Icons map `kind` heuristically (company / personal / system).

**Deep links:** If `actionUrl` is set, UI can use it (see page implementation for link behavior).

---

## 7. Profile (`/profile/settings`)

**Implementation detail:** Tabs (About, Profile, Job, Documents). Data is derived from **`AuthContext`** user and **`getDefaultUserProfile`** — not a live employee GraphQL fetch for the signed-in user’s full HR record. **Documents** presentation is **mock/static** (types in `types` + local state), not wired to document upload/list APIs on this page.

For org-wide **real** employee/document lists, use **Organization** routes below.

---

## 8. Organization (`/organization/...`)

Routes: **employees** list, **employee detail**, **org chart**, **documents** — each uses GraphQL appropriate to directory/org/document subgraphs (see respective files under `modules/organization/`).

---

## 9. Workplace (`/workplace/...`)

| Path | Page | Pattern |
|------|------|---------|
| `/workplace/benefits` | `BenefitsPage.tsx` | GraphQL list + detail |
| `/workplace/recruitment` | `RecruitmentPage.tsx` | Job/application-style queries |
| `/workplace/onboarding` | `OnboardingPage.tsx` | Checklist list + toggle |
| `/workplace/performance` | `PerformancePage.tsx` | Cycles/goals style data |
| `/workplace/learning` | `LearningPage.tsx` | Skills/courses |
| `/workplace/assets` | `AssetsPage.tsx` | Categories/assets |
| `/workplace/grievance` | `GrievancePage.tsx` | Categories/cases + submit |

Exact field names and mutations are defined at the top of each file (`gql` blocks).

---

## 10. Admin (role `admin` only)

- **Employees** (`/admin/employees`): Paginated/table list; **CreateEmployeeModal** / **EditEmployeeModal** with **`createEmployee`** / **`updateEmployee`** and org list queries.
- **Attendance policy** (`/admin/attendance-policy`): Loads policy, **upsert** punch policy mutation.
- **Reports** (`/admin/reports`): Single combined query; **attendance / leave / payroll** report types with **summary tiles** and filtered tables. Filters: **start date, end date, employee**. Not a full BI export (no department slice, no PDF).
- **Settings** (`/admin/settings`): Employee snapshot table (codes, status, user link) — operational, not full tenant settings.
- **Module health** (`/admin/module-health`): Introspection-style query per subgraph to show green/red; **navigate manually** — not in `Sidebar.tsx`.

**Not implemented:** Bulk CSV **import**, bulk export, department-level report filters.

---

## 11. Auth, tenant, and API layer

- **AuthContext** + **TenantContext:** After login, JWT and tenant id drive **`useGraphClient('client')`** headers: `Authorization`, `x-tenant-id` (from user or `devTenantId` from config).
- **GraphQL client:** `src/api/client.ts` — `GraphQLClient` pointed at `gatewayUrl` from **`/config.json`** (see `src/config.ts` loaded at startup).
- **Roles:** `admin` unlocks `/admin/*`; employee vs admin sidebar items in `Sidebar.tsx`.

---

## 12. UI / UX (verified)

- **Theme:** `ThemeContext` — `light` / `dark`, persisted in **`localStorage`** (`theme` key), `class` on `document.documentElement`.
- **Layout:** `AppLayout` + **Sidebar** + **Header**; responsive collapse patterns as implemented in those components.
- **Accessibility:** Reasonable labels and focus in places; **no** formal WCAG audit — do not treat “WCAG AA everywhere” as validated.

---

## 13. Technical

- **Stack:** React 18, TypeScript, Vite, Tailwind, React Router.
- **Data:** Primary path is **GraphQL**; `graphql-request` with `gql` template strings.
- **Lint:** ESLint + Prettier (see repo config).

---

## 14. Intentionally not implemented (or out of date in old docs)

- Employee **bulk CSV import** / export.
- **Leave cancel** from UI.
- **Attendance correction** modal (file exists, not routed).
- **Receipt upload** for expenses on the live submit form.
- **Selfie** / camera for attendance.
- **Department**-scoped admin reports (only all-employee or one employee).
- **Module health** link in sidebar (URL only).

---

## 15. Future enhancements (optional roadmap)

Possible next steps: wire `CorrectionRequestModal`, employee name resolution on dashboard widgets, sidebar link to module health, receipt upload matching backend, automated tests (unit/E2E), stricter a11y audit.

---

## Related docs

- **README.md** — overview and stack.
- **LOCAL_SETUP.md** — database + services + `config.json`.
- **SETUP.md** — UI install.

---

## Conclusion

The KabiPay UI is **largely aligned** with the federated backend: major routes use **live GraphQL** through the gateway. This file supersedes generic “mock-first” descriptions: treat the **validation summary** and **gaps** sections as the source of truth for product and QA.
