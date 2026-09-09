# UI click reduction implementation plan

Goal: implement the approved UI-CLICK-REDUCTION-AUDIT-2026-09-10.md findings, preserving existing working-tree changes and server authority.

Execution: use subagent-driven-development for independent owned tasks, with parent integration/review. Work in the existing feature branches because the approved design depends on their uncommitted UI. No commits, deployment, database writes, or Dart/Flutter commands.

- [x] Attendance task: preserve employee/date for Add segment without reusing an editing ID; configure mobile rows. Own HrAttendanceManagementPage, attendance/ManagedAttendanceTable, AttendanceRegularizationModal, managedAttendanceTypes and associated tests. Add historical-row creation regression, run it red, implement context transport, run focused tests.
- [x] Leave entry task: connect Dashboard Request leave to existing ?apply=1 route; initialize untouched end date from start; protect dirty dismissal in ApplyLeaveModal. Own Dashboard and ApplyLeaveModal/fields and their tests. Verify same-day/multi-day semantics, dismissal and direct link.
- [x] Queue server task: introduce a scoped filtered queue with matching count and pagination, including Needs my action using existing workflow authority. Own kabipay-leave resolver/service additions and associated tests. Preserve all existing API behavior, scope and expected-step mutation checks; validate status/date/page inputs and more-than-120 reachability.
- [x] Parent integration task: wire HR queue query and pager, reorder queue first, compact mobile leave rows, restore non-sensitive route filters and periods with identity isolation. Own generated API integration, HrLeavesPage, LeaveRequestsTableSection, shared route state and personal LeavePage/AttendancePage.
- [x] Review/test: focused Rust and UI tests, changed-file lint, type checking/build where available. Review each task diff, address meaningful failures, update this file with verification and remaining browser/deployment gaps.

Interface decisions: server agent will define and communicate queue schema before UI integration. Attendance agent will leave general route-state work to parent. Parent will coordinate HR attendance state edits after attendance task finishes. Runtime browser is unavailable from prior discovery; source/tests cannot establish signed-in acceptance.

Ruling: approved future considerations (bulk actions, unified inbox, exception filters) remain deferred as explicitly stated in the audit; implement the six prioritized findings.

## Implementation and verification ledger

- Server queue implemented with exact existing workflow authority before counting/pagination; bounded 200-row keyset scan avoids the old 120-request cutoff. `cargo test -p kabipay-leave --bin kabipay-leave`: 54 passed. Exact counts require scanning authorized pending requests and have not been load-benchmarked; the scan is not an atomic database-wide snapshot.
- Historical Add, compact managed attendance mobile rows, and route/private search restoration implemented. Final context/page tests: 17 passed; modal 10 and table 4 also passed. After extracting view/context tests, baseline lint comparison found zero new diagnostics; 26 inherited diagnostics remain.
- Home direct leave entry, untouched end-date initialization, and explicit discard protection implemented. Focused Dashboard/form suites: 23 passed; final modal recheck: 16 passed. New helpers/Dashboard lint clean; 10 inherited modal/test lint diagnostics remain.
- Compact leave decisions precede secondary metadata; mobile rows retain decision evidence. Table/leave rows/personal leave tests: 13 passed. Touched production table lint clean.
- Shared router-owned view memory and personal attendance tests: 18 passed before final helper-only complexity extraction. Cache identity includes tenant/user/permissions; a page-local GraphQL client cannot own return-navigation memory. HR private employee search remains transient and out of URLs. Opaque attendance cursors intentionally restart after remount/date changes.
- HR queue integrates selected status/actionability, matching total, scope counts, pagination, stale-response ownership, post-mutation error preservation, and lost-focus recovery. Final queue tests: 5 passed; shared route-memory tests: 4 passed after helper extraction. TypeScript `tsc --noEmit` and production `vite build` passed. Final generated scalar mappings are ISO/RFC3339/UUID strings; a final typecheck is recorded below.
- Schema export was delayed by unrelated workspace Cargo checks. Exported leave SDL is in `D:\work\heliorventures\.codex-tmp\leave-queue-schema-2026-09-10.graphql`. The queue client is generated with `node scripts/generate-leave-queue-client.mjs --schema-path ../.codex-tmp/leave-queue-schema-2026-09-10.graphql`. Without that optional argument the script compiles/exports the leave schema itself.
- `upcomingHolidays` belongs to another subgraph: its established selection is fetched separately in parallel with the generated leave board. Holiday failure still prevents board publication, preserving the prior board's dependency behavior.

Concurrent unrelated heading/layout/profile and Rust changes appeared during execution. They were preserved and are not attributed to this task. No commit, deployment, tenant migration, or live business-data writes were performed. No browser was connected and local gateway port 4009 was unavailable; rendered/signed-in acceptance and real end-to-end click timings remain open.

## Final check summary

- 91 unique focused UI tests passed across the affected suites (reruns not counted twice), plus 54 leave-service Rust tests. Final review found and reproduced a last-row/nonzero-page focus regression; all 6 queue tests pass after recovering lost focus before automatic page correction. Scoped re-review found no further issues.
- Generated operation validation against actual exported leave SDL passed. Reproducible command: `npm run codegen:leave-queue`; `-- --schema-path <SDL>` avoids compiling an exporter when an up-to-date export is already available.
- Queue/view helpers, queue controls/tests, leave table and shared Table lint clean. HR queue page continues to exceed its pre-existing function-length, statement-count, and complexity limits. This is not a clean repository lint result. Existing form/attendance lint diagnostics are documented above.
- Final production rebuild passed (2561 modules; 26.65 seconds) with outdated Browserslist-data and large-chunk warnings; these were not changed as part of this task. An intermediate recheck failed on a concurrent `ClockPlus` import in `pageActionsContext.ts`; concurrent work replaced it with supported `CalendarClock` before the successful final typecheck/build. No additional icon edit was made by this task.
- Final typecheck after explicit generated scalar mappings: passed (`node node_modules/typescript/bin/tsc --noEmit --pretty false`, exit 0).
- Rollout requires rebuilding/restarting the leave service, refreshing the gateway's stitched schema, and deploying the UI together. No database migration is required by the new queue. No rollout was executed.
- Remaining runtime checks: signed-in employee/manager/HR flows; mobile/keyboard visual acceptance; production scope/data behavior; large-queue latency; actual task click/time measurements. Static action-path improvement remains Home -> leave form: 2 -> 1 activations, excluding field entry and loading.
