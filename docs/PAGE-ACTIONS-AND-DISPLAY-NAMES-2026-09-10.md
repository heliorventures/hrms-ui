# Page actions and employee display names

## Changes

- Upcoming holidays render as three compact date chips. Hover, keyboard focus, or tap exposes the holiday name, full date, and calendar. Escape dismisses details. Holiday-type badges are removed.
- Expense categories and claim limits are registered with the existing PageInformation drawer. The reference list uses one column at drawer width and retains existing expense-read authorization.
- PageActions supplies right-aligned wrapping action rows. Recognized non-destructive header actions use icons, accessible names, and hover/focus labels. Ordinary buttons and final submit/approve/delete controls keep their text.
- Adopted the action row in employee/category administration, leave settings, attendance, expenses, managed attendance, leave approvals, leave requests, tasks, notifications, profile/security, and the shared PageHeader. Dashboard shortcuts use icon links.
- EmployeeDisplayNameProvider reads firstName and lastName through the signed-in user's myEmployee query. The backend resolves the current user's employee within the tenant. Greeting and profile use that name, including initials. Account name is the fallback if no name is available. Account/tenant changes invalidate old results and late responses are ignored.

## Verification

- Production TypeScript/Vite build passed. Existing chunk-size and Browserslist warnings remain.
- Scoped lint passed for the shared action components, display-name provider, holiday components, dashboard, expense header, and profile dropdown.
- Focused tests cover name resolution and stale tenant responses, holiday hover/focus/tap, expense Information permissions, toolbar accessibility, ordinary button behavior, dashboard links, and profile actions.
- Browser visual acceptance remains unverified: the browser connection was unavailable earlier in this session.
- Existing worktree changes were preserved; nothing was committed.
