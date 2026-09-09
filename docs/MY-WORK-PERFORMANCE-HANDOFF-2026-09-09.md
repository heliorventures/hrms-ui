# My Work and Performance

## Implemented scope

- My Work groups My Tasks, Notifications, and Completed / Archive. Performance is a separate menu destination.
- `/my-work/tasks` and `/my-work/completed` load employee-scoped appraisal and survey assignments. HR users use the same personal queries; administrative permissions do not trigger tenant-wide queries here.
- Pending entries link to a specific review or respondent-only survey. Survey response windows match the server's open/close checks. Failed data sources show an error rather than an empty-success message.
- Archive includes self-review submissions, acknowledgements, completed appraisals, and anonymous survey completion receipts. Anonymous survey answers are not attached to named archive records.
- `/performance` offers permission-scoped My Performance, Team Reviews, Setup, Process, and Review tabs. The old `/workplace/performance` route still works. Legacy cycle/goal tools are expandable within Setup.
- Loading is keyed by action and affected record/program. Duplicate actions are guarded synchronously. Setup drafts survive tab switches; detail refreshes preserve entered answers; stale review/template responses are ignored. Submitted appraisal answers are read-only.
- Existing server authorization and lifecycle transitions are reused. No migrations, live data writes, deployments, or commits were performed.

## Main files

- `src/modules/my-work/MyWorkPage.tsx`, `myWorkTasks.ts`: personal work, history and direct task links.
- `src/modules/workplace/PerformancePage.tsx`: permission-scoped tabs and legacy entry point.
- `src/modules/workplace/PerformanceLifecyclePanel.tsx`: scoped fetching, actions, review detail and draft preservation.
- `src/modules/workplace/LegacyPerformanceCatalog.tsx`: existing legacy catalog relocated from PerformancePage.
- `src/modules/workplace/SurveysPage.tsx`, `surveyAvailability.ts`: respondent-only task entry, submission state and response windows.
- `src/hooks/useKeyedAction.ts`: operation loading and duplicate submission guard.
- `src/routes/appRouteConfig.tsx`, `src/auth/permissionService.ts`, `src/navigation/*`: routes, access and menu grouping.

## Verification

- Full focused run: 67 tests passed across permissions, routes, personal work, navigation, Performance, surveys, and keyed actions.
- Subsequent response-window/list check: 8 tests passed, including the new expired/future survey test.
- Final per-record loading and Performance check: 6 tests passed. Final Vite bundle rerun passed (2,543 modules). Affected-file `git diff --check` passed.
- Standalone Vite production bundle passed. Existing bundle-size and Browserslist-age warnings remain.
- TypeScript passed earlier; the later combined `npm run build` was blocked by concurrent changes in `src/modules/admin/AdminWorkflowsPage.test.tsx` (HTMLElement.value at lines 132, 138, 160) and `src/modules/admin/workflowSetup.ts` (never-typed includes arguments at lines 48, 53). Those files are outside this task and were preserved.
- Targeted ESLint reports no findings in the new task/list/projection/helper files, PerformancePage, their tests, new route inventory, or new navigation test. Shared permissionService and the existing large Performance/Survey/legacy implementations still have structural lint findings. HEAD-source comparison confirms the large-component complexity/length and legacy nested-condition findings predate this work; lint is not globally clean.
- Browser runtime returned no available browsers. No signed-in visual/runtime acceptance is claimed.

## Review boundaries

Other sessions changed functional navigation, workflow/report screens, common page information, and assets while this task ran. Their edits were preserved. Review by file scope rather than treating the whole dirty checkout as this task's changes.

Before release, resolve the unrelated combined-build errors and verify the menus and forms in signed-in employee, manager and HR sessions. Check survey submission → archive, self-review → acknowledgement, and cycle advancement with real data. This implementation does not establish live gateway/database availability.
