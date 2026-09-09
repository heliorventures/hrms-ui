# Functional navigation implementation plan

**Goal:** Implement the approved function-based tenant menus, preserving authorization and existing URLs.
**Spec:** `D:/work/heliorventures/HRMS-NAVIGATION-REVIEW-2026-09-09.md`
**Architecture:** A shared destination registry owns functional sections, exact permission paths, contextual URLs and active matching. Shared report and workflow pages consume validated `domain` query parameters and reset state on domain changes. Legacy routes remain reachable without duplicate search results.
**Stack:** React, TypeScript, React Router, Vitest, existing GraphQL client.

## Constraints and rulings

- No commit, deployment, data mutation, or Dart/Flutter commands. Preserve existing dirty work.
- Work in the existing feature checkout; use non-overlapping file ownership for independent subagent tasks, as required by the execution skill. No branch/worktree change is needed for this scoped UI change.
- Preserve permission and scope checks. Context is presentation, never authorization.
- `domain` values for workflows: `leave`, `timesheets`, `expenses`. Reports: `people`, `attendance`, `leave`, `timesheets`, `payroll`.
- Reports only get contextual entries if a supported report exists with safe domain boundaries. The pending-requests backend currently has no domain filter; do not expose a misleading Expenses Reports entry or relabel mixed-domain data. Keep the central pending report until a separate backend report change supports that scope.
- Existing generic workflows default to Leave; invalid workflow domains fail closed to an invalid-view message. Generic reports retain All Reports; invalid domains do not load report data.
- User approved combining the concurrent My Work and Performance changes: preserve My Work (My Tasks, Notifications, Completed / Archive) and direct Performance. This supersedes the original notification-only-in-header and Performance-under-Talent recommendations.

## Tasks

- [x] Navigation: update `src/navigation/navigationModel.ts`, `workplaceDestinations.ts`, `navigationSelectors.ts`, Sidebar, SidebarSection, SidebarDestination, and CommandPalette. Add regression cases in selectors and layout tests before implementation. `activeNavigationDestination(url, destinations?)` chooses the most-specific route/query match; `activeNavigationSection(url, destinations?)` derives its section. Destinations use `accessPath?: string` and `accessPaths?: readonly string[]` for exact permission targets and report alternatives. Keep independent paths for search and links. Use `groupNavigationDestinations(accessibleDestinations(...))` so an approval-only user gets the function parent without needing its overview permission.
- [x] Workflows: add domain parsing/filtering to `AdminWorkflowsPage.tsx` and `workflowSetup.ts`, with component/helper tests. Restrict create choices, existing definitions/steps, requests, and mutation targets to the domain. Remount editor on URL domain or authorization identity changes. Tests exercise domain switches and confirm expense views exclude leave/timesheet records.
- [x] Reports: extend `reportCatalog.ts`, `AdminReportsPage.tsx` with validated domain and URL-backed report selection. Permission-filter first and domain-filter second. Tests verify a leave-only view cannot select payroll through a crafted URL, unsupported/invalid domains make no request, and navigation changes reset visible data. Reuse existing report rendering and export filters.
- [x] Labels/compatibility: revise obsolete workbench copy and duplicate Compensation headings, fix payroll search terminology, retain old redirects and employee-detail routes. Check registry coverage tests for intentional hidden destinations and query URLs.
- [x] Integration: run focused navigation/layout/route/auth/workflow/report tests; TypeScript; changed-file ESLint; production build. Review combined diffs and permissions. Document outcomes and any signed-in browser limitations in the root review artifact. Leave all changes uncommitted.

## Verification examples

```ts
expect(activeNavigationSection('/hr/leaves')).toBe('leave');
expect(activeNavigationSection('/admin/reports?domain=leave')).toBe('leave');
expect(activeNavigationSection('/workplace/workflows?domain=timesheets')).toBe('timesheets');
```

Run focused tests with `npx vitest run src/navigation src/components/layout/SidebarSection.test.tsx src/components/layout/SidebarDestination.test.tsx src/routes/routeRegistry.test.ts src/auth/permissionService.test.ts` and the new report/workflow suites. Run `npx tsc --noEmit`, then scoped ESLint and `npm run build`.

## Execution record

- Initial worktree: `codex/ui-ux-modernization`. Existing dirty Modal, pre-joining and Assets files excluded from task ownership.

