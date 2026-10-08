# Shared page information panel

The employee and operator shells expose one **Page information** icon at the top right when the current page has supporting information. Clicking it opens the existing right-side drawer. Secondary information no longer occupies space in the main record area.

## Implementation

- `src/components/common/PageInformationProvider.tsx` owns section registration and the drawer. Route, tenant, and authorization changes dismiss employee-page information. Operator navigation/account changes dismiss operator information.
- `src/components/common/PageInformation.tsx` portals current content into the drawer, retaining the originating component's React context and permission conditions. Unmounted sections unregister. Content outside either shell has a standalone information control.
- `src/components/common/PageInformationButton.tsx` supplies the accessible shared trigger; the drawer supplies Escape dismissal, focus handling, backdrop dismissal, and responsive viewport sizing.
- `src/components/common/PageHeader.tsx` sends supporting descriptions to the same panel.
- `src/components/layout/AppLayout.tsx`, `Header.tsx`, and `src/modules/ops/OpsLayout.tsx` integrate the shared control without remounting the application shell on navigation.

Add future supporting content with:

```tsx
<PageInformation title="Entry policy">
  <p>{policyExplanation}</p>
</PageInformation>
```

Keep the section inside its existing authorization and active-tab conditions. Do not register hidden tabs' content or replace permission checks. Do not move primary records, field labels, validation, errors, action warnings, or consent disclosures into this panel.

## Migrated content

| Area | Information moved |
| --- | --- |
| Leave | Holidays and leave-type references from the highlighted accordions; single-column leave-type cards |
| Attendance | Attendance totals guidance, adjustment policy, shift templates; single-column shift cards |
| Timesheet | Page guidance and entry policy |
| Dashboard | Explanation of multiple punch segments and daily totals |
| Leave administration | Page introduction and comp-off policy precedence |
| Expense administration | Policy matching explanation |
| Employee administration | Administrative employee notes |
| Attendance administration | Shift reference list |
| Administration settings | Existing informational notes about pending controls |
| Notification administration | Celebration delivery explanation |
| Module health | Probe explanation |
| Roles and permissions | Access-management explanation |
| Timesheet project assignments | Directory visibility explanation; save/empty-selection instructions remain inline |
| Team leave calendar | Calendar-reading guide |
| Insights and attendance reports | Metric and reporting-period explanations |
| Notifications | Public-announcement and private-notification explanations |
| Employee directory/profile review | Privacy and review-process explanations |
| Payroll | Arrear calculation, export-period, and tax-configuration explanations |
| Pre-joining administration | Page introduction |
| Surveys | Page-level aggregate-reporting explanation |
| Operator pages | Shared page descriptions, account reference, provisioning reference |

Other pages were checked for similar supporting sections. Primary data remains on its dedicated page: employee/profile details, payslips, balances, holiday listings, notification records, performance/recruitment/learning/benefit/succession records, survey results, and approval queues. Authentication, candidate-form instructions, empty/error states, action-specific form guidance, payroll export limitations, and privacy/consent disclosures remain visible where needed.

## Verification (2026-09-09)

- 85 tests passed across 15 test files: shared information/header/drawer behavior, Leave, Attendance, Timesheet authorization, Notifications, notification administration, Insights, payroll authorization, Pre-joining, Surveys, and employee/operator shell routing and focus.
- Production bundle built with `node node_modules/vite/bin/vite.js build`; existing Browserslist-age and large-chunk warnings remain.
- The seven shared information/header source and test files pass ESLint with `--max-warnings 0`.
- Scoped `git diff --check` passed.
- Full TypeScript verification is not clean: the most recent run reported errors in concurrently edited `src/modules/admin/AdminWorkflowsPage.test.tsx` and `src/modules/admin/workflowSetup.ts`. These files are outside this change. An earlier run encountered concurrent navigation errors that changed during the session.
- Migrated legacy-page lint is checked separately from the clean shared components; full-page lint is not a release acceptance claim.
- No browser was connected, so live signed-in desktop/mobile appearance and interactions were not verified. No deployment, data writes, or commits were performed.

Live acceptance: open Leave and confirm the two reference accordions are absent; use the top-right information icon to view both references and open the holiday list. Repeat Attendance/Timesheet, a page with nested informational sections, and operator pages at desktop/mobile widths. Confirm one icon, keyboard focus return, scrolling, dismissal on navigation, and continued visibility of records and actionable errors.
