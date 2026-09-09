# HRMS approvals, attendance, and leave: UI friction audit

Implementation follow-up: [changes and verification](UI-CLICK-REDUCTION-IMPLEMENTATION-2026-09-10.md). The findings below describe the pre-implementation snapshot, not the final working tree.

Date: 2026-09-10. Scope: current `D:\work\heliorventures\hrms-ui` working tree, branch `codex/ui-ux-modernization`, HEAD `15da91522fcca332c20f76f98487d2e77e6b6c1b` plus existing uncommitted work. User approved an audit and proposal, not implementation.

## Evidence and counting method

Source inspection confirms component wiring, state ownership, and rendered controls. Browser discovery returned no connected browsers; no signed-in navigation, actual pointer counts, screenshots, timing, or mobile rendering were verified. No application code changed, tests/builds ran, or business records were modified. Existing navigation/dashboard changes were preserved.

Counts below are source-derived action-button/link activations from a stated starting screen. Field entry, keyboard navigation, native date-picker interactions, scrolling, permission prompts, loading, and retries are excluded. Field reductions are reported separately. They are not measured end-to-end user click totals.

## Before/after task paths

| Task and starting point | Current path | Proposed path | Action count / benefit |
|---|---|---|---|
| Open leave form from Home | Request leave → leave page → Apply for leave | Request leave → form on leave page | 2 → 1 |
| Submit full-day leave from Home | Above, enter type/from/to/reason, Submit Application | Direct form, choose type/from/reason, review defaulted end date, Submit | 3 → 2 actions; one fewer date entry for same-day requests |
| Approve eligible leave from visible request row | Approve | Approve | 1 → 1; preserve existing efficiency |
| Reject leave from visible request row | Reject → enter reason → Reject request | Same flow | 2 → 2; keep required reason |
| Punch from Home with ready summary | Punch In or Punch Out | Same flow | 1 → 1; location permission interactions excluded |
| Correct existing attendance from visible row | Adjust → edit fields → Update | Same contextual editor | 2 → 2; already prefilled |
| Add segment from historical HR attendance row | Add segment → replace today's date → enter fields → Save segment | Add segment → retain row date → enter fields → Save segment | 2 → 2 actions; removes one date entry and a wrong-date risk |
| Return to HR leave Approved tab after leaving route | Reopen route → select Approved again | Reopen route with restored tab | 1 → 0 extra tab activations after reopening |
| Return to a previously selected attendance month | Reopen route → restore month/year | Reopen route with restored period | Removes repeated period selection; exact pointer savings depend on input method |

## Prioritized findings and permanent solutions

### P1 — Complete the approval queue before optimizing it

`src/modules/hr/HrLeavesPage.tsx:41`, `:80`, `:183`, `:188`: HR loads a maximum of 120 requests, calculates Pending from that loaded slice, and filters status locally. No request offset/pager is wired on this page. The summary does disclose the request limit, but its Pending Approvals number is still a slice count and includes pending rows regardless of `viewerMayApprove`.

`src/api/documents/clientOperations.graphql:1639`: the shared operation already supports offset and retrieves a total count, but does not pass a status/actionability filter. An older pending request outside the first returned slice cannot be reached through this page. This is a source-confirmed reachability limitation; whether any tenant currently exceeds the limit was not checked.

Proposal: paginate the complete authorized queue, apply status filtering before pagination, and distinguish “Needs my action” from “Pending in scope.” Compute matching totals server-side. Reuse the existing pagination contract where possible; inspect service/gateway filtering and authorization before implementation. Do not fix this by increasing the cap or filtering only one client page.

Acceptance: a dataset with more than 120 mixed-status requests exposes every matching item, including an older pending request. Counts and rows agree for each scope/filter. Self-approval and stale workflow steps remain rejected by the server.

### P1 — Carry the selected attendance date into Add segment

`src/modules/hr/attendance/ManagedAttendanceTable.tsx:98`: Add passes only `managedAttendanceEmployee(row)`. `src/modules/hr/HrAttendanceManagementPage.tsx:267` stores only that employee for Add. `src/modules/hr/attendance/AttendanceRegularizationModal.tsx:99` consequently defaults the work date to today; Adjust correctly uses the editing row.

Proposal: pass explicit add context containing employee and work date. Initialize a new segment for that date without passing an editing ID. Keep times visibly editable; do not infer actual worked time from shift defaults.

Acceptance: Add from a historical row retains its employee/date and creates a new segment. Adjust continues updating the selected segment. Existing overlap, date-policy, tenant, and permission checks still apply.

### P2 — Connect Home's request action to the existing form entry point

`src/modules/dashboard/Dashboard.tsx:22` links Request leave to `/leave`. `src/modules/leave/LeavePage.tsx:95` already consumes `?apply=1` and opens the form when authorized.

Proposal: use the existing `/leave?apply=1` entry point. Keep the existing permission gates and shared form. A second dashboard form would duplicate validation and policy behavior.

