# Feature workspaces implementation plan

**Goal:** Replace stacked independent tasks with understandable feature tabs and contextual actions.

**Approved design:** Expenses / travel, announcements / direct notifications, and job openings / applicants are separate work areas. Extend the same pattern to other tenant pages that mix tasks. Forms open on request; records remain the default view. Preserve permissions, URLs, filters, drafts, warnings, and existing survey edits. No commits, deployment, or Dart/Flutter commands.

**Architecture:** Reuse the existing accessible Tabs component with a URL-backed page-tab hook and persistent hidden panels. Permission-filter the available tabs before resolving the URL selection. Keep current data ownership and mutation handlers. Do not introduce dependencies.

**Tech stack:** React 18, TypeScript, React Router 6, Vitest, Testing Library.

- [x] Add shared page-tab navigation in `src/components/common/PageTabs.tsx` and `src/hooks/usePageTabs.ts`. Test direct links, back navigation, unknown/inaccessible tabs, preserved query parameters, keyboard selection, and draft preservation in `PageTabs.test.tsx`.
- [x] Separate `ExpensesPage.tsx` into claims and travel; show only the selected domain's header actions. Update authorization tests to exercise both tabs and permission fallback.
- [x] Separate `AdminNotificationsPage.tsx` into announcements, direct notifications, and authorized automation settings. Open composers on demand and retain existing submission/upload/error behavior. Update page tests.
- [x] Separate `RecruitmentPage.tsx` into job openings and applicants. Keep creation with openings and provide a job-to-applicants transition with a visible filter and clear action.
- [x] Apply the pattern to learning (courses/skills), benefits (plans/enrollments/types), compensation (review cycles/bands), expense settings (categories/policies), timesheet settings (attendance adjustment/lock policy/projects/task types), salary setup (components/structures/assignments), and tax settings (configuration/slabs/deductions/computations/declarations where authorized).
- [x] Review notification inbox, company documents, and grievances; separate independent content and open creation forms on demand where useful. Record remaining pages that already have task separation or contain one cohesive workflow.
- [x] Run focused behavior and authorization tests, TypeScript, changed-file lint, production build, and diff checks. Attempt browser validation if a usable local session is available; distinguish static/synthetic checks from signed-in runtime evidence.

**Verification commands:** `node node_modules/vitest/vitest.mjs run <focused test files>`, `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/eslint/bin/eslint.js <changed source files>`, `npm run build`, `git diff --check` from `hrms-ui`.

**Review constraints:** Existing survey files are unrelated dirty work. Do not overwrite them or include them in changed-file checks. Hidden panels preserve local input state but do not grant access: restricted panels must remain permission-gated. Dependent setup steps remain grouped with their results and show explicit next actions.


## Final verification

- 80 tests passed across 14 focused suites, including shared tabs/information, expense permissions, hiring, announcement audiences/uploads, notifications, payroll authorization/workspace flow, document file selection, route registry, and navigation selectors.
- `npm run build` passed (`tsc` and Vite). Build reported existing browser-data age and large-bundle advisories.
- Changed production-source lint was checked on 26 files: 93 findings remain in large pages (size/complexity and existing typing/style rules). The new PageTabs, usePageTabs, pageTabVisibilityContext, and AdminCommunicationWorkspaces files have zero errors/warnings. Full changed-page lint is not clean.
- Scoped `git diff --check` passed. Survey changes were excluded from edits and scoped checks.
- Independent code review found a retained-file/native-input mismatch in document upload; the fix was re-reviewed and the full select/close/reopen/upload/reset flow passes its regression test.
- Browser discovery returned no available connection. Signed-in desktop/mobile visual acceptance remains unverified.
- Review inventory: `docs/ui-feature-workspaces-review-2026-09-11.md`.
- No commit, push, deployment, or data migration performed.
