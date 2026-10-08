# Feature workspace review

The approved change separates independent tasks that previously appeared one below another. Each tab contains its own records, controls, and actions. Existing URLs still work; `?tab=` links select a feature and preserve other query parameters. Browser Back restores the selected feature. Unknown or inaccessible tabs fall back to the first permitted feature.

## Changed tenant workspaces

| Page | Resulting feature areas |
| --- | --- |
| Expenses & Travel | Expense Claims; Travel Requests, with domain-specific submit and configuration actions |
| Announcements & Messages | Announcements; Direct Notifications; Automated Greetings when available |
| Hiring & Applicants | Job Openings; Applicants, including View applicants for an opening and Show all applicants |
| Notifications | My Notifications; Announcements & Team Posts, with posting controls only in the latter |
| Learning | Courses; Skills, with independent pagination positions |
| Benefits | My Enrollments when allowed; Benefit Plans; Benefit Types, with creation actions in their respective areas |
| Salary Bands & Reviews | Review Cycles; Salary Bands, with independent pagination positions |
| Succession | Talent Pools; Competencies, with independent pagination positions |
| Expense settings | Expense Categories; Expense Policies |
| Timesheet & attendance settings | Missed Punch Rules; Timesheet Lock Rules; Projects; Project Task Types |
| Salary setup | Salary Components; Salary Structures; Assign Employee Salary, with explicit next-step buttons |
| Payroll administration | Payroll Runs; Arrears; Employer & Statutory Details; Unpaid Leave Rules; Salary Components; authorized Payroll Exports |
| Tax settings | Tax Versions; Income Tax Slabs; Deduction Sections; Tax Computations; authorized Submit Declaration |
| Organization documents | Company Documents; My Documents; Document Requirements |
| Grievances | Cases first; File a Case opens the filing form on request |

Announcements, direct notifications, company document upload, grievance filing, tax-version creation, and slab creation open on request. File inputs preserve their selection when an editor is closed and reopened; successful document uploads reset the native picker as well as the data model. Active panels alone contribute content to the page-information drawer.

## Review decisions

- Assets, onboarding/exit, performance, leave settings, access management, payroll self-service, analytics, reports, profile, and My Work already separate tasks with tabs, routes, or contextual views. Their established workflows were retained.
- Attendance summaries, attendance records, and their period controls form one task. Timesheet controls and the timesheet calendar similarly belong together; introducing a tab between those controls and records would add unnecessary navigation.
- Employee lists/details, organization chart, pre-joining review, leave approval queues, and workflow configuration have cohesive primary workflows or existing scoped views. Their records were not arbitrarily split.
- Existing survey edits belong to concurrent work and were not modified.
- Operations consoles are outside this tenant-workspace restructuring; their data operations were not changed.

## Safeguards and limits

- The existing permission predicates and backend mutations remain authoritative. Restricted panels are permission-gated; hiding a panel is not authorization.
- Tab selection is resolved against current permitted tabs on every render. Inputs remain mounted to retain drafts and filters; no new persistent storage is introduced.
- Existing board queries and their limits remain. This is a navigation/layout change, not a claim of reduced network traffic. In particular, hiring filters the existing latest-50 application collection and explicitly discloses that limit.
- No commits, deployment, migrations, or production writes were performed.
- Browser discovery returned no available browser connection. Signed-in desktop/mobile visual acceptance remains unverified.

## Validation

Focused tests cover keyboard tabs, panel relationships, deep links and Back navigation, query preservation, inaccessible-tab fallback, permission revocation, draft preservation, active-feature guidance, expense actions, hiring flow, communication audience/video handling, payroll access, document file preservation/reset, and route registration. Final command results are recorded in the implementation plan after verification.

The checkout has pre-existing lint findings in several large legacy pages. Comparison against HEAD distinguishes those from the new shared components and feature bindings; passing tests or builds do not imply repository-wide lint cleanliness.


Final results: **80 tests passed in 14 suites; TypeScript and production build passed.** New shared tab components and communications bindings pass lint. The full changed-page lint check reports **93 findings** and is not clean. Scoped diff whitespace checks passed. Desktop/mobile browser verification remains unavailable.