Acceptance: one activation opens the form; success refreshes the board; Back/close behaves predictably; users without submission permission cannot open or submit it.

### P2 — Preserve useful navigation context

`src/modules/attendance/AttendancePage.tsx:86`: month/year are local state. `src/modules/leave/LeavePage.tsx:68`: year/page are local state. `src/modules/hr/HrLeavesPage.tsx:52`: status resets to Pending on remount. `src/modules/hr/HrAttendanceManagementPage.tsx:73`: filters and cursor history are component-owned.

Proposal: encode non-sensitive period, tab, and pagination state in validated URL parameters. Restore the last route/view during normal in-app navigation; URL support alone does not make a sidebar link remember prior state. Keep employee search text in tenant/user-scoped transient state rather than automatically putting names in URLs. Clear owned state on identity/tenant changes and reset pagination when filters change.

Acceptance: Back/Forward, navigation away/return, and reload restore supported views. Invalid parameters recover safely. A different tenant/user cannot inherit another user's search or cached records.

### P2 — Make approval decisions visible without scanning a wide table

`src/modules/leave/components/LeaveRequestsTableSection.tsx:122`: 11 base columns plus optional Employee, Actions, and My Request columns; Approve/Reject appear after History. `src/components/common/Table.tsx:32` forwards no mobile configuration. `src/components/common/DataTable.tsx:103` enables its existing mobile alternative only when configured; otherwise `:206` uses a horizontally scrollable table. HR attendance also supplies no mobile alternative.

`src/modules/hr/HrLeavesPage.tsx:287`: summary cards, team calendar, and comp-off panel precede the Requests section. How much scrolling this creates depends on viewport and live data.

Proposal: put the actionable queue immediately after a compact summary/filter row. Use an explicit mobile row with employee, date range, duration, status/stage, reason, and decision controls. Combine From/To into a date range and place secondary history/document metadata in an accessible details panel. Reuse DataTable's mobile support. Keep important decision evidence visible; do not hide every action in an overflow menu.

Acceptance: at narrow and desktop widths, decision controls and necessary context are reachable without horizontal searching. Keyboard focus survives refresh/removal of an approved row. Verify real long names/reasons and empty/loading/error states. Click benefit is unquantified; expected benefit is reduced scanning/scrolling.

### P2 — Reduce repeated leave entry and accidental re-entry

`src/modules/leave/components/ApplyLeaveModal.tsx:64`, `:169`: both dates start empty and changing From does not initialize To. `:139` closes by resetting the whole form. `:358` permits dismissal whenever submission is idle.

Proposal: initialize To from From only while To is untouched, keep that value visibly editable, and preserve intentional multi-day choices. Do not silently choose a leave type when multiple valid options exist. Protect a dirty form with an explicit discard choice or a same-session draft; avoid persistent storage of reasons/documents without a separate design decision.

Existing strengths: field-level errors and first-error focus already exist (`:150`); document and half-day fields are conditional (`ApplyLeaveFormFields.tsx:145`, `:171`). Retain them.

Acceptance: same-day entry needs one date; changing From never overwrites an explicitly edited To; intentional half-day/multi-day cases remain correct; accidental dismissal does not silently erase input.

## Existing improvements to retain

- Direct leave approval with `viewerMayApprove` and expected workflow step (`LeaveRequestsTableSection.tsx:65`, `:82`). Approval can record one step while leaving the overall request pending; preserve that distinction.
- Home punching already acts directly (`src/modules/dashboard/components/PunchInOut.tsx:259`).
- Attendance row Adjust already carries date/times (`AttendancePage.tsx:421`, `:483`).
- HR attendance filters already apply on change; no extra Apply button is needed (`ManagedAttendanceFilters.tsx:25`, `:59`).
- Compact attendance summary and collapsed guidance already exist (`AttendancePage.tsx:386`, `:431`).
- Existing uncommitted header/sidebar/notification/dashboard work was considered current evidence and left untouched.

## Sequence and remaining validation

1. Resolve complete-queue reachability and Add-segment context.
2. Connect the existing leave deep link; add date initialization and view-state restoration.
3. Reorder the queue and configure mobile rows; verify interaction and focus in a signed-in browser.
4. Consider exception filters, unified approval inbox, and bulk actions only after complete server-filtered datasets and exact per-record authority are established. These are proposals, not confirmed missing backend capabilities. Batch actions can add clicks for small selections; measure representative workloads before adding them.

Implementation checks should cover over-cap queues, workflow races, cross-tenant state reset, date ownership, multi-day leave, and route restoration. Browser acceptance must record actual end-to-end clicks/time and errors for employee, manager, and HR roles, plus keyboard and narrow-screen tasks. No production transaction is needed for this audit; runtime acceptance should use approved test records.

Review reference: [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), particularly URL state, form error focus, unsaved changes, and keyboard interaction. Source facts above are grounded in the listed local files; runtime outcomes remain unverified.
